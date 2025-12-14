import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise, TiltShift } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const SceneEffects: React.FC = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* Essential for the "Cinematic Glow" */}
      <Bloom 
        luminanceThreshold={1.1} // Only very bright things glow (emissive > 1)
        luminanceSmoothing={0.02} 
        intensity={0.6}
        mipmapBlur 
      />
      
      {/* Gentle noise for film grain texture */}
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      
      {/* Darkens corners to focus eyes on the center */}
      <Vignette eskil={false} offset={0.1} darkness={0.6} />

      {/* TiltShift for the "Miniature/Magical" depth of field feeling */}
      {/* Note: In a real app, focus distance would be dynamic */}
      <TiltShift blur={0.05} taper={0.5} /> 
    </EffectComposer>
  );
};

export default SceneEffects;