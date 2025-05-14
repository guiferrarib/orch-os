import * as THREE from 'three';

// Core positions for brain visualization - extremely conservative coordinates
// These are deliberately kept very close to the center to ensure they
// appear inside the brain model regardless of its exact dimensions
export const coreActivationPoints: Record<string, THREE.Vector3> = {
  // Keep all coordinates within a very small radius (0.2-0.3) to ensure visibility
  
  // Frontal regions - front of brain
  metacognitive:  new THREE.Vector3(0, 0.2, 0.2),      // prefrontal
  valence:        new THREE.Vector3(0.1, 0.1, 0.1),    // frontal
  planning:       new THREE.Vector3(0.15, 0.1, -0.1),  // frontal planning
  
  // Middle regions
  intuition:      new THREE.Vector3(0.2, 0.15, -0.1),  // middle top
  memory:         new THREE.Vector3(0, 0.1, -0.2),     // middle
  self:           new THREE.Vector3(0, 0, 0.15),       // center
  
  // Lateral regions
  language:       new THREE.Vector3(0.25, 0, 0),       // right side
  associative:    new THREE.Vector3(-0.25, 0, 0),      // left side
  
  // Lower regions
  unconscious:    new THREE.Vector3(0, -0.2, -0.15),   // bottom back
  shadow:         new THREE.Vector3(-0.1, -0.15, 0),   // bottom left
  soul:           new THREE.Vector3(0, -0.15, 0),      // bottom center
  
  // Other regions
  creativity:     new THREE.Vector3(-0.2, 0.15, 0.1),  // left top
  social:         new THREE.Vector3(0.2, 0, 0.1),      // right front
  archetype:      new THREE.Vector3(-0.15, -0.1, 0.1), // left lower
  body:           new THREE.Vector3(0, -0.1, 0.2),     // bottom front
  will:           new THREE.Vector3(0, -0.05, 0.15),   // lower front
};
