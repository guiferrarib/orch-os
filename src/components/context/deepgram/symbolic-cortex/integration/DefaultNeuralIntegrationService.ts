// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { IOpenAIService } from '../../interfaces/openai/IOpenAIService';
import { OpenAIEmbeddingService } from '../../services/openai/OpenAIEmbeddingService';
import symbolicCognitionTimelineLogger from '../../services/utils/SymbolicCognitionTimelineLoggerSingleton';
import { SymbolicInsight } from '../../types/SymbolicInsight';
import { ICollapseStrategyService } from './ICollapseStrategyService';
import { INeuralIntegrationService } from './INeuralIntegrationService';
import { OpenAICollapseStrategyService } from './OpenAICollapseStrategyService';
import { SuperpositionLayer } from './SuperpositionLayer';

function asNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' ? val : fallback;
}

export class DefaultNeuralIntegrationService implements INeuralIntegrationService {
  private embeddingService: OpenAIEmbeddingService;
  private collapseStrategyService: ICollapseStrategyService;

  constructor(private openAIService: IOpenAIService) {
    this.embeddingService = new OpenAIEmbeddingService(openAIService);
    this.collapseStrategyService = new OpenAICollapseStrategyService(openAIService);
  }
  
  /**
   * Calculates a symbolic phase value based on emotional weight, contradiction score, and coherence
   * Returns a value between 0-2π that represents a phase angle for wave interference
   */
  private calculateSymbolicPhase(emotionalWeight: number, contradictionScore: number, coherence: number): number {
    const baseEmotionPhase = emotionalWeight * Math.PI / 2; // Emotions dominate initial phase
    const contradictionPhase = contradictionScore * Math.PI; // Contradictions generate opposition
    const coherenceNoise = (1 - coherence) * (Math.PI / 4); // Low coherence → noise

    // Total phase with 2π wrapping
    const phase = (baseEmotionPhase + contradictionPhase + coherenceNoise) % (2 * Math.PI);
    
    // Ensure phase is positive (0 to 2π range)
    const normalizedPhase = phase < 0 ? phase + 2 * Math.PI : phase;
    
    console.info(`[NeuralIntegration] Calculated symbolic phase: ${normalizedPhase.toFixed(3)} rad (emotionPhase=${baseEmotionPhase.toFixed(2)}, contradictionPhase=${contradictionPhase.toFixed(2)}, coherenceNoise=${coherenceNoise.toFixed(2)})`);
    
    return normalizedPhase;
  }

  /**
   * Neural integration using superposition, non-deterministic collapse and emergent property registration.
   * Now uses real embeddings for each answer via OpenAIEmbeddingService.
   */
  async integrate(
    neuralResults: Array<{
      core: string;
      intensity: number;
      output: string;
      insights: Record<string, unknown>;
    }>,
    originalInput: string,
    contextualMeta: Record<string, unknown>
  ): Promise<string> {
    if (!neuralResults || neuralResults.length === 0) {
      return originalInput;
    }
    // 1. Superposition: each result is a possible answer
    const superposition = new SuperpositionLayer();
    for (const result of neuralResults) {
      // Generate real embedding for the answer text
      const embedding = await this.embeddingService.createEmbedding(result.output);
      // Heuristics for emotional weight, coherence and contradiction
      const emotionalWeight = asNumber((result.insights as Record<string, unknown>)?.valence, Math.random());
      const narrativeCoherence = asNumber((result.insights as Record<string, unknown>)?.coherence, 1 - Math.abs(result.intensity - 0.5));
      const contradictionScore = asNumber((result.insights as Record<string, unknown>)?.contradiction, Math.random() * 0.5);
      superposition.register({
        embedding,
        text: result.output,
        emotionalWeight,
        narrativeCoherence,
        contradictionScore,
        origin: result.core,
        insights: result.insights
      });
    }
    // 2. Collapse: Use OpenAI-based strategy to decide deterministic vs probabilistic
    const numCandidates = superposition.answers.length;
    
    // Calculate average values for symbolic properties
    const averageEmotionalWeight = neuralResults.reduce((sum, r) => {
      return sum + asNumber((r.insights as Record<string, unknown>)?.valence, 0.5);
    }, 0) / neuralResults.length;
    const averageContradictionScore = neuralResults.reduce((sum, r) => {
      return sum + asNumber((r.insights as Record<string, unknown>)?.contradiction, 0.25);
    }, 0) / neuralResults.length;
    const avgCoherence = neuralResults.reduce((sum, r) => {
      return sum + asNumber((r.insights as Record<string, unknown>)?.coherence, 0.7);
    }, 0) / neuralResults.length;
    
    // We'll use the original input text for the collapse strategy service to infer intent
    // No need to extract intent data from contextualMeta as we'll let OpenAI infer it
    
    // Use our OpenAI-powered strategy service to make the decision
    const strategyDecision = await this.collapseStrategyService.decideCollapseStrategy({
      activatedCores: neuralResults.map(r => r.core),
      averageEmotionalWeight,
      averageContradictionScore,
      originalText: originalInput // Pass the original text to help infer intent
    });
    
    // Log collapse details for debugging
    console.info(`[NeuralIntegration] Collapse strategy decision: ${strategyDecision.deterministic ? 'Deterministic' : 'Probabilistic'}, Temperature: ${strategyDecision.temperature}, Reason: ${strategyDecision.justification}`);
    
    // Log user intent if available
    if (strategyDecision.userIntent) {
      console.info(`[NeuralIntegration] Inferred user intent:`, JSON.stringify(strategyDecision.userIntent, null, 2));
    }
    
    // Collect insights from all neural results
    const allInsights = neuralResults.flatMap(result => {
      if (!result.insights) return [];
      
      const toInsight = (type: string, content: string): SymbolicInsight => ({
        type,
        content: content,
        core: result.core
      } as SymbolicInsight);
      
      // For arrays of insights
      if (Array.isArray(result.insights)) {
        return result.insights
          .map(item => {
            // String insights
            if (typeof item === 'string') {
              return toInsight('concept', item);
            }
            // Object insights
            if (item && typeof item === 'object') {
              const obj = item as Record<string, unknown>;
              const type = (typeof obj.type === 'string') ? obj.type : 'unknown';
              let content = '';
              
              if (typeof obj.content === 'string') content = obj.content;
              else if (typeof obj.value === 'string') content = obj.value;
              else content = String(type);
              
              return toInsight(type, content);
            }
            return null;
          })
          .filter(Boolean) as SymbolicInsight[];
      }
      
      // For unique objects
      if (result.insights && typeof result.insights === 'object') {
        const obj = result.insights as Record<string, unknown>;
        
        // With defined type
        if ('type' in obj && typeof obj.type === 'string') {
          let content = '';
          if (typeof obj.content === 'string') content = obj.content;
          else if (typeof obj.value === 'string') content = obj.value;
          else content = obj.type;
          
          return [toInsight(obj.type, content)];
        }
        
        // Without defined type - each property becomes an insight
        return Object.entries(obj)
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => toInsight(k, String(v)));
      }
      
      return [];
    });
    
