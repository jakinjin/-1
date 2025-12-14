import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, SoftShadows, Float } from '@react-three/drei';
import TreeBody from './TreeBody';
import Ornaments, { FairyLights, Star } from './Ornaments';
import SceneEffects from './SceneEffects';
import Floor from './Floor';
import MagicDust from './MagicDust';
import { COLORS } from '../constants';
import { TreeStatus } from '../types';

interface ExperienceProps {
  treeStatus: TreeStatus;
}

const Experience: React.FC<ExperienceProps> = ({ treeStatus }) => {
  return (
    <Canvas shadows dpr={[1, 2]} className="w-full h-full">
      <Suspense fallback={null}>
        {/* Camera Setup */}
        <PerspectiveCamera makeDefault position={[0, 3, 9]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2 - 0.05} 
          minDistance={5}
          maxDistance={14}
          autoRotate
          autoRotateSpeed={treeStatus === 'scattered' ? 0.2 : 0.5}
        />

        {/* Global Environment */}
        <color attach="background" args={[COLORS.EMERALD_DEEP]} />
        
        {/* Fog for depth */}
        <fog attach="fog" args={[COLORS.EMERALD_DEEP, 8, 20]} />

        {/* Lighting Strategy: Dark & Moody + Spotlights */}
        <ambientLight intensity={0.2} />
        
        {/* Main warm spot light for shadows */}
        <spotLight 
          position={[5, 10, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={80} 
          color={COLORS.WARM_WHITE}
          castShadow 
          shadow-bias={-0.0001}
        />
        
        {/* Rim light for gold sparkle */}
        <pointLight position={[-5, 5, -5]} intensity={15} color={COLORS.GOLD_METALLIC} />

        {/* The Tree Assembly */}
        <Float 
          speed={treeStatus === 'scattered' ? 0.5 : 1.5} 
          rotationIntensity={treeStatus === 'scattered' ? 0.01 : 0.05} 
          floatIntensity={0.2}
        >
          <group position={[0, -1, 0]}>
            <TreeBody levels={5} status={treeStatus} />
            <Ornaments levels={5} height={4} radiusBase={1.6} status={treeStatus} />
            <FairyLights levels={5} height={4} radiusBase={1.6} status={treeStatus} />
            <Star position={[0, 4.2, 0]} status={treeStatus} />
          </group>
        </Float>

        <Floor />
        <MagicDust />

        {/* HDR Environment for reflections on Gold */}
        <Environment preset="city" environmentIntensity={0.5} />
        
        {/* Post Processing */}
        <SceneEffects />
        
        <SoftShadows size={10} samples={16} focus={0.5} />
      </Suspense>
    </Canvas>
  );
};

export default Experience;