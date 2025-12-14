import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { emeraldMaterialProps } from './TreeMaterials';
import { TreeStatus } from '../types';
import { SCATTER_RADIUS, JEWEL_COLORS } from '../constants';

interface TreeBodyProps {
  levels?: number; // Not strictly used in new algo but kept for prop compat
  status: TreeStatus;
}

const TreeBody: React.FC<TreeBodyProps> = ({ status }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // High-fidelity Tree Generation Logic
  const { particles, colorArray } = useMemo(() => {
    const tempParticles = [];
    const colorHelper = new THREE.Color();
    const allColors = [];

    // Configuration for a "Standard" majestic tree
    const LAYERS = 16; // More layers for density
    const TOTAL_HEIGHT = 7.5;
    const MAX_RADIUS = 2.8;
    
    // We will generate branches for each layer
    for (let i = 0; i < LAYERS; i++) {
      const t = i / (LAYERS - 1); // 0 (bottom) to 1 (top)
      const layerY = (t * TOTAL_HEIGHT) * 0.9 + 0.5; // Distribute height
      
      // Curve radius: wide bottom, narrow top (convex curve for fullness)
      const layerRadius = MAX_RADIUS * (1 - t) * (1 - t * 0.2); 
      
      // Number of branches decreases as we go up
      const branchesInLayer = Math.ceil(12 * (1 - t * 0.8) + 3); 
      
      // Crystals per branch (density)
      const crystalsPerBranch = Math.ceil(20 * (1 - t * 0.5)); 

      for (let b = 0; b < branchesInLayer; b++) {
        const branchAngle = (b / branchesInLayer) * Math.PI * 2 + (i * 0.5); // Offset layers
        
        // Branch vector (slightly drooping)
        const branchDir = new THREE.Vector3(
          Math.cos(branchAngle), 
          -0.15, // Droop factor
          Math.sin(branchAngle)
        ).normalize();

        for (let c = 0; c < crystalsPerBranch; c++) {
          // Position along the branch
          const progress = c / crystalsPerBranch; // 0 (trunk) to 1 (tip)
          const dist = progress * layerRadius;
          
          // Add volume/noise around the main branch line
          const spread = 0.3 * (1 - t) * progress; // Tips spread more
          const noise = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread * 0.5,
            (Math.random() - 0.5) * spread
          );

          // Tree Position
          const treePos = new THREE.Vector3(0, layerY, 0)
            .add(branchDir.clone().multiplyScalar(dist))
            .add(noise);

          // Orientation: Crystals point outward/upward from branch
          const lookAtTarget = treePos.clone().add(branchDir).add(new THREE.Vector3(0, 1, 0));
          const matrix = new THREE.Matrix4();
          matrix.lookAt(treePos, lookAtTarget, new THREE.Vector3(0, 1, 0));
          const rotation = new THREE.Euler().setFromRotationMatrix(matrix);
          // Add some random variance to rotation
          rotation.x += (Math.random() - 0.5) * 0.5;
          rotation.z += (Math.random() - 0.5) * 0.5;

          // Scale: smaller at top, smaller at tips
          const scale = (0.15 + Math.random() * 0.15) * (1 - t * 0.5);

          // Scatter Position (Explosion)
          const u = Math.random();
          const v = Math.random();
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const rScatter = Math.cbrt(Math.random()) * SCATTER_RADIUS;
          const sx = rScatter * Math.sin(phi) * Math.cos(theta);
          const sy = rScatter * Math.sin(phi) * Math.sin(theta) + 5;
          const sz = rScatter * Math.cos(phi);

          tempParticles.push({
            treePos,
            scatterPos: new THREE.Vector3(sx, sy, sz),
            rotation,
            scale,
            randomPhase: Math.random() * Math.PI * 2
          });

          // Color Distribution: 70% Emerald, 30% Jewels
          let colorHex;
          if (Math.random() > 0.3) {
             colorHex = JEWEL_COLORS[0]; // Emerald Base
             // Slight variation in emerald
             colorHelper.set(colorHex).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
          } else {
             colorHex = JEWEL_COLORS[Math.floor(Math.random() * JEWEL_COLORS.length)];
             colorHelper.set(colorHex);
          }
          
          allColors.push(colorHelper.r, colorHelper.g, colorHelper.b);
        }
      }
    }
    
    return { particles: tempParticles, colorArray: new Float32Array(allColors) };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = status === 'assembled' ? 0 : 1;
    // Morph speed
    const speed = 1.2; // Slightly slower for grandeur
    
    if (Math.abs(progress.current - target) > 0.001) {
      progress.current = THREE.MathUtils.lerp(progress.current, target, delta * speed);
    } else {
        progress.current = target;
    }
    
    const p = progress.current;
    // Dramatic easing
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    const time = state.clock.getElapsedTime();

    particles.forEach((particle, i) => {
      // Position
      dummy.position.lerpVectors(particle.treePos, particle.scatterPos, ease);
      
      // Scater Drift
      if (ease > 0.01) {
        const drift = Math.sin(time * 0.5 + particle.randomPhase) * 0.5 * ease;
        dummy.position.y += drift * 0.02;
        dummy.rotation.x += drift * 0.01;
        dummy.rotation.z += drift * 0.01;
      }
      
      // Rotation
      dummy.rotation.copy(particle.rotation);
      if (ease > 0.01) {
         dummy.rotation.x += time * 0.1 * ease;
         dummy.rotation.y += time * 0.1 * ease;
      }

      dummy.scale.setScalar(particle.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]} castShadow receiveShadow>
      {/* Elongated Cone aka Spike/Crystal */}
      <coneGeometry args={[0.3, 1.2, 4]} />
      <meshStandardMaterial 
        {...emeraldMaterialProps} 
        vertexColors 
        flatShading={true} // Enhance the crystal faceted look
      />
    </instancedMesh>
  );
};

export default TreeBody;