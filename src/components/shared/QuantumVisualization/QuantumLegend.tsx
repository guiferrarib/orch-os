// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { useQuantumVisualization, OrchORState } from './QuantumVisualizationContext';
import './QuantumVisualization.css';

interface LegendItemProps {
  label: string;
  color: string;
  active?: boolean;
}

const LegendItem: React.FC<LegendItemProps> = ({ label, color, active = false }) => {
  return (
    <div className={`quantum-legend-item ${active ? 'active' : ''}`}>
      <div 
        className={`quantum-legend-indicator quantum-color-${label.toLowerCase().replace(' ', '-')}`} 
        data-color={color}
      />
      <span className="quantum-legend-label">{label}</span>
    </div>
  );
};

/**
 * Component that displays legends for quantum phenomena in the visualization
 * Shows which phenomena are active at a specific moment
 */
export const QuantumLegend: React.FC = () => {
  const {
    quantumSuperpositions,
    objectiveReductions,
    quantumEntanglements,
    consciousStates,
    tubulinCoherenceLevel,
    orchestrationIntensity,
    observerState
  } = useQuantumVisualization();

  // Determine if each Orch OR quantum phenomenon is active based on events
  const isSuperpositionActive = quantumSuperpositions.length > 0;
  const isObjectiveReductionActive = objectiveReductions.length > 0;
  const isQuantumEntanglementActive = quantumEntanglements.length > 0;
  const isConsciousStateActive = consciousStates.length > 0;
  
  // Assegurar que tubulina e orquestração estejam ativas no estado de repouso
  // Mesmo sem eventos cognitivos, há um nível básico de coerência quântica
  // de acordo com a teoria Orch-OR
  const isCoherenceActive = true; // Sempre ativo para refletir o estado quântico de base
  const isOrchestrationActive = true; // Sempre ativo para refletir orquestração em nível base
  const isObserverActive = observerState === 'active' || consciousStates.length > 0;

  return (
    <div className="quantum-legend">
      <LegendItem 
        label="Quantum Superposition" 
        color="#9D6AFF" 
        active={isSuperpositionActive} 
      />
      <LegendItem 
        label="Objective Reduction" 
        color="#00B4D8" 
        active={isObjectiveReductionActive} 
      />
      <LegendItem 
        label="Quantum Entanglement" 
        color="#E63B7A" 
        active={isQuantumEntanglementActive} 
      />
      <LegendItem 
        label="Conscious State" 
        color="#3BE669" 
        active={isConsciousStateActive} 
      />
      <LegendItem 
        label="Tubulin Coherence" 
        color="#FFD166" 
        active={isCoherenceActive} 
      />
      <LegendItem 
        label="Orchestration" 
        color="#00CBD1" 
        active={isOrchestrationActive} 
      />
      <LegendItem 
        label="Observer" 
        color="#FFFFFF" 
        active={isObserverActive} 
      />
    </div>
  );
};

export default QuantumLegend;
