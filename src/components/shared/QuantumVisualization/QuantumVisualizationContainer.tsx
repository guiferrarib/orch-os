// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { useState, useEffect, useRef } from 'react';
import './QuantumVisualization.css';
import { QuantumVisualizationProvider, useQuantumVisualization, QuantumFrequencyBand } from './QuantumVisualizationContext';
import { CognitionEvent } from '../../context/deepgram/types/CognitionEvent';
import { QuantumModel } from './index';
import { QuantumLegend } from './QuantumLegend';

// Define cognition event types as constants (since there's no enum)
const EVENT_TYPES = {
  RAW_PROMPT: 'raw_prompt',
  TEMPORARY_CONTEXT: 'temporary_context',
  NEURAL_SIGNAL: 'neural_signal',
  SYMBOLIC_RETRIEVAL: 'symbolic_retrieval',
  FUSION_INITIATED: 'fusion_initiated',
  NEURAL_COLLAPSE: 'neural_collapse',
  SYMBOLIC_CONTEXT_SYNTHESIZED: 'symbolic_context_synthesized',
  GPT_RESPONSE: 'gpt_response',
  EMERGENT_PATTERNS: 'emergent_patterns'
};

interface QuantumVisualizationContainerProps {
  cognitionEvents: CognitionEvent[] | null;
  width?: string;
  height?: string;
  showLegend?: boolean;
  resetDelay?: number; // Atraso para resetar efeitos (ms)
  lowPerformanceMode?: boolean; // Modo de baixa performance para dispositivos menos potentes
}

/**
 * Container component for the 3D quantum consciousness visualization
 * This component sets up all the necessary context and event handling
 * while presenting a quantum-based representation instead of an anthropomorphic brain
 */
export const QuantumVisualizationContainer: React.FC<QuantumVisualizationContainerProps> = ({
  cognitionEvents,
  width = '100%',
  height = '280px',
  showLegend = true,
  resetDelay = 2000, // Valor padrão de 2000ms
  lowPerformanceMode = false
}) => {
  return (
    <QuantumVisualizationProvider>
      <QuantumVisualizationContent 
        cognitionEvents={cognitionEvents} 
        width={width} 
        height={height}
        showLegend={showLegend}
      />
    </QuantumVisualizationProvider>
  );
};

