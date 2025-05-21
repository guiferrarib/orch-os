/* eslint-disable react/no-unknown-property */
import { useQuantumVisualization, QuantumFrequencyBand } from '../QuantumVisualizationContext';
import { QuantumSuperposition } from './QuantumSuperposition';
import { WaveCollapse } from './WaveCollapse';
import { QuantumEntanglement } from './QuantumEntanglement';
import { ProbabilityFields } from './ProbabilityFields';
import { InterferencePatterns } from './InterferencePatterns';
import { Observer, getCorePosition } from './QuantumUtils';

/**
 * Main component that orchestrates the complete visualization
 * Integra todos os componentes de visualização quântica e os orquestra 
 * de acordo com os estados quânticos e eventos cognitivos baseados em Orch OR
 * 
 * Baseado na teoria de Penrose-Hameroff, que propõe que a consciência emerge
 * de processos quânticos em microtúbulos neurais que culminam em eventos de
 * "redução objetiva orquestrada" (Orch OR).
 */
export function QuantumField() {
  // Obter os estados quânticos da teoria Orch OR
  const {
    quantumSuperpositions,
    quantumEntanglements,
    objectiveReductions,
    consciousStates,
    tubulinCoherenceLevel
    // Removidas variáveis não utilizadas: observerState, activeRegion, orchestrationIntensity
  } = useQuantumVisualization();
  
  // Determinar quais fenômenos quânticos mostrar baseado nos eventos cognitivos
  // Traduzindo o modelo Orch OR para efeitos visuais
  const showConsciousStates = consciousStates.length > 0;
  const showQuantumCoherence = quantumEntanglements.length > 0 || tubulinCoherenceLevel > 0.5;
  
  // Na teoria Orch-OR, sempre há algum nível de atividade quântica nos microtúbulos
  // Vamos implementar dois níveis de atividade: estimulado e base/repouso

  // Verificar se há algum efeito quântico estimulado
  const hasStimulatedQuantumEffects = 
    quantumSuperpositions.length > 2 || // permitir até 2 superposições em estado basal
    quantumEntanglements.length > 1 || // permitir 1 entanglement em estado basal
    objectiveReductions.length > 1 || // permitir 1 redução em estado basal
    consciousStates.length > 0; // consciousStates só existem sob estímulo

  // Se não houver estímulo, mostrar a atividade quântica basal
  // Baseado na teoria Orch-OR de Penrose-Hameroff que prevê oscilações quânticas constantes nos microtúbulos
  if (!hasStimulatedQuantumEffects) {
    return (
      <group>
        {/* Campos de probabilidade quântica - representação de atividade base constante */}
        <ProbabilityFields particleCount={60} />
        
        {/* Padrões de interferência quântica - sempre presentes em nível basal */}
        <InterferencePatterns />
        
        {/* Superposições quânticas em nível basal - oscilações Fröhlich (8MHz) */}
        <group position={[0, 0, 0]}>
          <QuantumSuperposition amount={2} />
        </group>
        <group position={[1.5, 0.5, -0.5]}>
          <QuantumSuperposition amount={1} />
        </group>
        
        {/* Entanglement quântico em nível basal - coerência quântica fundamental */}
        <group position={[-1, 0.2, 0]}>
          <QuantumEntanglement pairs={1} />
        </group>
        
        {/* Redução objetiva em nível basal - eventos OR espontâneos de baixo nível */}
        <group position={[0, 0.2, -1]}>
          <WaveCollapse 
            active={true} 
            isNonComputable={false}
            color="#00B4D8"
          />
        </group>
      </group>
    );
  }
  
  return (
    <group>
      {/* Probability fields - representam campos quânticos em microtúbulos */}
      {quantumEntanglements.map((effect) => {
        // O número de partículas representa a intensidade da coerência quântica
        // Em Orch OR, a coerência entre tubulinas é essencial para a consciência
        const particleCount = Math.floor(100 + effect.amplitude * 100);
        
        return (
          <group key={effect.id} position={getCorePosition(effect.core)}>
            <ProbabilityFields particleCount={particleCount} />
          </group>
        );
      })}
      
      {/* Superposições quânticas na estrutura microtubular */}
      {quantumSuperpositions.slice(0, 13).map((effect) => {
        // Nível de coerência quântica afeta a quantidade de elementos
        // Isso representa os dímeros de tubulina em estado de superposição
        // Limite científico: máximo de 13 elementos de superposição, conforme número de protofilamentos/microtúbulo na teoria Orch-OR
        // O valor é derivado de 'effect.amplitude' (intensidade do efeito)
        const amount = Math.min(13, Math.floor(5 + (effect.amplitude ?? 0) * 7));
        return (
          <group key={effect.id} position={getCorePosition(effect.core)}>
            <QuantumSuperposition amount={amount} />
          </group>
        );
      })}
      
      {/* Reduções objetivas (OR) - momentos de consciência segundo Orch OR */}
      {objectiveReductions.map((effect) => {
        // Na teoria Orch OR, a redução objetiva (OR) causa momentos de consciência
        // quando a auto-energia gravitacional atinge um limiar crítico
        // O aspecto "não-computável" é central na teoria de Penrose
        const isNonComputable = effect.nonComputable ?? false;
        
        return (
          <group key={effect.id} position={getCorePosition(effect.core)}>
            <WaveCollapse 
              active={true} 
              isNonComputable={isNonComputable}
              // Cores baseadas na banda de frequência - cada frequência representa 
              // diferentes níveis hierárquicos na atividade neuronal
              color={effect.frequencyBand === QuantumFrequencyBand.TERAHERTZ ? "#FF00FF" : // Nível quântico fundamental
                    effect.frequencyBand === QuantumFrequencyBand.GIGAHERTZ ? "#00FFFF" :  // Oscilações de Fröhlich
                    effect.frequencyBand === QuantumFrequencyBand.MEGAHERTZ ? "#FFFF00" :  // Coerência de microtúbulos
                    "#00FF00"}                                                          // Atividade macro-neuronal
            />
          </group>
        );
      })}
      
      {/* Quantum entanglement between regions - coerência quântica entre regiões cerebrais */}
      {showQuantumCoherence && (
        <group>
          {/* Limite científico: máximo de 32 pares de emaranhamento, conforme plausibilidade física da teoria Orch-OR */}
          <QuantumEntanglement pairs={Math.min(32, Math.floor(5 + tubulinCoherenceLevel * 10))} />
        </group>
      )}
      
      {/* Padrões de interferência - emergem quando há alta coerência quântica */}
      {tubulinCoherenceLevel > 0.7 && (
        <InterferencePatterns />
      )}
      
      {/* O observador quântico - aspecto protoconsciente na teoria Orch OR */}
      {showConsciousStates && (
        <Observer />
      )}
    </group>
  );
}