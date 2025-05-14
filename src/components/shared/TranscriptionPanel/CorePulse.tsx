/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CorePulseProps {
  createdAt: number;
  position: THREE.Vector3;
  color: string;
  intensity?: number; // Intensidade do sinal neural (0.2-1.0)
}

// Pulse effect: quick expansion and fade
const CorePulse: React.FC<CorePulseProps> = ({ createdAt, position, color, intensity = 0.7 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      // Duração baseada na intensidade - sinais mais fortes duram mais
      const duration = 700 + (intensity * 300); // 770ms a 1000ms
      const elapsed = (Date.now() - createdAt) / duration; // 0-1
      
      // Pulse: fast scale up, then fade - amplitude baseada na intensidade
      const maxScale = 0.6 + (intensity * 0.8); // Escala máxima proporcional à intensidade
      const scale = 1 + maxScale * Math.sin(Math.min(elapsed, 1) * Math.PI);
      meshRef.current.scale.set(scale, scale, scale);
      
      // Fade com intensidade
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        const maxOpacity = 0.4 + (intensity * 0.35); // Mais forte = mais visível
        mat.opacity = Math.max(0, maxOpacity * (1 - elapsed));
        
        // Intensidade emissiva proporcional
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.1 + (intensity * 0.25); // Mais forte = mais brilhante
        }
      }
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.13, 24, 24]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.4 + (intensity * 0.35)}
        roughness={0.3}
        transmission={0.7 + (intensity * 0.3)}
        thickness={0.2 + (intensity * 0.1)}
        emissive={color}
        emissiveIntensity={0.1 + (intensity * 0.25)}
        clearcoat={0.8}
      />
    </mesh>
  );
};

export default CorePulse;
