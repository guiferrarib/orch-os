/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoreHighlightProps {
  createdAt: number;
  position: THREE.Vector3;
  color: string;
  intensity?: number; // Intensity of the contextual synthesis (0.2-1.0)
}

// Highlight effect: static halo with fade-out
const CoreHighlight: React.FC<CoreHighlightProps> = ({ createdAt, position, color, intensity = 0.7 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      // Synthesis intensity affects both duration and appearance
      const duration = 1200 + (intensity * 400); // More important synthesis lasts longer
      const elapsed = (Date.now() - createdAt) / duration;
      
      // Scale effect based on intensity
      const maxScale = 0.2 + (intensity * 0.3); // Higher intensity = bigger highlight
      const scale = 1 + maxScale * (1 - Math.pow(1 - elapsed, 2)); // Easing out
      meshRef.current.scale.set(scale, scale, scale);
      
      // Adjust fade based on intensity
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        const maxOpacity = 0.2 + (intensity * 0.3); // Higher intensity = more visible
        mat.opacity = Math.max(0, maxOpacity * (1 - elapsed));
        
        // Adjust emissive intensity based on importance
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.05 + (intensity * 0.15);
        }
      }
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.17, 24, 24]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.2 + (intensity * 0.3)}
        roughness={0.8 - (intensity * 0.2)}
        transmission={0.9 + (intensity * 0.1)}
        thickness={0.04 + (intensity * 0.04)}
        emissive={color}
        emissiveIntensity={0.05 + (intensity * 0.15)}
        clearcoat={0.8}
      />
    </mesh>
  );
};

export default CoreHighlight;
