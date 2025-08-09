
import React from 'react';
import { EyeIcon } from './Icons';

export function Header(): React.ReactNode {
  return (
    <header className="w-full max-w-2xl text-center mb-6">
      <div className="flex items-center justify-center gap-3">
        <EyeIcon className="w-10 h-10 text-indigo-400" />
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          Detector de Colores IA
        </h1>
      </div>
      <p className="text-gray-400 mt-2">
        Apunta con tu cámara a un objeto para identificar su color.
      </p>
    </header>
  );
}
