// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// SymbolicCognitionTimelineLogger.ts
// Logging structure for symbolic timeline with precise timestamps

import { CognitionEvent } from '../../types/CognitionEvent';
import { SymbolicInsight } from '../../types/SymbolicInsight';
import { SymbolicQuery } from '../../types/SymbolicQuery';
import { SymbolicContext } from '../../types/SymbolicContext';
import { LoggingUtils } from '../../utils/LoggingUtils';
import { UserIntentWeights } from '../../symbolic-cortex/integration/ICollapseStrategyService';

export class SymbolicCognitionTimelineLogger {
  private timeline: CognitionEvent[] = [];

  private now(): string {
    return new Date().toISOString();
  }

  /**
   * Records a raw prompt in the timeline.
   * @param content Textual content of the prompt sent to the system.
   */
  logRawPrompt(content: string): void {
    this.timeline.push({ type: 'raw_prompt', timestamp: this.now(), content });
  }

  /**
   * Records a temporary context in the timeline.
   * @param context Temporary textual context used in processing.
   */
  logTemporaryContext(context: string): void {
    this.timeline.push({ type: 'temporary_context', timestamp: this.now(), context });
  }

  /**
   * Records a neural signal in the timeline, including symbolic query and parameters.
   * @param core Neural signal core (e.g., memory, emotion).
   * @param symbolic_query Symbolic query associated with the signal.
   * @param intensity Signal intensity.
   * @param topK TopK parameter used in search.
   * @param params Additional signal parameters.
   */
  logNeuralSignal(core: string, symbolic_query: SymbolicQuery, intensity: number, topK: number, params: Record<string, unknown>): void {
    this.timeline.push({
      type: 'neural_signal',
      timestamp: this.now(),
      core,
      symbolic_query,
      intensity,
      topK,
      params
    });
  }

  /**
   * Records the result of a symbolic retrieval in the timeline.
   * @param core Core of the associated signal.
   * @param insights Array of extracted symbolic insights.
   * @param matchCount Number of matches found.
   * @param durationMs Search duration in milliseconds.
   */
  logSymbolicRetrieval(core: string, insights: SymbolicInsight[], matchCount: number, durationMs: number): void {
    const safeInsights = Array.isArray(insights) ? insights : [];
    if (!insights || safeInsights.length === 0) {
      LoggingUtils.logInfo(`No insights extracted for core: ${core}`);
    }
    this.timeline.push({
      type: 'symbolic_retrieval',
      timestamp: this.now(),
      core,
      insights: safeInsights,
      matchCount,
      durationMs
    });
  }

  /**
   * Records the initiation of a symbolic fusion process in the timeline.
   */
  logFusionInitiated(): void {
    this.timeline.push({ type: 'fusion_initiated', timestamp: this.now() });
  }

  /**
   * Logs a neural collapse event in the timeline
   * @param isDeterministic Indicates if the collapse was deterministic or probabilistic
   * @param selectedCore Neural core selected for collapse
   * @param numCandidates Number of candidates available before collapse
   * @param emotionalWeight Emotional weight of the result
   * @param contradictionScore Contradiction value of the result
   * @param temperature Symbolic temperature used (only for non-deterministic collapses)
   * @param justification Textual justification for the collapse decision
   * @param userIntent User intent weights inferred from the original text
   * @param insights Symbolic insights associated with the collapse
   * @param emergentProperties Emergent properties detected in the neural response patterns
   */
  logNeuralCollapse(isDeterministic: boolean, selectedCore: string, numCandidates: number, emotionalWeight: number, contradictionScore: number, temperature?: number, justification?: string, userIntent?: UserIntentWeights, insights?: SymbolicInsight[], emergentProperties?: string[]): void {
    this.timeline.push({ 
      type: 'neural_collapse',
      timestamp: this.now(),
      isDeterministic,
      selectedCore,
      numCandidates,
      temperature,
      emotionalWeight,
      contradictionScore,
      justification,
      userIntent,
      insights,
      emergentProperties
    });
  }

  /**
   * Records the synthesized symbolic context in the timeline.
   * @param context Synthesized symbolic context object.
   */
  logSymbolicContextSynthesized(context: SymbolicContext): void {
    this.timeline.push({ type: 'symbolic_context_synthesized', timestamp: this.now(), context });
  }

  /**
   * Records the GPT model response in the timeline, including symbolic topics and insights.
   * @param data Response string or detailed object with topics and insights.
   */
  logGptResponse(data: string | { response: string; symbolicTopics?: string[]; insights?: SymbolicInsight[] }): void {
    if (typeof data === 'string') {
      LoggingUtils.logInfo('No insights extracted in GPT response (string).');
      this.timeline.push({ 
        type: 'gpt_response', 
        timestamp: this.now(), 
        response: data, 
        insights: []
      });
    } else {
      const hasInsights = data.insights && Array.isArray(data.insights) && data.insights.length > 0;
      if (!hasInsights) {
        LoggingUtils.logInfo('No insights extracted in GPT response (object).');
      }
      this.timeline.push({
        type: 'gpt_response',
        timestamp: this.now(),
        response: data.response,
        symbolicTopics: data.symbolicTopics,
        insights: hasInsights ? data.insights : []
      });
    }
  }

  /**
   * Returns the complete timeline of recorded cognitive events.
   */
  getTimeline(): CognitionEvent[] {
    return this.timeline;
  }

  clear() {
    this.timeline = [];
  }


}

export default SymbolicCognitionTimelineLogger;
