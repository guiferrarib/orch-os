/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Wave collapse component - representa a Redução Objetiva (OR) de Penrose-Hameroff
 * 
 * Na teoria Orch OR, a gravitação causa o colapso da função de onda quântica
 * criando um momento de consciência quando o limiar E=ħ/t é atingido.
 * 
 * Segundo Penrose e Hameroff, estes colapsos gravitacionais envolvem:
 * 1. Superposição quântica em proteínas tubulina nos microtúbulos
 * 2. Crescimento da superposição até um limiar crítico de massa-energia
 * 3. Colapso gravitacional (OR) que resulta num momento de consciência
 * 4. A natureza "não-computável" deste processo é central para explicar aspectos
 *    da consciência que, segundo Penrose, não podem ser simulados por algoritmos
 */
export function WaveCollapse({ 
  position = [0, 0, 0], 
  active = false, 
  color = "#00FFFF",
  isNonComputable = false // Representa o aspecto não-computável da teoria de Penrose
}) {
  // Referências para animação
  const outerRing = useRef<THREE.Mesh>(null);
  const middleRing = useRef<THREE.Mesh>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const quantum_particle = useRef<THREE.Group>(null);
  const spacetime_curvature = useRef<THREE.Group>(null);
  
  // Pontos para representar a curvatura espaço-temporal durante OR
  // A curvatura do espaço-tempo é central na teoria de Penrose para explicar a OR
  const spacetimePoints = useMemo(() => {
    const points = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const radius = 0.6 + Math.sin(theta * 3) * 0.1;
      points.push(new THREE.Vector3(
        radius * Math.cos(theta),
        radius * Math.sin(theta), 
        0
      ));
    }
    return points;
  }, []);
  
  // Partículas quânticas que se condensam durante o colapso
  // Representam os estados quânticos de tubulina convergindo durante OR
  const quantumParticles = useMemo(() => {
    const particles = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const radius = 0.4;
      particles.push({
        position: new THREE.Vector3(
          radius * Math.cos(theta),
          radius * Math.sin(theta),
          0
        ),
        originalRadius: radius,
        phase: Math.random() * Math.PI * 2,
        frequency: 3 + Math.random() * 5
      });
    }
    return particles;
  }, []);
  
  // Animação da Redução Objetiva (OR)
  // Simula o processo de colapso descrito por Penrose-Hameroff
  useFrame(({ clock }) => {
    if (!active) return;
    
    const t = clock.getElapsedTime();
    
    // Simulação do colapso quântico de Penrose - t representa o tempo quântico
    // A equação E = ħ/t de Penrose determina quando ocorre a redução objetiva
    
    // Período da oscilação completa (típico na teoria Orch OR: ~25ms)
    // Convertido para segundos na animação
    const period = 3; 
    const normalizedTime = (t % period) / period;
    
    // Calculando a fase de colapso atual
    const collapsePhase = Math.min(1, Math.pow(Math.sin(normalizedTime * Math.PI), 2) * 3);
    
    // Animação dos anéis - representam a frente de onda quântica
    if (outerRing.current && middleRing.current && innerRing.current) {
      // Fase 1: Expansão dos anéis - superposição inicial
      if (normalizedTime < 0.3) {
        const expansionFactor = Math.pow(normalizedTime / 0.3, 0.5);
        outerRing.current.scale.setScalar(0.2 + expansionFactor * 1.3);
        middleRing.current.scale.setScalar(0.2 + expansionFactor * 1.0);
        innerRing.current.scale.setScalar(0.2 + expansionFactor * 0.7);
        
        // Opacidade aumenta - representando o aumento da coerência quântica
        (outerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + expansionFactor * 0.5;
        (middleRing.current.material as THREE.MeshBasicMaterial).opacity = 0.4 + expansionFactor * 0.4;
        (innerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + expansionFactor * 0.3;
      } 
      // Fase 2: Colapso quântico - momento da redução objetiva
      // Representa o limiar de Penrose (quando E=ħ/t é atingido)
      else if (normalizedTime < 0.7) {
        const collapseFactor = Math.pow((normalizedTime - 0.3) / 0.4, 1.5);
        // Colapso dos anéis - representando OR
        outerRing.current.scale.setScalar(1.5 - collapseFactor * 1.3);
        middleRing.current.scale.setScalar(1.2 - collapseFactor * 1.0);
        innerRing.current.scale.setScalar(0.9 - collapseFactor * 0.5);
        
        // Pulsos de intensidade durante o colapso - representam a transição de energia
        // Na teoria Orch OR, este é o momento em que a energia gravitacional
        // causa o colapso da função de onda
        const pulseIntensity = 0.8 + Math.sin(collapseFactor * Math.PI * 6) * 0.2;
        (outerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulseIntensity;
        (middleRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulseIntensity;
        (innerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * pulseIntensity;
      }
      // Fase 3: Dissipação - após OR
      // Representa o retorno ao estado clássico pós-colapso
      else {
        const dissipationFactor = (normalizedTime - 0.7) / 0.3;
        
        // Redução da escala e opacidade - representa o estado pós-colapso
        outerRing.current.scale.setScalar(0.2 * (1 - dissipationFactor));
        middleRing.current.scale.setScalar(0.2 * (1 - dissipationFactor));
        innerRing.current.scale.setScalar(0.4 * (1 - dissipationFactor));
        
        // Opacidade diminui
        (outerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - dissipationFactor);
        (middleRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - dissipationFactor);
        (innerRing.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - dissipationFactor);
      }
      
      // Rotação continua - representa a fase quântica
      outerRing.current.rotation.z = t * 1.5;
      middleRing.current.rotation.z = -t * 1.0;
      innerRing.current.rotation.z = t * 0.5;
    }
    
    // Animação das partículas quânticas
    if (quantum_particle.current) {
      quantum_particle.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const particle = quantumParticles[i % quantumParticles.length];
        
        // Fase 1: Movimento quântico - partículas em superposição
        if (normalizedTime < 0.3) {
          const expansionFactor = normalizedTime / 0.3;
          const quantum_phase = particle.phase + t * particle.frequency;
          const quantum_radius = particle.originalRadius * (1 + expansionFactor * 0.5);
          
          // Movimento em superposição quântica - representa tubulinas em superposição
          mesh.position.set(
            quantum_radius * Math.cos(quantum_phase) * Math.sin(t + i),
            quantum_radius * Math.sin(quantum_phase) * Math.cos(t + i),
            0.1 * Math.sin(quantum_phase * 2)
          );
          
          // Partículas ficam mais brilhantes - aumento da energia quântica
          mesh.scale.setScalar(0.5 + 0.5 * expansionFactor);
        }
        // Fase 2: Colapso quântico - partículas convergem
        else if (normalizedTime < 0.7) {
          const collapseFactor = (normalizedTime - 0.3) / 0.4;
          const collapseRadius = particle.originalRadius * (1 - collapseFactor);
          
          // Movimento de convergência (colapso) - redução objetiva
          mesh.position.set(
            collapseRadius * Math.cos(particle.phase),
            collapseRadius * Math.sin(particle.phase),
            0.05 * Math.cos(t * 5 + i) * (1 - collapseFactor)
          );
          
          // Partículas brilham intensamente durante o colapso - energia liberada
          const pulseIntensity = 1.0 + Math.sin(collapseFactor * Math.PI * 8) * 0.5;
          mesh.scale.setScalar(1.0 * pulseIntensity);
        }
        // Fase 3: Pós-colapso - partículas se condensam
        else {
          const dissipationFactor = (normalizedTime - 0.7) / 0.3;
          
          // Partículas convergem para o centro - estado clássico pós-OR
          mesh.position.set(
            0.1 * Math.cos(particle.phase) * (1 - dissipationFactor),
            0.1 * Math.sin(particle.phase) * (1 - dissipationFactor),
            0
          );
          
          // Partículas diminuem até desaparecer
          mesh.scale.setScalar(0.5 * (1 - dissipationFactor));
        }
      });
    }
    
    // Distorção espaço-temporal - representa a curvatura que Penrose descreve como
    // responsável pelo colapso quântico (aspecto gravitacional da teoria Orch OR)
    if (spacetime_curvature.current && spacetime_curvature.current.children.length > 0) {
      // Calcula distorção espaço-temporal baseada na fase de colapso
      const vertices: THREE.Vector3[] = [];
      spacetimePoints.forEach((point, i) => {
        const theta = (i / spacetimePoints.length) * Math.PI * 2;
        
        // Distorção máxima durante a fase de colapso (baseada na fórmula τ ~ h-bar/E_G)
        // Na teoria de Penrose, a auto-gravitação causa o colapso da função de onda
        let distortion = 0;
        if (normalizedTime < 0.3) {
          // Pequena distorção inicial - gravidade começa a agir
          distortion = 0.1 * (normalizedTime / 0.3);
        } else if (normalizedTime < 0.7) {
          // Distorção máxima durante o colapso
          const collapseProgress = (normalizedTime - 0.3) / 0.4;
          distortion = 0.1 + 0.3 * Math.sin(collapseProgress * Math.PI);
        } else {
          // Distorção diminui após colapso
          distortion = 0.1 * (1 - (normalizedTime - 0.7) / 0.3);
        }
        
        // Distorção varia com posição angular - simula curvatura não uniforme
        const vertexDistortion = distortion * (1 + 0.5 * Math.sin(theta * 4 + t));
        
        // Aplica distorção espaço-temporal
        const distortedPoint = point.clone();
        distortedPoint.z = -vertexDistortion * Math.sin(theta * 2 + t * 2);
        distortedPoint.x += vertexDistortion * Math.sin(theta * 3 + t);
        distortedPoint.y += vertexDistortion * Math.cos(theta * 3 + t);
        
        vertices.push(distortedPoint);
      });
      
      try {
        // Tenta acessar a geometria do objeto filho (linha)
        const lineObj = spacetime_curvature.current.children[0] as THREE.Line;
        if (lineObj && lineObj.geometry) {
          const lineGeometry = lineObj.geometry as THREE.BufferGeometry;
          const positions = new Float32Array(vertices.length * 3);
          
          for (let i = 0; i < vertices.length; i++) {
            positions[i * 3] = vertices[i].x;
            positions[i * 3 + 1] = vertices[i].y;
            positions[i * 3 + 2] = vertices[i].z;
          }
          
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          lineGeometry.attributes.position.needsUpdate = true;
        }
      } catch (error) {
        // Ignora erros na atualização da geometria
        console.warn('Erro ao atualizar geometria da linha:', error);
      }
    }
  });
  
  if (!active) return null;
  
  // Cor base depende se é um processo não-computável (teoria de Penrose)
  // Processos não-computáveis são fundamentais na teoria de Penrose para explicar
  // aspectos da consciência que transcendem computação algoritmica
  const baseColor = isNonComputable ? "#FF00FF" : color;
  const hue = new THREE.Color(baseColor).getHSL({h:0, s:0, l:0}).h;
  
  // Cores para diferentes elementos do colapso
  const outerColor = new THREE.Color().setHSL(hue, 0.8, 0.7);
  const middleColor = new THREE.Color().setHSL((hue + 0.05) % 1, 0.9, 0.6);
  const innerColor = new THREE.Color().setHSL((hue + 0.1) % 1, 1.0, 0.5);
  
  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Anéis de colapso quântico - representam a frente de onda durante OR */}
      <mesh ref={outerRing}>
        <torusGeometry args={[0.4, 0.02, 16, 100]} />
        <meshBasicMaterial color={outerColor} transparent opacity={0.7} />
      </mesh>
      <mesh ref={middleRing}>
        <torusGeometry args={[0.3, 0.02, 16, 100]} />
        <meshBasicMaterial color={middleColor} transparent opacity={0.7} />
      </mesh>
      <mesh ref={innerRing}>
        <torusGeometry args={[0.2, 0.02, 16, 100]} />
        <meshBasicMaterial color={innerColor} transparent opacity={0.7} />
      </mesh>
      
      {/* Partículas quânticas que se condensam durante o colapso */}
      <group ref={quantum_particle}>
        {quantumParticles.map((particle, i) => (
          <mesh key={i} position={particle.position}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={new THREE.Color().setHSL(hue, 0.8, 0.8)} />
          </mesh>
        ))}
      </group>
      
      {/* Curvatura espaço-temporal - representa o mecanismo gravitacional de Penrose */}
      <group ref={spacetime_curvature}>
        <line>
          <bufferGeometry>
            <bufferAttribute 
              attach="attributes-position" 
              args={[new Float32Array(spacetimePoints.length * 3), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={outerColor} transparent opacity={0.5} />
        </line>
      </group>
    </group>
  );
}