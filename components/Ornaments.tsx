import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { COLORS, SCATTER_RADIUS, ORNAMENT_COLORS } from '../constants';
import { goldMaterialProps } from './TreeMaterials';
import { TreeStatus } from '../types';

interface OrnamentsProps {
  levels: number;
  radiusBase: number; // Ignored in favor of internal constants to match TreeBody
  height: number;
  status: TreeStatus;
}

const TOTAL_HEIGHT = 7.5;
const MAX_RADIUS = 2.8;

const Ornaments: React.FC<OrnamentsProps> = ({ status }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { items, colorArray } = useMemo(() => {
    const temp = [];
    const colorHelper = new THREE.Color();
    const allColors = [];
    
    // Logic: Place ornaments on the "Tips" of implied branches
    // We roughly match the Layer logic from TreeBody but with fewer items
    const LAYERS = 14; 

    for (let i = 0; i < LAYERS; i++) {
        const t = i / (LAYERS - 1);
        const layerY = (t * TOTAL_HEIGHT) * 0.9 + 0.5;
        const layerRadius = MAX_RADIUS * (1 - t) * (1 - t * 0.2);
        
        // Fewer ornaments than branches (e.g., 60-70 total)
        const countInLayer = Math.max(3, Math.floor(7 * (1 - t)));
        
        for (let j = 0; j < countInLayer; j++) {
            const angle = (j / countInLayer) * Math.PI * 2 + (i * 1.2); // Offset phases
            
            // Place near the tip (radius * 0.9)
            const x = Math.cos(angle) * layerRadius * 0.95;
            const z = Math.sin(angle) * layerRadius * 0.95;
            // Droop slightly below the branch line
            const y = layerY - 0.2; 

            // Scatter
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const rs = Math.cbrt(Math.random()) * SCATTER_RADIUS;
            
            temp.push({ 
                treePos: new THREE.Vector3(x, y, z), 
                scatterPos: new THREE.Vector3(
                    rs * Math.sin(phi) * Math.cos(theta),
                    rs * Math.sin(phi) * Math.sin(theta) + 5,
                    rs * Math.cos(phi)
                ),
                scale: 0.12 + Math.random() * 0.06,
                phase: Math.random() * Math.PI * 2
            });

            // Color
            const randomColor = ORNAMENT_COLORS[Math.floor(Math.random() * ORNAMENT_COLORS.length)];
            colorHelper.set(randomColor);
            allColors.push(colorHelper.r, colorHelper.g, colorHelper.b);
        }
    }

    return { items: temp, colorArray: new Float32Array(allColors) };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const target = status === 'assembled' ? 0 : 1;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.5);
    const ease = progress.current < 0.5 ? 4 * progress.current ** 3 : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;

    items.forEach((data, i) => {
      dummy.position.lerpVectors(data.treePos, data.scatterPos, ease);
      
      if (ease > 0.01) {
        dummy.rotation.x = state.clock.elapsedTime * 0.2 * data.phase;
        dummy.rotation.y = state.clock.elapsedTime * 0.1;
      } else {
        dummy.rotation.set(0,0,0);
      }

      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, items.length]} castShadow>
      <sphereGeometry args={[1, 32, 32]}>
         <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshPhysicalMaterial 
        {...goldMaterialProps} 
        color="#ffffff" 
        vertexColors 
      />
    </instancedMesh>
  );
};

export const FairyLights: React.FC<OrnamentsProps> = ({ status }) => {
  const lightsRef = useRef<THREE.InstancedMesh>(null);
  const count = 200; // More lights for the spiral
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(0);
  
  const particles = useMemo(() => {
    const temp = [];
    
    // SPIRAL GENERATION
    // We want the lights to wrap around the tree from bottom to top
    const spiralLoops = 8;
    
    for (let i = 0; i < count; i++) {
      const t = i / count; // 0 to 1
      
      const height = t * TOTAL_HEIGHT * 0.95 + 0.5; // Slightly shorter than max height to stay on foliage
      const radius = MAX_RADIUS * (1 - t) * (1 - t * 0.2) * 1.05; // Slightly outside the foliage
      
      const angle = t * Math.PI * 2 * spiralLoops;
      
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = height;
      
      // Scatter
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const th = 2 * Math.PI * u;
      const rs = Math.cbrt(Math.random()) * SCATTER_RADIUS;
      
      temp.push({ 
        treePos: new THREE.Vector3(x, y, z), 
        scatterPos: new THREE.Vector3(
          rs * Math.sin(phi) * Math.cos(th),
          rs * Math.sin(phi) * Math.sin(th) + 5,
          rs * Math.cos(phi)
        ),
        phase: Math.random() * Math.PI * 2 
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!lightsRef.current) return;
    const time = state.clock.getElapsedTime();
    const target = status === 'assembled' ? 0 : 1;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.5);
    const ease = progress.current < 0.5 ? 4 * progress.current ** 3 : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;

    particles.forEach((particle, i) => {
      dummy.position.lerpVectors(particle.treePos, particle.scatterPos, ease);
      
      const pulse = Math.sin(time * 3 + particle.phase) * 0.02;
      const baseScale = 0.04;
      const scale = baseScale + pulse;
      
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      lightsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    lightsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={lightsRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color={COLORS.WARM_WHITE} 
        emissive={COLORS.GOLD_METALLIC}
        emissiveIntensity={4} // Brighter lights
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export const Star: React.FC<{ position: [number, number, number]; status: TreeStatus }> = ({ position, status }) => {
  const meshRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  
  // Use a slightly higher position for the star on the new tree
  const treePos = useMemo(() => new THREE.Vector3(0, TOTAL_HEIGHT + 0.2, 0), []);
  const scatterPos = useMemo(() => new THREE.Vector3(0, 8, 0), []); 

  useFrame((state, delta) => {
    if (meshRef.current) {
      const target = status === 'assembled' ? 0 : 1;
      progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 1.5);
      const ease = progress.current < 0.5 ? 4 * progress.current ** 3 : 1 - Math.pow(-2 * progress.current + 2, 3) / 2;

      meshRef.current.position.lerpVectors(treePos, scatterPos, ease);
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      
      if (ease > 0.1) {
         meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.5 * ease;
      } else {
         meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 2);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <dodecahedronGeometry args={[0.45, 0]} /> {/* Larger star */}
        <meshStandardMaterial
          color={COLORS.GOLD_METALLIC}
          emissive={COLORS.GOLD_METALLIC}
          emissiveIntensity={3}
          roughness={0.1}
          metalness={1}
          toneMapped={false}
        />
      </mesh>
      <mesh scale={[1.4, 1.4, 1.4]}>
        <dodecahedronGeometry args={[0.45, 0]} />
        <meshBasicMaterial 
          color={COLORS.GOLD_METALLIC} 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default Ornaments;