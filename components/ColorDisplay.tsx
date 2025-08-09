
import React from 'react';
import type { ColorResult } from '../types';

interface ColorDisplayProps {
  result: ColorResult;
}

export const ColorDisplay: React.FC<ColorDisplayProps> = ({ result }) => {
  const { colorName, hexCode } = result;

  const handleCopyHex = () => {
    navigator.clipboard.writeText(hexCode);
  };

  return (
    <div className="fade-in bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-sm mx-auto text-center shadow-xl">
      <div 
        className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-gray-600 shadow-md"
        style={{ backgroundColor: hexCode }}
      ></div>
      <h2 className="text-3xl font-bold text-white capitalize">{colorName}</h2>
      <p 
        className="font-mono text-gray-400 mt-1 text-lg cursor-pointer hover:text-cyan-400 transition-colors"
        onClick={handleCopyHex}
        title="Copiar código hexadecimal"
      >
        {hexCode}
      </p>
    </div>
  );
};
