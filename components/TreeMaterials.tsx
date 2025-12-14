import React from 'react';
import { MeshStandardMaterial, MeshPhysicalMaterial } from 'three';

// We export customized materials components to keep the scene clean

export const emeraldMaterialProps = {
  color: "#043927",
  roughness: 0.2, // Smoother for more reflection (was 0.7)
  metalness: 0.6, // More metallic for gem-like appearance (was 0.1)
  emissive: "#000000",
  envMapIntensity: 1.5, // Enhance HDR reflections
};

export const goldMaterialProps = {
  color: "#FFD700",
  roughness: 0.1, // Very shiny
  metalness: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.2,
};

export const lightWireMaterialProps = {
  color: "#1a1a1a",
  roughness: 0.8,
};