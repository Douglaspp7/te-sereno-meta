import React from "react";

interface CustomVideoPlayerProps {
  url: string;
}

export function CustomVideoPlayer({ url }: CustomVideoPlayerProps) {
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
      <video
        className="w-full h-full absolute inset-0 object-contain"
        controls
        src={url}
      >
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  );
}
