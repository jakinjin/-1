import React, { useState } from 'react';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import { TreeStatus } from './types';

const App: React.FC = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [treeStatus, setTreeStatus] = useState<TreeStatus>('assembled');

  const toggleTree = () => {
    setTreeStatus(prev => prev === 'assembled' ? 'scattered' : 'assembled');
  };

  return (
    <div className="relative w-full h-screen bg-[#010b06] overflow-hidden">
      {/* 3D Canvas */}
      <Experience treeStatus={treeStatus} />

      {/* Loading Overlay */}
      <LoadingScreen />

      {/* UI Overlay - Minimalist & Luxury */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-12 pointer-events-none z-10">
        <header className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-[1px] bg-[#FFD700]"></div>
             <span className="font-serif text-[#FFD700] text-xs tracking-[0.3em] uppercase opacity-80">Collection 2024</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white tracking-widest drop-shadow-lg">
            ARIX <span className="text-[#FFD700] font-light italic">Signature</span>
          </h1>
          <p className="font-sans text-[#a3b8b0] text-xs md:text-sm tracking-widest max-w-md mt-4 font-light leading-relaxed text-center md:text-left">
            An interactive exploration of elegance. <br />
            {treeStatus === 'assembled' ? 'Drag to rotate. Toggle to deconstruct.' : 'Floating in suspension.'}
          </p>
        </header>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 w-full p-8 md:p-12 z-10 pointer-events-none flex justify-between items-end">
        <div className="hidden md:block">
           <div className="font-serif text-[#0a5d46] text-9xl opacity-20 absolute bottom-[-20px] left-8 pointer-events-none select-none">
             25
           </div>
        </div>

        <div className="pointer-events-auto flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 items-end md:items-center">
          
          {/* Main Action Button */}
          <button 
            onClick={toggleTree}
            className="group relative px-8 py-3 bg-[#0a5d46]/20 backdrop-blur-sm border border-[#FFD700]/50 hover:bg-[#FFD700]/10 transition-all duration-500 overflow-hidden"
          >
             <div className="absolute inset-0 w-full h-full bg-[#FFD700]/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
             <span className="relative font-serif text-[#FFD700] tracking-[0.2em] text-sm">
               {treeStatus === 'assembled' ? 'DECONSTRUCT' : 'RECONSTRUCT'}
             </span>
          </button>

          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="group flex items-center space-x-3 transition-all duration-500 hover:opacity-100 opacity-60 cursor-pointer"
          >
            <div className="w-10 h-10 border border-[#FFD700]/30 rounded-full flex items-center justify-center group-hover:border-[#FFD700] transition-colors">
              <span className="text-[#FFD700] text-xs">
                {audioEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="text-[#FFD700] text-xs tracking-widest font-serif">AMBIANCE</span>
          </button>
        </div>
      </div>
      
      {/* Vignette Overlay (CSS fallback) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(1,11,6,0.6)_100%)]"></div>
    </div>
  );
};

export default App;