// Inner component to use hooks with context
const QuantumVisualizationContent: React.FC<QuantumVisualizationContainerProps> = ({
  cognitionEvents,
  width,
  height,
  showLegend,
  resetDelay = 2000,
  lowPerformanceMode = false
}) => {
  // Get quantum context functions from the Orch OR model
  const {
    // Quantum states based on Orchestrated Objective Reduction theory
    quantumSuperpositions,
    quantumEntanglements,
    objectiveReductions,
    consciousStates,
    
    // Observer states
    activeRegion,
    observerState,
    
    // Orch OR-specific methods
    addQuantumSuperposition,
    addQuantumEntanglement,
    addObjectiveReduction,
    addConsciousState,
    setObserverState,
    setActiveRegion,
    
    // Orchestration metrics
    tubulinCoherenceLevel,
    orchestrationIntensity,
    setPlanckScaleFeedback,
    
    // Effect management
    clearAllEffects,
    setTubulinCoherenceLevel,
    setOrchestrationIntensity
  } = useQuantumVisualization();
  
  // Referência para rastrear se já inicializamos os efeitos quânticos basais
  const initializedRef = useRef(false);
  
  // Initialize quantum state effects - baseado na teoria Orch-OR, apenas UMA VEZ
  useEffect(() => {
    // Evitar múltiplas inicializações
    if (initializedRef.current) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrchORContainer] Quantum effects already initialized, skipping', new Date().toISOString());
      }
      return;
    }
    
    // Configurar o estado quântico base apenas uma vez na montagem inicial
    if (process.env.NODE_ENV !== 'production') {
      console.log('[OrchORContainer] INITIALIZING quantum state (one-time)', new Date().toISOString());
    }
    
    // Apenas reseta os estados uma vez para garantir início limpo
    clearAllEffects(); // Isso agora mantém um estado basal (Modificamos o clearAllEffects)
    
    // Marcar como inicializado para evitar chamadas repetidas
    initializedRef.current = true;
    
    // Coerencia e orquestração nos níveis MÁXIMOS para maior visualização
    setTubulinCoherenceLevel(0.9); // Máxima coerência
    setOrchestrationIntensity(0.95); // Máxima orquestração
    
    // Active region - tudo ativo para maior visualização
    setActiveRegion('THALAMUS');
    
    // Observer sempre ativo
    setObserverState('active');
  }, [clearAllEffects, addQuantumSuperposition, addQuantumEntanglement, addObjectiveReduction, 
      addConsciousState, setTubulinCoherenceLevel, setOrchestrationIntensity, setActiveRegion, setObserverState]);
  
  // State to control whether the legend is visible
  const [legendVisible, setLegendVisible] = useState(showLegend);
  
  // Ref para o container DOM
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Event processing - runs only once for each batch of events
  const eventsRef = React.useRef<CognitionEvent[] | null>(null);
  
  // Função de utilidade para comparar arrays de eventos de forma eficiente
  const areEventArraysEqual = (a: CognitionEvent[] | null, b: CognitionEvent[] | null): boolean => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    
    // Comparação baseada em tipo e timestamp dos eventos (mais eficiente que JSON.stringify)
    return a.every((event, index) => {
      const eventA = a[index];
      const eventB = b[index];
      // Comparar propriedades essenciais em vez do objeto inteiro
      return eventA.type === eventB.type && 
             eventA.timestamp === eventB.timestamp && 
             (('core' in eventA && 'core' in eventB) ? eventA.core === eventB.core : true) &&
             (('selectedCore' in eventA && 'selectedCore' in eventB) ? eventA.selectedCore === eventB.selectedCore : true);
    });
  };
  
  useEffect(() => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[OrchORContainer] cognitionEvents received:', cognitionEvents, new Date().toISOString());
      }
      
      // Se modo de baixa performance, reduzir processamento
      if (lowPerformanceMode && cognitionEvents && cognitionEvents.length > 3) {
        // No modo de baixa performance, processa apenas os 3 eventos mais recentes
        cognitionEvents = cognitionEvents.slice(-3);
      }
      
      // Verifica se há efeitos quânticos ativos baseado na teoria Orch OR
      const hasActiveEffects =
        quantumSuperpositions.length > 0 ||
        quantumEntanglements.length > 0 ||
        objectiveReductions.length > 0 ||
        consciousStates.length > 0;
      
      // Se não há eventos cognitivos, mas já iniciamos a visualização de repouso, não fazer nada
      // Isso permite que os efeitos quânticos de repouso que adicionamos permaneçam ativos
      if (!cognitionEvents || cognitionEvents.length === 0) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrchORContainer] No cognitionEvents, keeping base quantum state', new Date().toISOString());
        }
        // Não limpar efeitos - permitir que a visualização mantenha seu estado base
        return;
      }
      
      // Skip if these are the same events we already processed - usando comparação otimizada
      if (areEventArraysEqual(eventsRef.current, cognitionEvents)) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[OrchORContainer] cognitionEvents already processed', new Date().toISOString());
        }
        return;
      }
      
      // Save current events to avoid reprocessing
      eventsRef.current = cognitionEvents;
      
      // Sinaliza quando devemos ativar feedback da escala de Planck
      // Segundo a teoria Orch OR, alguns fenômenos ocorrem na escala quântica fundamental
      let hasPlanckScaleActivity = false;
      
      // Process each event in the batch
      cognitionEvents.forEach(event => {
        try {
          // Extract core (região cerebral/módulo cognitivo)
          let core = "unknown";
          if ('core' in event) core = event.core;
          else if ('selectedCore' in event) core = event.selectedCore;
          
          // Determina a banda de frequência baseada no tipo de evento
          // De acordo com a teoria Orch OR, diferentes fenômenos ocorrem em diferentes bandas
          let frequencyBand: QuantumFrequencyBand;
          
          if (process.env.NODE_ENV !== 'production') {
            console.log('[OrchORContainer] Processing event:', event, 'core:', core, new Date().toISOString());
          }
          
          // Mapeia os eventos cognitivos aos fenômenos da teoria Orch OR
          switch (event.type) {
            // Pré-Consciente: Superposições Quânticas (alta frequência - nível de tubulina)
            case EVENT_TYPES.NEURAL_SIGNAL:
              // Sinais neurais são processados como superposições quânticas nas maiores frequências
              frequencyBand = QuantumFrequencyBand.TERAHERTZ;
              addQuantumSuperposition(core, frequencyBand);
              hasPlanckScaleActivity = true; // Ocorre na escala de Planck (fundamental)
              break;

            case EVENT_TYPES.EMERGENT_PATTERNS:
              // Padrões emergentes são superposições quanticas em frequências um pouco menores
              frequencyBand = QuantumFrequencyBand.GIGAHERTZ;
              addQuantumSuperposition(core, frequencyBand);
              break;
            
            // Coerência Quântica: Entanglement (sincronização de estados quânticos)
            case EVENT_TYPES.FUSION_INITIATED:
              // Eventos de fusão representam entrelamento quântico entre microtúbulos
              frequencyBand = QuantumFrequencyBand.GIGAHERTZ;
              addQuantumEntanglement(core, frequencyBand);
              break;

            // Redução Objetiva: Colapso da função de onda quântica (proto-consciência)
            case EVENT_TYPES.NEURAL_COLLAPSE:
              // Colapsos neurais representam redução objetiva (OR) nas frequências médias
              frequencyBand = QuantumFrequencyBand.MEGAHERTZ;
              addObjectiveReduction(core, frequencyBand);
              break;

            case EVENT_TYPES.SYMBOLIC_RETRIEVAL:
              // Recuperação simbólica também representa redução objetiva (OR) mas em diferentes frequências
              frequencyBand = QuantumFrequencyBand.KILOHERTZ;
              addObjectiveReduction(core, frequencyBand);
              break;
            
            // Estados Conscientes: Resultado pós-colapso quântico (consciência)
            case EVENT_TYPES.SYMBOLIC_CONTEXT_SYNTHESIZED:
              // Síntese de contexto representa um momento consciente resultante de OR
              frequencyBand = QuantumFrequencyBand.KILOHERTZ;
              addConsciousState(core, frequencyBand);
              break;

            case EVENT_TYPES.GPT_RESPONSE:
              // Resposta GPT é um estado consciente pleno (nível macro)
              frequencyBand = QuantumFrequencyBand.HERTZ;
              addConsciousState(core, frequencyBand);
              break;

            case EVENT_TYPES.RAW_PROMPT:
              // Prompt inicial também é um momento consciente, mas ativa o observador
              setObserverState('active');
              frequencyBand = QuantumFrequencyBand.HERTZ;
              addConsciousState(core, frequencyBand);
              break;
          }
          
          // Set active region
          setActiveRegion(core);
            
          // De acordo com Penrose-Hameroff, alguns fenômenos quânticos ocorrem na escala de Planck
          if (hasPlanckScaleActivity) {
            setPlanckScaleFeedback(true);
          }
        } catch (error) {
          console.error('[OrchORContainer] Error processing event:', error);
        }
      });
      
      // Reset observer após um atraso configurável
      // Na teoria Orch OR, este tempo corresponde aproximadamente a um "momento de consciência"
      const timer = setTimeout(() => {
        setObserverState('inactive');
        setActiveRegion(null);
        setPlanckScaleFeedback(false);
      }, resetDelay);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('[OrchORContainer] Error in quantum event processing:', error);
    }
  }, [
    cognitionEvents, 
    clearAllEffects, 
    addQuantumSuperposition, 
    addQuantumEntanglement, 
    addObjectiveReduction, 
    addConsciousState,
    setObserverState, 
    setActiveRegion, 
    setPlanckScaleFeedback,
    quantumSuperpositions, 
    quantumEntanglements, 
    objectiveReductions, 
    consciousStates,
    resetDelay,
    lowPerformanceMode
  ]);

  // Toggle legend visibility
  const toggleLegend = () => setLegendVisible(prev => !prev);

  // Create custom CSS properties if custom sizes are needed (usando Ref em vez de querySelector)
  useEffect(() => {
    try {
      if (containerRef.current && width !== '100%' && height !== '280px') {
        containerRef.current.setAttribute('style', `--custom-width: ${width}; --custom-height: ${height}`);
      }
    } catch (error) {
      console.error('[QuantumVisualizationContainer] Error setting container styles:', error);
    }
  }, [width, height]);

  // Adiciona classes específicas para os estados de Orch OR
  const getOrchORClassNames = () => {
    const classNames = [];
    
    // Classes refletindo intensidades
    if (tubulinCoherenceLevel > 0.7) classNames.push('high-coherence');
    else if (tubulinCoherenceLevel > 0.3) classNames.push('medium-coherence');
    else classNames.push('low-coherence');
    
    if (orchestrationIntensity > 0.7) classNames.push('intense-orchestration');
    else if (orchestrationIntensity > 0.3) classNames.push('medium-orchestration');
    else classNames.push('minimal-orchestration');
    
    // Classes baseadas no estado predominante
    const hasSuperpositions = quantumSuperpositions.length > 0;
    const hasEntanglements = quantumEntanglements.length > 0;
    const hasReductions = objectiveReductions.length > 0;
    const hasConsciousStates = consciousStates.length > 0;
    
    if (hasSuperpositions) classNames.push('quantum-superposition-active');
    if (hasEntanglements) classNames.push('quantum-entanglement-active');
    if (hasReductions) classNames.push('objective-reduction-active');
    if (hasConsciousStates) classNames.push('conscious-moment-active');
    
    return classNames.join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className={`quantum-visualization-container 
        ${height === '280px' ? 'fixed-height' : ''} 
        ${width === '100%' ? 'fixed-width' : ''} 
        ${lowPerformanceMode ? 'low-performance-mode' : ''}
        ${getOrchORClassNames()}
      `}
      data-width={width !== '100%' ? width : undefined}
      data-height={height !== '280px' ? height : undefined}
      data-coherence={tubulinCoherenceLevel.toFixed(2)}
      data-orchestration={orchestrationIntensity.toFixed(2)}
    >
      {/* Quantum Visualization always visible */}
      <QuantumModel />

      {/* Botão de toggle para a legenda quântica */}
      <button 
        className="quantum-legend-toggle" 
        onClick={toggleLegend}
        aria-label="Toggle quantum legend"
        title="Toggle quantum legend"
      >
        {legendVisible ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 4C7 4 2.73 7.11 1 12c1.73 4.89 6 8 11 8s9.27-3.11 11-8c-1.73-4.89-6-8-11-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>
          </svg>
        )}
      </button>
      
      {/* Legend for quantum phenomena */}
      {legendVisible && <QuantumLegend />}
    </div>
  );
};

export default QuantumVisualizationContainer;
