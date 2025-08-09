import React from 'react';
import { type ColorResult } from '../types';

interface ColorDisplayProps {
  result: ColorResult;
}

export function ColorDisplay({ result }: ColorDisplayProps): React.ReactNode {
  const { colorName, hexCode } = result;

  return (
    <div className="w-full p-6 bg-gray-800/50 border border-gray-700 rounded-lg shadow-xl text-center flex flex-col items-center animate-fade-in">
        <div 
            className="w-24 h-24 rounded-full mb-4 border-4 border-gray-600 shadow-lg"
            style={{ backgroundColor: hexCode }}
        ></div>
        <p className="text-3xl font-bold text-white">{colorName}</p>
        <p className="text-lg text-gray-400 uppercase font-mono mt-1">{hexCode}</p>
    </div>
  );
}