import {useGuestWallet} from "@/app/providers/guest-mode";
import React, {useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import {useAccount, useWalletClient} from "wagmi";
import {PushAPI, CONSTANTS, TYPES} from "@pushprotocol/restapi";

import Video from "./app-components/video";
import {Button} from "./ui/button";
import {useSocket} from "@/app/providers/socket-provider";

const LoggedInView = () => {
  const {socket} = useSocket();
  const [pushUser, setPushUser] = useState<PushAPI | null>(null);
  const userVideo = useRef<any | null>(null);
  const {address: userWalletAddress} = useAccount();
  const {data: signer} = useWalletClient();
  const {signer: guestWalletSigner} = useGuestWallet();
  const [data, setData] = useState(CONSTANTS.VIDEO.INITIAL_DATA);

  const [liveUsers, setLiveUsers] = useState<number>(0);
  const [isCurrentlyBusy, setIsCurrentlyBusy] = useState<boolean>(false);

  const initialisePushUser = async (signer: any) => {
    if (!signer) return;
    if (pushUser) return;
    const userAlice = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
    });
    setPushUser(userAlice);
    const stream = await userAlice.initStream([
      CONSTANTS.STREAM.VIDEO,
      CONSTANTS.STREAM.CHAT,
      CONSTANTS.STREAM.CHAT_OPS,
    ]);
    stream.on(CONSTANTS.STREAM.CHAT, async (data: any) => {
      if (data.event === "chat.request") {
        console.log("chat request event", data);
        const chatStatus = await userAlice.chat.info(data.from);
        if (chatStatus && chatStatus.list === "REQUESTS") {
          console.log("accepting chat request from", data.from);
          await userAlice.chat.accept(data.from);
          // Adding a 15-second sleep
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
      }
    });
    stream.on(CONSTANTS.STREAM.CHAT_OPS, async (data: any) => {
      console.log("chat ops event", data);
    });
    stream.on(CONSTANTS.STREAM.VIDEO, async (eventData: TYPES.VIDEO.EVENT) => {
      if (eventData.event === CONSTANTS.VIDEO.EVENT.APPROVE) {
        setIsCurrentlyBusy(true);
      }
      if (eventData.event === CONSTANTS.VIDEO.EVENT.CONNECT) {
        setIsCurrentlyBusy(true);
      }
      if (eventData.event === CONSTANTS.VIDEO.EVENT.DISCONNECT) {
        setIsCurrentlyBusy(false);
      }
    });

    // userAlice.video.initialize(onChange, {options?});
    userVideo.current = await userAlice.video.initialize(setData, {
      stream: stream, // pass the stream object, refer Stream Video
      config: {
        video: true, // to enable video on start, for frontend use
        audio: true, // to enable audio on start, for frontend use
      },
    }); // Connect stream, Important to setup up listen first
    stream.connect();
    socket.on("peer_found", async (peer: string) => {
      console.log("peer found", peer);

      const chatStatus = await userAlice.chat.info(peer);
      console.log("chat status", chatStatus);
      if (chatStatus && chatStatus.list === "UNINITIALIZED") {
        console.log("sending chat request to", peer);
        await userAlice.chat.send(peer, {
          type: "Text",
          content:
            "This is message generate by omegle-push to intialize chat. Please Ignore.",
        });

        socket.emit("chat_request_sent", peer);
      }

      if (chatStatus && chatStatus.list === "CHATS") {
        console.log("requesting video", peer);
        await userVideo.current.request([peer]);
        console.log("video requested", peer);
        socket.emit("chat_request_accepted_and_video_request_sent", peer);
      }
    });

    socket.on("incoming_chat_request", async (peer: string) => {
      console.log("incoming chat request", peer);

      let chatStatus = await userAlice.chat.info(peer);
      while (chatStatus.list !== "CHATS") {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
        chatStatus = await userAlice.chat.info(peer);
      }

      await userVideo.current.request([peer]);
      console.log("video a", peer);
      socket.emit("chat_request_accepted_and_video_request_sent", peer);
    });

    socket.on("incoming_video_request", async (peer: string) => {
      console.log("incoming video request", peer);
      console.log(data);
    });
  };

  const approveCall = async () => {
    while (data.incoming[0].status !== CONSTANTS.VIDEO.STATUS.CONNECTED) {
      if (
        data.incoming[0].address !== "" &&
        data.incoming[0].status === CONSTANTS.VIDEO.STATUS.RECEIVED
      ) {
        await userVideo.current.approve();
        socket.emit("video_call_accepted", data.incoming[0].address);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    }
  };
  useEffect(() => {
    approveCall();
  }, [data]);

  useEffect(() => {
    console.log("data changed", data);
  }, [data]);
  useEffect(() => {
    if (!userWalletAddress && !guestWalletSigner?.address) return;
    if (!signer && !guestWalletSigner) return;
    if (socket) {
      if (userWalletAddress) {
        socket.emit("user_connected", userWalletAddress);
        initialisePushUser(signer);
      } else if (guestWalletSigner?.address) {
        socket.emit("user_connected", guestWalletSigner?.address);
        initialisePushUser(guestWalletSigner);
      }
      socket.on("active_users_count", (data: number) => {
        setLiveUsers(data);
      });
    }
  }, [signer, guestWalletSigner]);

  const triggerConnection = () => {
    console.log("triggering connection");

    socket.emit("find_a_peer");
  };

  return (
    <div className="">
      {isCurrentlyBusy ? (
        <Video data={data} />
      ) : (
        <div className="flex flex-col justify-center items-center w-[96%] m-auto">
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 px-6 text-center">
            gm anon, stay online while someone triggers a connection in the
            network or try triggering a connection yourself
          </h2>
          <p className="mt-4 text-center italic">
            You&apos;re automatically set as online, you will be connected to a
            random user in the network.
          </p>

          <div className="flex flex-row gap-2 my-4">
            <Button variant="default" onClick={triggerConnection}>
              Trigger a connection
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-row gap-2 items-center absolute bottom-6 right-8">
        <p className="font-bold text-gray-200 mr-4">{liveUsers}</p>
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#5aff75ab] border-none bg-opacity-70 shadow-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoggedInView;
