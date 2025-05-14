/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { coreActivationPoints } from './CorePositions';
import { getCoreColor } from './CoreColors';
import { useBrainVisualization } from './BrainVisualizationContext';
import CoreGlow from '../TranscriptionPanel/CoreGlow';
import CorePulse from '../TranscriptionPanel/CorePulse';
import CoreRipple from '../TranscriptionPanel/CoreRipple';
import CoreHighlight from '../TranscriptionPanel/CoreHighlight';

// Brain model wrapper
export const BrainModel: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '280px' }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
        {/* Increased ambient light to prevent dark appearance */}
        <ambientLight intensity={0.6} />
        {/* Main spotlight from top-right */}
        <spotLight position={[10, 10, 10]} intensity={1.0} />
        {/* Additional soft light from the front to brighten the model */}
        <pointLight position={[0, 0, 10]} intensity={0.5} />
        {/* Fill light from bottom to reduce shadows */}
        <pointLight position={[0, -10, 0]} intensity={0.3} color="#ffffff" />
        <OrbitControls 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={1}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
        <Brain3D />
      </Canvas>
    </div>
  );
};

// Center brain component - handles rendering the brain model
function CenteredBrain() {
  const rotatingGroup = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/brain_model.glb') as unknown as { scene: THREE.Group };
  const { activeRegion } = useBrainVisualization();
  
  // Define color mapping
  const regionColorMap = getCoreColor;

  // Apply color and transparency to brain model materials
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const setMatProps = (mat: THREE.Material) => {
          if (
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial
          ) {
            const material = mat as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
            if (material.map) material.map = null;
            material.transparent = true;
            material.opacity = 0.1; // More transparent
            material.wireframe = true; // Enable wireframe
            material.depthWrite = false;
            // Garantir que a cor base seja sempre clara e visível
            if (material.color && typeof material.color.set === 'function') {
              material.color.set('#4FD1C5'); // Cor base em turquesa
            }
            // Adicionar um leve efeito emissivo para prevenir aparência escura
            if (material.emissive && typeof material.emissive.set === 'function') {
              material.emissive.set('#1A3C4F'); // Azul escuro sutil
              material.emissiveIntensity = 0.05; // Intensidade muito baixa, apenas para evitar preto total
            }
            // Configurações adicionais para melhorar a aparência
            material.wireframeLinewidth = 0.1; // Linhas mais finas
            if ('metalness' in material) material.metalness = 0;
            if ('roughness' in material) material.roughness = 0.9;
          }
        };
        
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(setMatProps);
        } else {
          setMatProps(mesh.material);
        }
      }
    });
  }, [scene, activeRegion, regionColorMap]);

  return (
    <group ref={rotatingGroup} scale={[2.2, 2.2, 2.2]}>
      <primitive object={scene} />
    </group>
  );
}

// Main brain visualization with effects
// Helper function to constrain a position vector to stay within a given radius
const constrainToSphere = (position: THREE.Vector3, radius: number = 0.6): THREE.Vector3 => {
  const distance = position.length();
  if (distance > radius) {
    // If position is outside the sphere, normalize and scale to radius
    return position.clone().normalize().multiplyScalar(radius);
  }
  // Otherwise return the original position
  return position.clone();
};

function Brain3D() {
  const {
    coreGlows,
    corePulses,
    coreRipples,
    coreHighlights,
    orbiting
  } = useBrainVisualization();

  // Create a reference to the brain bounds
  const brainRadius = 1; // Perfect size for this brain model
  // Toggle this to true if you need to debug the containment sphere
  const showDebugSphere = false;

  return (
    <group>
      <Center>
        <CenteredBrain />
      </Center>

      {/* Debug visualization of brain bounds - only shown when needed */}
      {showDebugSphere && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[brainRadius, 32, 32]} />
          <meshBasicMaterial color="#FF0000" wireframe opacity={0.15} transparent />
        </mesh>
      )}
      
      {/* Core activation glows - constrained to brain bounds */}
      {coreGlows.map(({ id, core, createdAt }) => {
        const originalPosition = coreActivationPoints[core] || new THREE.Vector3(0, 0, 0);
        const constrainedPosition = constrainToSphere(originalPosition, brainRadius);
        return (
          <CoreGlow
            key={"glow-"+id}
            createdAt={createdAt}
            position={constrainedPosition}
            color={getCoreColor(core)}
          />
        );
      })}
      
      {/* Pulse: symbolic_retrieval - constrained to brain bounds */}
      {corePulses.map(({ id, core, createdAt }) => {
        const originalPosition = coreActivationPoints[core] || new THREE.Vector3(0, 0, 0);
        const constrainedPosition = constrainToSphere(originalPosition, brainRadius);
        return (
          <CorePulse
            key={"pulse-"+id}
            createdAt={createdAt}
            position={constrainedPosition}
            color={getCoreColor(core)}
          />
        );
      })}
      
      {/* Ripple: neural_collapse - constrained to brain bounds */}
      {coreRipples.map(({ id, core, createdAt }) => {
        const originalPosition = coreActivationPoints[core] || new THREE.Vector3(0, 0, 0);
        const constrainedPosition = constrainToSphere(originalPosition, brainRadius);
        return (
          <CoreRipple
            key={"ripple-"+id}
            createdAt={createdAt}
            position={constrainedPosition}
            color={getCoreColor(core)}
          />
        );
      })}
      
      {/* Highlight: symbolic_context_synthesized - constrained to brain bounds */}
      {coreHighlights.map(({ id, core, createdAt }) => {
        const originalPosition = coreActivationPoints[core] || new THREE.Vector3(0, 0, 0);
        const constrainedPosition = constrainToSphere(originalPosition, brainRadius);
        return (
          <CoreHighlight
            key={"highlight-"+id}
            createdAt={createdAt}
            position={constrainedPosition}
            color={getCoreColor(core)}
          />
        );
      })}
      
      {/* Orbiting light/particle - also constrained */}
      {orbiting && (
        <mesh position={constrainToSphere(new THREE.Vector3(0, 0.5, 0), brainRadius)}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      )}
      
      {/* Bloom/Glow effect using @react-three/postprocessing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.8} intensity={1.2} />
      </EffectComposer>
    </group>
  );
}

export default BrainModel;
