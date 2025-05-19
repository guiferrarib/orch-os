// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Symbolic Pattern Detector
 * 
 * Analyzes emergent cognitive patterns between neural-simbolic processing cycles,
 * with scientific grounding in neurocognitive theories (Edelman, Varela, Festinger, Bruner).
 * 
 * Supports detection of:
 * - Symbolic drift (changes in symbolic context)
 * - Contradiction loops (high contradiction recurrence)
 * - Narrative buildup (consistent increase in coherence)
 * - Phase interference (quantum-like interference patterns)
 */

import { LoggingUtils } from '../../utils/LoggingUtils';

export interface SymbolicPatternMetrics {
  // Cognitive property essentials (core)
  contradictionScore?: number;
  coherenceScore?: number;
  emotionalWeight?: number;
  
  // Additional thesis metrics (expanded)
  archetypalStability?: number;  // Archetypal pattern stability (0-1)
  cycleEntropy?: number;        // Cognitive cycle entropy (0-1)
  insightDepth?: number;        // Insight depth achieved (0-1)
  phaseAngle?: number;          // Symbolic phase angle (0-2π)
}

export interface EmergentSymbolicPattern {
  type: 'symbolic_drift' | 'contradiction_loop' | 'narrative_buildup' | 'phase_interference';
  description: string;
  confidence: number;
  scientificBasis: string;
  metrics: SymbolicPatternMetrics;
}

/**
 * Detector of emergent symbolic patterns between cognitive cycles.
 * Implements scientific detection based on cognitive flow between cycles.
 */
export class SymbolicPatternDetector {
  // History of contexts and metrics
  private contextHistory: string[] = [];
  private metricsHistory: SymbolicPatternMetrics[] = [];
  
  /**
   * Updates internal history with new context and metrics data
   */
  public updateHistory(context: string, metrics: SymbolicPatternMetrics): void {
    // Limit history to 10 entries to prevent infinite growth
    if (this.contextHistory.length >= 10) {
      this.contextHistory.shift();
      this.metricsHistory.shift();
    }
    
    this.contextHistory.push(context);
    this.metricsHistory.push(metrics);
    
    LoggingUtils.logInfo(`[SymbolicPatternDetector] Histórico atualizado: ${this.contextHistory.length} entradas`);
  }
  
