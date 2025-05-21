/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Quantum interference patterns
 * 
 * Na teoria Orch OR, os padrões de interferência são fundamentais para entender
 * como a informação quântica é processada nos microtúbulos:
 * 
 * 1. Demonstram o comportamento ondulatório quântico, onde ondas de probabilidade
 *    interferem construtivamente e destrutivamente
 * 
 * 2. Representam como diferentes estados de superposição interagem dentro da 
 *    estrutura dos microtúbulos
 * 
 * 3. São a base da computação quântica nos microtúbulos, permitindo o processamento
 *    paralelo massivo de informação, crucial na teoria Orch OR
 * 
 * 4. A interferência quântica conecta o processamento quântico nos microtúbulos
 *    a fenômenos de campo mais amplos na atividade neural global
 */
export function InterferencePatterns() {
  const patterns = useRef<THREE.Group>(null);
  
  // Criando conjuntos de ondas circulares que representam
  // os padrões de interferência quântica nos microtúbulos
  useFrame(({ clock }) => {
    if (patterns.current) {
      const t = clock.getElapsedTime();
      
      // Rotação lenta de todo o grupo
      // Representa a evolução temporal dos padrões de interferência
      patterns.current.rotation.x = Math.sin(t * 0.2) * 0.3;
      patterns.current.rotation.y = t * 0.1;
      
      // Animar materiais independentemente
      // Cada padrão evolui com sua própria dinâmica, mas todos estão inter-relacionados
      patterns.current.children.forEach((child, i) => {
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        
        // Pulsação da opacidade - representa flutuações quânticas
        // Na teoria Orch OR, os estados quânticos oscilam antes do colapso
        material.opacity = 0.3 + Math.sin(t * (0.5 + i * 0.2)) * 0.2;
        
        // Animar escala para simular propagação de onda quântica
        // Representa a propagação da informação quântica através dos microtúbulos
        child.scale.setScalar(1 + Math.sin(t * (0.3 + i * 0.1)) * 0.3);
      });
    }
  });
  
  return (
    <group ref={patterns}>
      {/* Padrões de interferência - anéis sobrepostos em múltiplos planos */}
      {Array(5).fill(0).map((_, i) => (
        <React.Fragment key={i}>
          {/* Plano horizontal - representa um plano de interferência quântica */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.0 + i * 0.4, 1.05 + i * 0.4, 128]} />
            <meshBasicMaterial 
              // Cores alternadas representam diferentes fases de interferência
              // Azul claro/azul escuro - associados a estados coerentes de baixa energia
              color={i % 2 === 0 ? "#80FFFF" : "#8080FF"} 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          
          {/* Plano vertical - interferência ortogonal ao primeiro plano */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[1.1 + i * 0.4, 1.15 + i * 0.4, 128]} />
            <meshBasicMaterial 
              // Rosa/amarelo - associados a estados coerentes de alta energia
              // A alternância de cores representa interferência construtiva/destrutiva
              color={i % 2 === 0 ? "#FF80FF" : "#FFFF80"} 
              transparent 
              opacity={0.3} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}