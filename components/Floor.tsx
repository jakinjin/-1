import React from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

const Floor: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40} // Strength of the reflection
        roughness={0.6} // Glossy but not perfect mirror
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#010b06"
        metalness={0.5}
        mirror={0} // Standard prop for ReflectorMaterial types (0-1) - but types vary in Drei versions, 0 is safe
      />
    </mesh>
  );
};

export default Floor;