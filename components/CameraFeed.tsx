
import React, { useEffect } from 'react';

interface CameraFeedProps {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function CameraFeed({ stream, videoRef }: CameraFeedProps): React.ReactNode {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    ></video>
  );
}