  /**
   * Detects symbolic drift between consecutive contexts
   * Based on: Neural Darwinism (Edelman) and Embodied Mind (Varela)
   */
  private detectSymbolicDrift(): EmergentSymbolicPattern | null {
    // Need at least 2 contexts for comparison
    if (this.contextHistory.length < 2) return null;
    
    const current = this.contextHistory[this.contextHistory.length - 1];
    const previous = this.contextHistory[this.contextHistory.length - 2];
    
    // Simple analysis by content difference (in complete implementation: use embedding distance)
    if (current !== previous) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'symbolic_drift',
        description: 'Symbolic drift detected: significant context change between cycles',
        confidence: 0.85,
        scientificBasis: 'Neural Darwinism (Edelman) & Embodied Mind (Varela)',
        metrics: currentMetrics
      };
    }
    
    return null;
  }
  
  /**
   * Detects contradiction loops between consecutive cycles
   * Based on: Cognitive Dissonance Theory (Festinger)
   */
  private detectContradictionLoop(threshold: number = 0.7, minConsecutive: number = 3): EmergentSymbolicPattern | null {
    if (this.metricsHistory.length < minConsecutive) return null;
    
    const recentMetrics = this.metricsHistory.slice(-minConsecutive);
    const allHighContradiction = recentMetrics.every(m => 
      (m.contradictionScore ?? 0) > threshold
    );
    
    if (allHighContradiction) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'contradiction_loop',
        description: 'Contradiction loop detected: persistent high contradiction',
        confidence: 0.9,
        scientificBasis: 'Cognitive Dissonance Theory (Festinger)',
        metrics: currentMetrics
      };
    }
    
    return null;
  }
  
  /**
   * Detects narrative buildup (progressive increase in coherence)
   * Based on: Acts of Meaning (Bruner)
   */
  private detectNarrativeBuildup(minConsecutive: number = 3): EmergentSymbolicPattern | null {
    if (this.metricsHistory.length < minConsecutive) return null;
    
    const recentMetrics = this.metricsHistory.slice(-minConsecutive);
    let isIncreasing = true;
    
    for (let i = 1; i < recentMetrics.length; i++) {
      const current = recentMetrics[i].coherenceScore ?? 0;
      const previous = recentMetrics[i-1].coherenceScore ?? 0;
      if (current <= previous) {
        isIncreasing = false;
        break;
      }
    }
    
    if (isIncreasing) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'narrative_buildup',
        description: 'Narrative buildup detected: increasing coherence between cycles',
        confidence: 0.8,
        scientificBasis: 'Acts of Meaning (Bruner)',
        metrics: currentMetrics
      };
    }
    
    return null;
  }
  
  /**
   * Detects phase interference between symbolic cycles
   * Based on: Quantum Consciousness Theory (Penrose/Hameroff)
   */
  private detectPhaseInterference(): EmergentSymbolicPattern | null {
    if (this.metricsHistory.length < 3) return null;
    
    // Precisamos de dados de fase para detectar interferência
    const recentMetrics = this.metricsHistory.slice(-3);
    const hasPhaseData = recentMetrics.every(m => m.phaseAngle !== undefined);
    
    if (!hasPhaseData) return null;
    
    // Simple analysis of interference (didactic example)
    // In complete implementation: complex analysis of interference patterns
    const phases = recentMetrics.map(m => m.phaseAngle!);
    const phaseDeltas = [
      Math.abs(phases[1] - phases[0]), 
      Math.abs(phases[2] - phases[1])
    ];
    
    // Detectar padrão de interferência: oscilação com período específico
    const hasInterferencePeriod = Math.abs(phaseDeltas[1] - phaseDeltas[0]) < 0.1;
    
    if (hasInterferencePeriod) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'phase_interference',
        description: 'Symbolic phase interference detected: oscillatory pattern',
        confidence: 0.7,
        scientificBasis: 'Orch-OR Theory (Penrose/Hameroff)',
        metrics: currentMetrics
      };
    }
    
    return null;
  }
  
  /**
   * Main method to analyze emergent patterns between cycles
   * This is the method that should be called by the integration service
   */
  public detectPatterns(): EmergentSymbolicPattern[] {
    const patterns: EmergentSymbolicPattern[] = [];
    
    // Execute all detectors and collect non-null results
    try {
      const symbolicDrift = this.detectSymbolicDrift();
      if (symbolicDrift) patterns.push(symbolicDrift);
      
      const contradictionLoop = this.detectContradictionLoop();
      if (contradictionLoop) patterns.push(contradictionLoop);
      
      const narrativeBuildup = this.detectNarrativeBuildup();
      if (narrativeBuildup) patterns.push(narrativeBuildup);
      
      const phaseInterference = this.detectPhaseInterference();
      if (phaseInterference) patterns.push(phaseInterference);
      
      return patterns;
    } catch (error) {
      LoggingUtils.logError(`[SymbolicPatternDetector] Error analyzing patterns: ${error}`);
      return [];
    }
  }
  
  /**
   * Converts emergent patterns to strings for logging
   */
  public patternsToStrings(patterns: EmergentSymbolicPattern[]): string[] {
    return patterns.map(pattern => {
      const confidencePct = Math.round(pattern.confidence * 100);
      return `${pattern.type.replace('_', ' ').toUpperCase()} - ${pattern.description} (${confidencePct}% confidence)`;
    });
  }

  /**
   * Clears the complete history (typically at the start of a new session)
   */
  public clearHistory(): void {
    this.contextHistory = [];
    this.metricsHistory = [];
    LoggingUtils.logInfo('[SymbolicPatternDetector] History cleared');
  }
}