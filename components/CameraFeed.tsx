
import React from 'react';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraActive: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ videoRef, isCameraActive }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <p className="mt-2">Activa la cámara para empezar</p>
        </div>
      )}
    </div>
  );
};