    // Execute the collapse based on the strategy decision
    let finalAnswer;
    
    // Create a default userIntent if none was provided by the collapse strategy
    const defaultUserIntent = {
      social: originalInput.toLowerCase().includes('olá') ? 0.7 : 0.3,
      trivial: originalInput.toLowerCase().includes('tudo bem') ? 0.5 : 0.2,
      reflective: 0.3,
      practical: 0.2
    };
    
    // Use the inferred intent or the default one
    const effectiveUserIntent = strategyDecision.userIntent || defaultUserIntent;
    
    // Log the intent that will be used
    console.info(`[NeuralIntegration] Using user intent:`, JSON.stringify(effectiveUserIntent, null, 2));
    
    // Calculate average similarity to use for dynamic minCosineDistance
    const avgSimilarity = superposition.calculateAverageCosineSimilarity();
    
    // Compute dynamic minCosineDistance based on observed similarity
    // Higher similarity -> Higher minCosineDistance to enforce more diversity
    // Lower similarity -> Lower minCosineDistance to avoid over-penalization
    const dynamicMinDistance = Math.min(0.2, Math.max(0.1, 0.1 + avgSimilarity * 0.1));
    
    // Log diversity metrics
    console.info(`[NeuralIntegration] Average semantic similarity: ${avgSimilarity.toFixed(3)}`);
    console.info(`[NeuralIntegration] Using dynamic minCosineDistance: ${dynamicMinDistance.toFixed(3)}`);
    
    // Calculate symbolic phase based on average emotional weight, contradiction and coherence
    const explicitPhase = this.calculateSymbolicPhase(
      averageEmotionalWeight,
      averageContradictionScore,
      avgCoherence
    );
    
    // Log the symbolic phase calculation
    console.info(`[NeuralIntegration] Using symbolic phase ${explicitPhase.toFixed(3)} rad (${(explicitPhase / (2 * Math.PI)).toFixed(3)} cycles) for collapse`);
    
