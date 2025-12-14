import React from 'react';
import { useProgress } from '@react-three/drei';

const LoadingScreen: React.FC = () => {
  const { progress } = useProgress();

  return (
    <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#010b06] transition-opacity duration-1000 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <h1 className="text-4xl md:text-6xl font-serif text-[#FFD700] tracking-widest mb-4 opacity-80">ARIX</h1>
      <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50 mb-8" />
      <p className="text-[#0a5d46] font-serif tracking-widest text-sm animate-pulse">
        CURATING EXPERIENCE... {Math.round(progress)}%
      </p>
    </div>
  );
};

export default LoadingScreen;