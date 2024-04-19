import React from "react";
import {Button} from "./ui/button";
import WalletConnectButton from "./app-components/connect-wallet-button";
import {useGuestWallet} from "@/app/providers/guest-mode";
import {ethers} from "ethers";
const LoggedOutView = () => {
  const {setSigner, signer} = useGuestWallet();
  const createGuestWallet = () => {
    if (signer) return;
    const newSigner = ethers.Wallet.createRandom();
    setSigner(newSigner);
  };
  return (
    <div className="flex flex-col justify-center items-center w-[96%] m-auto">
      <h2 className="scroll-m-20 border-b pb-2 text-4xl font-semibold tracking-tight first:mt-0 px-6 text-center">
        gm anon, ready to dox and chat with degens?
      </h2>
      <p className="mt-4 text-center italic">
        Strap in, mask off, and let&apos;s dox and dazzle with fellow degens
      </p>

      <div className="flex flex-row gap-2 my-4">
        <Button variant="default" onClick={createGuestWallet}>
          Guest Mode
        </Button>

        <WalletConnectButton />
      </div>
    </div>
  );
};

export default LoggedOutView;
