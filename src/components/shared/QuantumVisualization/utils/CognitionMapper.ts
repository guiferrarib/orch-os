// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { CognitionEvent } from '../../../context/deepgram/types/CognitionEvent';
import { QuantumFrequencyBand } from '../QuantumVisualizationContext';

// Type guards para os diferentes tipos de eventos cognitivos
function isNeuralCollapseEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'neural_collapse' }> {
  return event.type === 'neural_collapse';
}

function isNeuralSignalEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'neural_signal' }> {
  return event.type === 'neural_signal';
}

function isSymbolicRetrievalEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'symbolic_retrieval' }> {
  return event.type === 'symbolic_retrieval';
}

function isFusionInitiatedEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'fusion_initiated' }> {
  return event.type === 'fusion_initiated';
}

function isSymbolicContextSynthesizedEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'symbolic_context_synthesized' }> {
  return event.type === 'symbolic_context_synthesized';
}

function isEmergentPatternsEvent(event: CognitionEvent): event is Extract<CognitionEvent, { type: 'emergent_patterns' }> {
  return event.type === 'emergent_patterns';
}

/**
 * Constantes científicas da teoria Orch-OR (Penrose-Hameroff)
 * Valores refinados baseados em publicações científicas recentes
 */
export const ORCH_OR_CONSTANTS = {
  // Duração dos eventos quânticos (milissegundos)
  // Dilatados para visualização didática
  SUPERPOSITION_DURATION_MS: 600,   // Dilatação didática dos ~25ms reais
  COHERENCE_BUILDUP_MS: 250,        // Dilatação didática dos ~75ms reais
  CONSCIOUS_MOMENT_MS: 1500,        // Dilatação didática dos ~100ms reais
  
  // Níveis de coerência quântica (valores normalizados)
  MIN_COHERENCE: 0.05,              // Coerência mínima em repouso
  BASELINE_COHERENCE: 0.3,          // Coerência basal normal
  ENTANGLEMENT_THRESHOLD: 0.6,      // Limiar para emaranhamento quântico significativo
  COLLAPSE_THRESHOLD: 0.85,         // Limiar para colapso iminente
};

/**
 * Determina a banda de frequência quântica correspondente a um tipo de evento cognitivo
 * TERAHERTZ: Atividade quântica isolada (alta energia)
 * GIGAHERTZ: Atividade quântica em grupos de tubulinas
 * MEGAHERTZ: Coerência em grupos de microtúbulos
 * KILOHERTZ: Integração microtubular em escala neuronal
 * HERTZ: Oscilações macroscópicas em redes neurais (EEG)
 */
export const getFrequencyBandForEvent = (event: CognitionEvent): QuantumFrequencyBand => {
  const type = event.type;
  
  // Eventos de alto nível cognitivo - baixa frequência
  if (type === 'neural_collapse' || type === 'symbolic_context_synthesized') {
    return QuantumFrequencyBand.HERTZ; // EEG theta-gamma
  }
  
  // Eventos de processamento intermediário - frequências médias
  if (type === 'fusion_initiated' || type === 'symbolic_retrieval') {
    return QuantumFrequencyBand.KILOHERTZ; // Atividade neural local
  }
  
  // Eventos de nível básico/sensorial - maiores frequências
  if (type === 'neural_signal' || type === 'raw_prompt') {
    return QuantumFrequencyBand.MEGAHERTZ; // Atividade de microtúbulos
  }
  
  // Eventos extremamente rápidos/primitivos - frequências ultrarápidas
  if (type === 'emergent_patterns') {
    return QuantumFrequencyBand.GIGAHERTZ; // Vibrações quânticas
  }
  
  // Processos macroscópicos - EEG
  if (type === 'gpt_response') {
    return QuantumFrequencyBand.HERTZ;
  }
  
  // Nível fundamental para outras interações
  return QuantumFrequencyBand.TERAHERTZ; // Nível base
};

/**
 * Calcula a amplitude do efeito quântico baseado no tipo e propriedades do evento
 * Baseado na teoria Orch-OR sobre intensidade de processos quânticos
 */
