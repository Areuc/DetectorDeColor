
import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraFeed } from './components/CameraFeed';
import { ColorDisplay } from './components/ColorDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Icon } from './components/Icons';
import { detectColor } from './services/geminiService';
import type { ColorResult } from './types';

const App: React.FC = () => {
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [colorResult, setColorResult] = useState<ColorResult | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        streamRef.current = null;
        setIsCameraActive(false);
    }, []);

    const handleActivateCamera = async () => {
        setError(null);
        setColorResult(null);
        if (streamRef.current) {
            stopCamera();
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            setError("No se pudo acceder a la cámara. Asegúrate de haber dado permiso en tu navegador.");
        }
    };

    const handleStopCamera = () => {
        stopCamera();
        setColorResult(null);
        setError(null);
    };

    const handleIdentifyColor = useCallback(async () => {
        if (!videoRef.current || !videoRef.current.srcObject) return;

        setIsLoading(true);
        setError(null);
        setColorResult(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        const MAX_DIMENSION = 512;
        const scale = MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight);
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) {
            setError("No se pudo obtener el contexto del lienzo.");
            setIsLoading(false);
            return;
        }
        context.drawImage(video, 0, 0, width, height);

        const base64Image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            // The `detectColor` function now calls our secure backend API.
            // We pass the AbortController's signal to it to handle the timeout.
            const result = await detectColor(base64Image, controller.signal);
            setColorResult(result);
        } catch (err) {
            console.error(err);
             if (err instanceof Error && err.name === 'AbortError') {
                setError("La solicitud tardó demasiado. Inténtalo de nuevo.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido.");
            }
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    }, []);

    const ActionButton: React.FC<{onClick: () => void; disabled: boolean; className: string; icon: 'magic' | 'stop' | 'camera'; children: React.ReactNode}> = ({onClick, disabled, className, icon, children}) => (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled}
            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            <Icon name={icon} className="w-5 h-5" />
            {children}
        </button>
    );

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col font-sans">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 gap-6">
                <CameraFeed videoRef={videoRef} isCameraActive={isCameraActive} />
                <div className="flex items-center justify-center gap-4">
                    {!isCameraActive ? (
                        <ActionButton onClick={handleActivateCamera} disabled={isLoading} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:ring-cyan-500" icon="camera">
                            Activar Cámara
                        </ActionButton>
                    ) : (
                        <>
                            <ActionButton onClick={handleIdentifyColor} disabled={isLoading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:ring-green-500" icon="magic">
                                Identificar Color
                            </ActionButton>
                            <ActionButton onClick={handleStopCamera} disabled={isLoading} className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 focus:ring-red-500" icon="stop">
                                Detener Cámara
                            </ActionButton>
                        </>
                    )}
                </div>
                
                <div className="h-48 flex items-center justify-center w-full max-w-sm">
                    {isLoading && <LoadingSpinner />}
                    {error && !isLoading && (
                        <div role="alert" className="fade-in flex flex-col items-center gap-2 text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                           <Icon name="error" className="w-8 h-8"/>
                           <p className="font-semibold">{error}</p>
                        </div>
                    )}
                    {colorResult && !isLoading && !error && <ColorDisplay result={colorResult} />}
                </div>
            </main>
            <footer className="text-center p-4 text-gray-500 text-sm">
                Desarrollado con React y Gemini API.
            </footer>
        </div>
    );
};

export default App;
