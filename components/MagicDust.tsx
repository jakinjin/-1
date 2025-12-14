import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '../constants';

const MagicDust: React.FC = () => {
  const count = 300;
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Create random initial positions and velocities
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = Math.random() * 10;
      const z = (Math.random() - 0.5) * 15;
      const speed = 0.005 + Math.random() * 0.01;
      temp.push({ x, y, z, speed, offset: Math.random() * 100 });
    }
    return temp;
  }, []);

  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      // Float upwards and spiral slightly
      particle.y += particle.speed;
      if (particle.y > 10) particle.y = 0;
      
      const time = state.clock.getElapsedTime();
      const driftX = Math.sin(time * 0.5 + particle.offset) * 0.02;
      
      dummy.position.set(particle.x + driftX, particle.y, particle.z);
      
      // Twinkle scale
      const s = Math.sin(time * 2 + particle.offset) * 0.02 + 0.02;
      dummy.scale.set(s, s, s);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={COLORS.GOLD_METALLIC} transparent opacity={0.6} />
    </instancedMesh>
  );
};

export default MagicDust;