export const getAmplitudeForEvent = (event: CognitionEvent): number => {
  // Para eventos com informação explícita de intensidade
  if (isNeuralSignalEvent(event)) {
    return Math.max(0.2, Math.min(1, event.intensity));
  }
  
  // Para eventos de colapso que usam carga emocional
  if (isNeuralCollapseEvent(event)) {
    return Math.max(0.5, Math.min(1, event.emotionalWeight));
  }
  
  // Symbolic_retrieval - baseado na quantidade de insights
  if (isSymbolicRetrievalEvent(event)) {
    return Math.max(0.3, Math.min(1, (event.insights.length / 10)));
  }
  
  // Variação padrão dependendo do tipo de evento
  if (isNeuralCollapseEvent(event)) return 0.9;  // Colapsos são eventos de alta amplitude
  if (isFusionInitiatedEvent(event)) return 0.7; // Fusão tem amplitude moderada-alta
  if (isSymbolicContextSynthesizedEvent(event)) return 0.8; // Síntese tem alta amplitude
  
  return 0.5 + (Math.random() * 0.2); // Outros eventos - amplitude média com variação
};

/**
 * Determina se um evento cognitivo é não-computável 
 * Baseado na teoria de Penrose sobre a não-computabilidade da consciência
 */
export const isNonComputableEvent = (event: CognitionEvent): boolean => {
  // Neural_collapse possui informação sobre determinismo
  if (isNeuralCollapseEvent(event)) {
    return 'isDeterministic' in event ? !event.isDeterministic : true; // Não-determinístico = não-computável
  }
  
  // Probabilidades de não-computabilidade baseadas na teoria
  if (isEmergentPatternsEvent(event)) {
    return Math.random() < 0.7; // Padrões emergentes frequentemente não-computáveis
  }
  
  if (isSymbolicContextSynthesizedEvent(event)) {
    return Math.random() < 0.4; // Síntese parcialmente não-computável
  }
  
  return false; // Maioria dos eventos são computáveis
};

/**
 * Faz mapeamento refinado de eventos cognitivos para regiões cerebrais
 * Baseado na teoria Orch-OR e nos modelos de consciência quântica
 */
export const getCoreForEvent = (event: CognitionEvent): string => {
  const type = event.type;
  
  if (type === 'raw_prompt' || type === 'temporary_context') {
    return 'SENSORY_CORTEX';      // Entrada sensorial inicial
  }
  if (type === 'neural_signal') {
    return 'THALAMUS';            // Processamento subcortical
  }
  if (type === 'symbolic_retrieval') {
    return 'HIPPOCAMPUS';         // Memória e recuperação
  }
  if (type === 'fusion_initiated') {
    return 'PREFRONTAL_CORTEX';   // Integração e fusão de informação
  }
  if (type === 'neural_collapse') {
    return 'GLOBAL_WORKSPACE';    // Espaço de trabalho global - consciência
  }
  if (type === 'symbolic_context_synthesized') {
    return 'CORTICAL_COLUMNS';    // Minicoluna cortical - unidade de processamento
  }
  if (type === 'gpt_response') {
    return 'LANGUAGE_CENTERS';    // Áreas de linguagem
  }
  if (type === 'emergent_patterns') {
    return 'ASSOCIATION_AREAS';   // Áreas associativas multimodais
  }
  return 'THALAMUS';            // Default: tálamo como integrador central
};

/**
 * Mapeia eventos cognitivos para propriedades quânticas segundo a teoria Orch-OR
 * Esta é a função principal para tradução de estados cognitivos para fenômenos quânticos
 */
export const mapCognitionEventToQuantumProperties = (event: CognitionEvent) => {
  return {
    core: getCoreForEvent(event),
    frequencyBand: getFrequencyBandForEvent(event),
    amplitude: getAmplitudeForEvent(event),
    nonComputable: isNonComputableEvent(event),
    // Uma função auxiliar para determinar o nível do tripleto de acordo com a teoria
    tripletLevel: getTripletLevel(event)
  };
};

/**
 * Determina o nível do tripleto de acordo com a teoria Orch-OR
 * Na teoria, informações são organizadas em "triplets of triplets"
 */
export const getTripletLevel = (event: CognitionEvent): 'primary' | 'secondary' | 'tertiary' => {
  if (isNeuralCollapseEvent(event)) return 'tertiary';
  if (isSymbolicContextSynthesizedEvent(event)) return 'secondary';
  if (isFusionInitiatedEvent(event)) return 'secondary';
  if (isSymbolicRetrievalEvent(event) && event.insights.length > 5) return 'secondary';
  return 'primary';
};
