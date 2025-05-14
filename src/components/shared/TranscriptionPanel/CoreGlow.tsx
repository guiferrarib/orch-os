/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// These should be imported or passed in; for now, we expect them to be available in the parent scope
// import { coreActivationPoints, getCoreColor } from './TranscriptionPanel';

interface CoreGlowProps {
  createdAt: number;
  position: THREE.Vector3;
  color: string;
  intensity?: number; // Intensidade do sinal neural (0.2-1.0)
}

const CoreGlow: React.FC<CoreGlowProps> = ({ createdAt, position, color, intensity = 0.7 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const elapsed = (Date.now() - createdAt) / 2000; // 0 to 1
      // Smoother organic pulse, escala agora ajustada pela intensidade
      const baseScale = 0.7 + (intensity * 0.5); // Mais forte = maior base
      const pulseAmount = 0.2 + (intensity * 0.3); // Mais forte = pulso mais visível
      
      const scale = baseScale + pulseAmount * Math.sin(elapsed * Math.PI * 1.6) + 
                  (0.05 + intensity * 0.1) * Math.sin(elapsed * Math.PI * 5);
      
      meshRef.current.scale.set(scale, scale, scale);
      
      // Fade: opacity agora baseada na intensidade
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (mat) {
        const maxOpacity = 0.5 + (intensity * 0.4); // Mais forte = mais visível
        mat.opacity = Math.max(0, maxOpacity * (1 - elapsed));
      }
    }
  });
  return (
    <>
      {/* Main soft glow */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.5 + (intensity * 0.4)} // Intensidade afeta opacidade inicial
          roughness={0.4}
          transmission={0.8}
          thickness={0.25}
          emissive={color}
          emissiveIntensity={0.25}
          clearcoat={1}
        />
      </mesh>
      {/* Outer faint shell for ethereal effect */}
      <mesh position={position}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.16}
          roughness={0.7}
          transmission={0.95}
          thickness={0.15}
          emissive={color}
          emissiveIntensity={0.09}
          clearcoat={0.7}
        />
      </mesh>
    </>
  );
};

export default CoreGlow;
