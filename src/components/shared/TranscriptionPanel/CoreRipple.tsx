/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CoreRippleProps {
  createdAt: number;
  position: THREE.Vector3;
  color: string;
  intensity?: number; // Intensidade do colapso neural (0.2-1.0)
}

// Ripple effect: expanding ring, fades out
const CoreRipple: React.FC<CoreRippleProps> = ({ createdAt, position, color, intensity = 0.7 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      // Colapsos mais intensos geram ripples mais rápidos e maiores
      const baseSpeed = 900 + (600 * (1 - intensity)); // Mais intenso = mais rápido
      const elapsed = (Date.now() - createdAt) / baseSpeed;
      
      // Ripple: wave outward - escala proporcional à intensidade
      const maxScale = 1 + (intensity * 1.2); // Mais intenso = efeito maior
      const scale = 1 + Math.pow(elapsed, 0.7) * maxScale;
      meshRef.current.scale.set(scale, scale, scale);
      
      // Fade out com intensidade
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        // Intensidade afeta a opacidade inicial e a velocidade de fade
        const maxOpacity = 0.3 + (intensity * 0.4); // Mais intenso = mais visível
        const fadeRate = 1.2 + (intensity * 0.8); // Mais intenso = contraste mais definido
        mat.opacity = Math.max(0, maxOpacity * (1 - elapsed * fadeRate));
        
        // Ajuste emissivo proporcional à intensidade
        if (mat.emissiveIntensity !== undefined) {
          mat.emissiveIntensity = 0.1 + (intensity * 0.25);
        }
      }
    }
  });
  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.13, 0.21, 48]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.3 + (intensity * 0.4)}
        roughness={0.6 - (intensity * 0.2)} // Mais intenso = mais suave
        transmission={0.6 + (intensity * 0.4)}
        emissive={color}
        emissiveIntensity={0.1 + (intensity * 0.25)}
        clearcoat={0.7}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default CoreRipple;
