import React from "react";
import VideoPlayer from "./video-player";
import {TYPES} from "@pushprotocol/restapi";
interface VideoProps {
  data: TYPES.VIDEO.DATA;
}
const Video: React.FC<VideoProps> = ({data}) => {
  return (
    <div>
      <p className="text-center text-2xl font-semibold tracking-tight first:mt-0 px-6">
        hello
      </p>
      <VideoPlayer
        stream={data.incoming[0].stream!}
        isMuted={data.incoming[0].audio ?? false}
        whoIs={data.incoming[0].address}
      />

      <VideoPlayer
        stream={data.local.stream!}
        isMuted={data.local.audio ?? false}
        whoIs={data.local.address}
      />
    </div>
  );
};

export default Video;
