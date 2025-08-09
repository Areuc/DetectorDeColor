
import React from 'react';
import { Icon } from './Icons';

export const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6 text-white border-b border-gray-700">
    <div className="flex items-center justify-center gap-3">
      <Icon name="eye" className="w-8 h-8 text-cyan-400" />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
        Detector de Colores IA
      </h1>
    </div>
    <p className="mt-2 text-gray-400 text-sm md:text-base">
      Apunta tu cámara a un objeto para identificar su color predominante.
    </p>
  </header>
);
