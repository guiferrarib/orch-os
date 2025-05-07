// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// NeuralSignalExtractor.ts
// Module responsible for extracting symbolic neural signals from the transcription context

import { NeuralSignalResponse } from "../../interfaces/neural/NeuralSignalTypes";
import { IOpenAIService } from "../../interfaces/openai/IOpenAIService";
import { LoggingUtils } from "../../utils/LoggingUtils";
import { INeuralSignalExtractor, NeuralExtractionConfig } from "../interfaces/INeuralSignalExtractor";

/**
 * Class responsible for extracting symbolic neural signals from the transcription context
 * This is the first impulse of an artificial symbolic mind
 */
export class NeuralSignalExtractor implements INeuralSignalExtractor {
  private readonly openAIService: IOpenAIService;

  /**
   * Constructor
   * @param openAIService OpenAI service for communication with the language model
   */
  constructor(openAIService: IOpenAIService) {
    this.openAIService = openAIService;
  }

  /**
   * Extracts symbolic neural signals from the current context
   * This is the first impulse of an artificial symbolic mind
   * @param config Configuration containing the current context
   * @returns Array of neural signals representing the activation of the symbolic brain
   */
  public async extractNeuralSignals(config: NeuralExtractionConfig): Promise<NeuralSignalResponse> {
    try {
      // The config should already have transcription and userContextData ready!
      const { transcription, temporaryContext, userContextData = {}, sessionState = {} } = config;
      
      // Determine language from session state
      const language = (sessionState && typeof sessionState === 'object' && 'language' in sessionState) ? 
        sessionState.language as string : undefined;

      LoggingUtils.logInfo("Extracting neural signals with complete user context...");

      // Prepare an enriched prompt with all available contextual data
      const enrichedPrompt = this.prepareEnrichedPrompt(transcription, userContextData);

      // Generate neural signals adapted for Pinecone queries
      const neuralResponse = await this.openAIService.generateNeuralSignal(
        enrichedPrompt, // Enriched stimulus with user context
        temporaryContext,
        language // Pass language from session state
      );

      // Verify if the response contains valid signals
      if (!neuralResponse.signals || neuralResponse.signals.length === 0) {
        LoggingUtils.logWarning("No neural signals were generated. Using default signals.");

        // Provide default neural signals to ensure important Pinecone queries
        return {
          signals: [
            {
              core: "memory",
              intensity: 0.8,
              symbolic_query: {
                query: `memories related to: ${transcription.substring(0, 100)}`
              },
              symbolicInsights: {
                recall_type: "semantic",
                temporal: "recent",
                importance: "high"
              }
            },
            {
              core: "metacognitive",
              intensity: 0.7,
              symbolic_query: {
                query: `reflection on: ${transcription.substring(0, 100)}`
              },
              symbolicInsights: {
                thought: "Processing cognitive stimulus",
                state: "conscious"
              }
            },
            {
              core: "valence",
              intensity: 0.6,
              symbolic_query: {
                query: `emotions about: ${transcription.substring(0, 100)}`
              },
              symbolicInsights: {
                emotion: "neutral",
                intensity: "moderate"
              }
            }
          ],
          contextualMeta: {
            dominant_theme: "information_processing",
            cognitive_state: "analytical",
            attention_focus: "content_analysis"
          }
        };
      }

      // Improve neural signals for effective Pinecone queries
      const enhancedSignals = neuralResponse.signals.map(signal => {
        // DO NOT overwrite or modify the model's symbolic query
        // DO NOT add prefixes like "memories relevant to: ..."

        // DO NOT overwrite topK if already provided
        if (signal.topK === undefined) {
          signal.topK = signal.core === 'memory' ? 5 :
            signal.core === 'valence' ? 3 : 2;
        }
        return signal;
      });

      // Update the signals in the neural response
      neuralResponse.signals = enhancedSignals;

      // Log the generated signals for diagnostic purposes
      LoggingUtils.logInfo(` ${neuralResponse.signals.length} neural signals extracted and optimized for Pinecone`);

      // Add contextual metadata about the user's context to guide post-processing
      if (!neuralResponse.contextualMeta) {
        neuralResponse.contextualMeta = {};
      }

      // Add additional metadata for processing
      neuralResponse.contextualMeta = {
        ...neuralResponse.contextualMeta,
        memory_retrieval_focus: neuralResponse.signals.some(s => s.core === 'memory'),
        userContext_integrated: Object.keys(userContextData).length > 0
      };

      // Return the optimized neural response
      return neuralResponse;

    } catch (error) {
      // In case of error, log and provide a fallback response
      LoggingUtils.logError("Error extracting neural signals", error as Error);

      return {
        signals: [{
          core: "memory",
          intensity: 0.5,
          symbolic_query: {
            query: config.transcription.substring(0, 50)
          },
          symbolicInsights: {}
        }],
        contextualMeta: {
          dominant_theme: "error_recovery",
          cognitive_state: "resilient",
          attention_focus: "system_stability"
        }
      };
    }
  }

  /**
 * Prepares an enriched prompt with full user context.
 * @param originalPrompt The user's original prompt
 * @param userContextData Contextual data related to the user
 * @returns A contextually enriched symbolic/psychoanalytic prompt
 */
  private prepareEnrichedPrompt(
    originalPrompt: string,
    userContextData: Record<string, unknown>
  ): string {
    const styleInstruction = "STYLE INSTRUCTION: Only use greetings and personal references when the user's content clearly justifies it — never automatically.";

    // Base symbolic instruction
    const symbolicInstruction = `INSTRUCTION: Analyze the user's message and context to identify explicit and implicit keywords, emotional themes, symbols, archetypes, dilemmas, and unconscious patterns. 
Suggest refined or expanded keywords, queries, and topics that could deepen the symbolic, emotional, and unconscious investigation — even if they are not explicitly verbalized.
Be selective: only expand when there are strong indicators of symbolic or unconscious material. 
Prioritize expressions and themes that reveal tensions, paradoxes, hidden desires, blockages, or deep self-knowledge potential.`;

    // If no user context exists, return the basic symbolic enrichment prompt
    if (Object.keys(userContextData).length === 0) {
      return `${styleInstruction}\n\n${originalPrompt}\n\n${symbolicInstruction}`;
    }

    // Start building contextualized prompt
    let contextualPrompt = `${styleInstruction}\n\n${originalPrompt}`;

    // Add recent symbolic or emotional topics, if present
    if (userContextData.recent_topics) {
      const recentTopics = userContextData.recent_topics.toString().substring(0, 200) + '...';
      contextualPrompt += `\n\nRecent topics context: ${recentTopics}`;
    }

    // Add interaction patterns if present
    if (userContextData.speaker_interaction_counts) {
      const interactionPattern = JSON.stringify(userContextData.speaker_interaction_counts);
      contextualPrompt += `\n\nInteraction pattern: ${interactionPattern}`;
    }

    // Add symbolic instruction + adaptive note
    contextualPrompt += `\n\n${symbolicInstruction}

Note: If other relevant symbolic or emotional patterns are available in the long-term memory or historical user data, feel free to incorporate them into the keyword/query suggestions — as long as they resonate symbolically with the current stimulus.`;

    return contextualPrompt;
  }
}
