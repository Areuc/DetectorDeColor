
import React, { useState, useRef, useCallback } from 'react';
import { detectColorFromImage } from './services/geminiService';
import { type ColorResult } from './types';
import { Header } from './components/Header';
import { CameraFeed } from './components/CameraFeed';
import { ColorDisplay } from './components/ColorDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { CameraIcon, StopCircleIcon, SparklesIcon } from './components/Icons';

export default function App(): React.ReactNode {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [colorResult, setColorResult] = useState<ColorResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setColorResult(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios.");
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
    setColorResult(null);
  }, [stream]);

  const handleDetectColor = useCallback(async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setError(null);
    setColorResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      const base64ImageData = imageDataUrl.split(',')[1];
      
      try {
        const result = await detectColorFromImage(base64ImageData);
        setColorResult(result);
      } catch (err) {
        console.error(err);
        setError("No se pudo identificar el color. Inténtalo de nuevo.");
      }
    } else {
        setError("No se pudo procesar la imagen de la cámara.");
    }

    setIsLoading(false);
  }, [videoRef]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="w-full max-w-2xl flex flex-col items-center flex-grow">
        <div className="w-full aspect-w-16 aspect-h-12 bg-gray-800 rounded-lg overflow-hidden shadow-2xl relative mb-4">
          <CameraFeed videoRef={videoRef} stream={stream} />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <CameraIcon className="w-16 h-16 text-gray-500 mb-4" />
              <p className="text-gray-400">Activa la cámara para empezar a detectar colores.</p>
            </div>
          )}
        </div>

        {error && (
            <div className="w-full p-3 mb-4 bg-red-800/50 text-red-200 rounded-lg border border-red-700 text-center">
                {error}
            </div>
        )}
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="col-span-1 sm:col-span-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-200 transform hover:scale-105"
            >
              <CameraIcon className="w-6 h-6" />
              Activar Cámara
            </button>
          ) : (
            <>
              <button
                onClick={handleDetectColor}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-6 h-6" />}
                {isLoading ? 'Analizando...' : 'Identificar Color'}
              </button>
              <button
                onClick={stopCamera}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-200 transform hover:scale-105"
              >
                <StopCircleIcon className="w-6 h-6" />
                Detener Cámara
              </button>
            </>
          )}
        </div>
        
        {colorResult && !isLoading && (
            <ColorDisplay result={colorResult} />
        )}
      </main>
      <footer className="text-gray-500 text-sm mt-8">
        Creado para ayudar a la comunidad.
      </footer>
    </div>
  );
}