    if (strategyDecision.deterministic) {
      // Execute deterministic collapse with phase interference and explicit phase
      finalAnswer = superposition.collapseDeterministic({ 
        diversifyByEmbedding: true, 
        minCosineDistance: dynamicMinDistance,
        usePhaseInterference: true, // Enable quantum-like phase interference
        explicitPhase: explicitPhase // Use explicit phase value to bias collapse
      });
      
      // Log the neural collapse event
      symbolicCognitionTimelineLogger.logNeuralCollapse(
        true, // isDeterministic
        finalAnswer.origin || 'unknown', // selectedCore (ensure it's a string)
        numCandidates, // numCandidates
        averageEmotionalWeight, // Emotional weight
        averageContradictionScore, // Contradiction score
        undefined, // No temperature for deterministic collapse
        strategyDecision.justification,
        effectiveUserIntent, // userIntent (guaranteed to have a value)
        allInsights.length > 0 ? allInsights : undefined, // insights from neural results
        strategyDecision.emergentProperties
      );
    } else {
      // Execute probabilistic collapse with the suggested temperature and dynamic parameters
      // Include explicit phase to bias the probabilistic collapse as well
      finalAnswer = superposition.collapse(strategyDecision.temperature, { 
        diversifyByEmbedding: true, 
        minCosineDistance: dynamicMinDistance,
        explicitPhase: explicitPhase // Use same explicit phase value for probabilistic collapse
      });
      
      // Log the neural collapse event
      symbolicCognitionTimelineLogger.logNeuralCollapse(
        false, // isDeterministic
        finalAnswer.origin || 'unknown', // selectedCore (ensure it's a string)
        superposition.answers.length, // numCandidates
        finalAnswer.emotionalWeight || 0, // Emotional weight
        finalAnswer.contradictionScore || 0, // Contradiction score
        strategyDecision.temperature, // temperature from strategy
        strategyDecision.justification,
        effectiveUserIntent, // userIntent (guaranteed to have a value)
        allInsights.length > 0 ? allInsights : undefined, // insights from neural results
        strategyDecision.emergentProperties // emergent properties from strategy decision
      );
    }

    // 3. Use emergent properties from the OpenAI function call
    const emergentProperties: string[] = strategyDecision.emergentProperties || [];
    
    // Add any additional properties based on the answer content if needed
    if ((finalAnswer.contradictionScore ?? 0) > 0.7 && !emergentProperties.some(p => p.includes('Contradiction'))) {
      emergentProperties.push('Contradiction detected in final answer.');
    }
    
    if ((finalAnswer.emotionalWeight ?? 0) > 0.8 && !emergentProperties.some(p => p.includes('emotional'))) {
      emergentProperties.push('Answer with strong emotional weight.');
    }
    
    // For special insights that might not be captured by OpenAI function
    if (finalAnswer.insights && finalAnswer.insights.deep_insight) {
      emergentProperties.push('Emergent deep insight: ' + finalAnswer.insights.deep_insight);
    }

    // 4. Compose final prompt (now with emergent properties)
    let prompt = `You are a neural signal integrator, the final stage of an artificial brain.

You have received results from cognitive and deep neural areas activated by the user's stimulus.

Your task is:
- Analyze the user's stimulus and context.
- Carefully decide which cognitive areas to activate and the depth for each.
- Integrate all results (memories, emotions, archetypes, insights, etc.) into a final answer that is coherent, deep or objective as needed.
- If the input is a greeting or simple question, respond briefly and warmly.
- If the input is reflective or complex, deepen and integrate multiple areas.
- Use natural, sensitive and creative language, adapting style to context and user intent.

Cognitive context: ${contextualMeta?.cognitive_state ?? 'neutral'}
Dominant theme: ${contextualMeta?.dominant_theme ?? 'direct answer'}
Attention focus: ${contextualMeta?.attention_focus ?? 'main content'}
`;
    prompt += `\nORIGINAL STIMULUS: ${originalInput}\n\nACTIVATED AREAS INSIGHTS:\n`;
    
    // Extract and use symbolic insights instead of full text
    neuralResults.forEach(result => {
      // Create a header for each neural area
      prompt += `\n[Area: ${result.core} | Intensity: ${(result.intensity * 100).toFixed(0)}%]\n`;
      
      // Extract key insights from this neural area
      const areaInsights = allInsights.filter(insight => insight.core === result.core);
      
      if (areaInsights.length > 0) {
        // Format and add insights instead of full text
        areaInsights.forEach(insight => {
          const insightType = insight.type || 'concept';
          const insightContent = insight.content || '';
          if (insightContent) {
            prompt += `• ${insightType.toUpperCase()}: ${insightContent}\n`;
          }
        });
      } else {
        // Fallback to a short summary if no insights available
        prompt += `• SUMMARY: ${result.output.substring(0, 150)}${result.output.length > 150 ? '...' : ''}\n`;
      }
    });
    prompt += "\n\nDETECTED EMERGENT PROPERTIES:\n";
    if (emergentProperties.length === 0) {
      prompt += "- No relevant emergent property detected.\n";
      console.info('[NeuralIntegration] No emergent properties detected for input:', originalInput);
    } else {
      for (const prop of emergentProperties) {
        prompt += `- ${prop}\n`;
      }
    }
    if (emergentProperties.length > 0) {
      prompt += `\n\nNow generate a final response that explicitly avoids the emergent issues listed above:\n`;
      prompt += `\nDo not replicate earlier outputs. Instead, synthesize a new response based on the symbolic insights above.\n`;
    } else {
      prompt += `\n\nNow synthesize a final response based on the symbolic insights above. Create an original, concise answer that integrates the activated areas naturally.\n`;
    }
    return prompt;
  }
}
