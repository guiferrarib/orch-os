/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Flowing quantum probability fields
 * 
 * Na teoria Orch OR de Penrose-Hameroff, os campos de probabilidade quântica são fundamentais:
 * 
 * 1. Representam a função de onda quântica distribuída através dos microtúbulos
 * 2. Demonstram as propriedades de "não-localidade" quântica do sistema neural
 * 3. Visualizam como os estados de superposição existem como campos de probabilidade
 *    antes do colapso (OR)
 * 
 * Nesta representação, cada partícula representa um componente do campo de probabilidade
 * quântica descrito pela equação de Schrödinger, antes da redução objetiva.
 */
export function ProbabilityFields({ particleCount = 150 }) {
  const particles = useRef<THREE.Points>(null);
  
  // Criando posições iniciais para partículas
  // Cada partícula representa um "elemento" da função de onda quântica
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      // Distribuir em volume esférico - representa o campo de probabilidade 3D
      const radius = 0.5 + Math.random() * 1.5;
      
      pos.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(pos);
  }, [particleCount]);
  
  // Cores para as partículas - representam diferentes estados quânticos
  // Em Orch OR, os estados quânticos envolvem diferentes configurações de elétrons
  // em proteínas tubulina, cada uma com diferentes níveis energéticos
  const colors = useMemo(() => {
    const cols = [];
    for (let i = 0; i < particleCount; i++) {
      // Gradiente de cor de azul a violeta - representa espectro de energia quântica
      // Azul: Estados de baixa energia
      // Violeta: Estados de alta energia (próximos de colapso OR)
      const h = 180 + (Math.random() * 80); // 180-260 (azul a violeta)
      const s = 60 + (Math.random() * 40);  // Saturação moderada a alta
      const l = 50 + (Math.random() * 30);  // Luminosidade média a alta
      
      const color = new THREE.Color(`hsl(${h}, ${s}%, ${l}%)`);
      cols.push(color.r, color.g, color.b);
    }
    return new Float32Array(cols);
  }, [particleCount]);
  
  // Animação do campo de probabilidade
  // Na teoria Orch OR, os campos quânticos evoluem de acordo com a equação de Schrödinger
  // até atingirem um limiar de massa-energia para colapso gravitacional
  useFrame(({ clock }) => {
    if (particles.current) {
      const t = clock.getElapsedTime();
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const i3 = i / 3;
        
        // Usa funções senoidais para criar movimento fluido
        // Isto simula a evolução da função de onda quântica
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Cálculo de deslocamento baseado em funções senoidais entrelaçadas
        // Simula as interações não-locais dos campos quânticos
        const modulation = Math.sin(t * 0.5 + i3 * 0.1);
        const phase = t * 0.2 + i3 * 0.05;
        
        // Movimento em espiral - representa evolução da função de onda
        // que caracteriza os estados quânticos em proteínas tubulina
        positions[i] = x + Math.sin(phase + y * 0.5) * 0.01 * modulation;
        positions[i + 1] = y + Math.cos(phase + x * 0.5) * 0.01 * modulation;
        positions[i + 2] = z + Math.sin(phase * 1.5) * 0.01 * modulation;
      }
      
      particles.current.geometry.attributes.position.needsUpdate = true;
      
      // Rotação lenta do sistema de partículas
      // Representa a dinâmica global do campo quântico
      particles.current.rotation.y = t * 0.05;
      particles.current.rotation.x = Math.sin(t * 0.1) * 0.2;
    }
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          args={[positions, 3]}
        />
        <bufferAttribute 
          attach="attributes-color" 
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.7} 
        sizeAttenuation 
      />
    </points>
  );
}