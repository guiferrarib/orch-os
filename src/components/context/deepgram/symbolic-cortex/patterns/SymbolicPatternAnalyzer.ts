// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * SymbolicPatternAnalyzer
 * 
 * Core component for analyzing emergent symbolic patterns across cycles,
 * specifically focused on detecting: symbolic drift, contradiction loops,
 * narrative buildup and phase interference.
 * 
 * Scientific foundation:
 * - Symbolic Drift: Neural Darwinism (Edelman), Embodied Mind (Varela)
 * - Contradiction Loops: Cognitive Dissonance Theory (Festinger)
 * - Narrative Buildup: Acts of Meaning (Bruner)
 * - Phase Interference: Quantum Coherence Theory (Penrose/Hameroff)
 */

import { LoggingUtils } from '../../utils/LoggingUtils';

/**
 * Cognitive metrics for pattern analysis between cycles
 */
export interface CognitiveMetrics {
  // Core metrics (always tracked)
  contradictionScore?: number;
  coherenceScore?: number;
  emotionalWeight?: number;
  
  // Extended thesis metrics
  archetypalStability?: number;
  cycleEntropy?: number;
  insightDepth?: number;
  phaseAngle?: number;
}

/**
 * Represents an emergent pattern detected across cognitive cycles
 */
export interface EmergentPattern {
  type: string;
  description: string;
  confidence: number;
  scientificFoundation: string;
  affectedMetrics: CognitiveMetrics;
  detectionTimestamp: string;
}

/**
 * Main analyzer for detecting emergent symbolic patterns
 */
export class SymbolicPatternAnalyzer {
  // Histories for cross-cycle analysis
  private contextHistory: string[] = [];
  private metricsHistory: CognitiveMetrics[] = [];
  
  // Maximum history size to prevent unbounded growth
  private readonly MAX_HISTORY_SIZE = 20;
  
  /**
   * Records context and metrics from the current cycle
   */
  public recordCyclicData(
    context: string, 
    metrics: CognitiveMetrics
  ): void {
    // Maintain bounded history size
    if (this.contextHistory.length >= this.MAX_HISTORY_SIZE) {
      this.contextHistory.shift();
      this.metricsHistory.shift();
    }
    
    this.contextHistory.push(context);
    this.metricsHistory.push(metrics);
    
    LoggingUtils.logInfo(`[SymbolicPatternAnalyzer] Recorded cycle data (history size: ${this.contextHistory.length})`);
  }
  
  /**
   * Detects symbolic drift between consecutive contexts
   */
  private detectSymbolicDrift(): EmergentPattern | null {
    if (this.contextHistory.length < 2) return null;
    
    const current = this.contextHistory[this.contextHistory.length - 1];
    const previous = this.contextHistory[this.contextHistory.length - 2];
    
    // Basic detection via direct difference
    // In production: use embedding distance or more sophisticated measures
    if (current !== previous) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'symbolic_drift',
        description: 'Symbolic drift detected: significant context change between cycles',
        confidence: 0.85,
        scientificFoundation: 'Neural Darwinism (Edelman) & Embodied Mind (Varela)',
        affectedMetrics: currentMetrics,
        detectionTimestamp: new Date().toISOString()
      };
    }
    
    return null;
  }
  
  /**
   * Detects contradiction loops (persistent high contradiction)
   */
  private detectContradictionLoop(
    threshold: number = 0.7,
    minConsecutive: number = 3
  ): EmergentPattern | null {
    if (this.metricsHistory.length < minConsecutive) return null;
    
    const recentMetrics = this.metricsHistory.slice(-minConsecutive);
    const allHighContradiction = recentMetrics.every(m => 
      (m.contradictionScore ?? 0) > threshold
    );
    
    if (allHighContradiction) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'contradiction_loop',
        description: 'Contradiction loop detected: persistent high contradiction across cycles',
        confidence: 0.9,
        scientificFoundation: 'Cognitive Dissonance Theory (Festinger)',
        affectedMetrics: currentMetrics,
        detectionTimestamp: new Date().toISOString()
      };
    }
    
    return null;
  }
  
  /**
   * Detects narrative buildup (increasing coherence)
   */
  private detectNarrativeBuildup(
    minConsecutive: number = 3
  ): EmergentPattern | null {
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
        description: 'Narrative buildup detected: increasing coherence across cycles',
        confidence: 0.8,
        scientificFoundation: 'Acts of Meaning (Bruner)',
        affectedMetrics: currentMetrics,
        detectionTimestamp: new Date().toISOString()
      };
    }
    
    return null;
  }
  
  /**
   * Detects phase interference patterns
   */
  private detectPhaseInterference(): EmergentPattern | null {
    // Need at least 3 cycles with phase data to detect interference
    if (this.metricsHistory.length < 3) return null;
    
    const recentMetrics = this.metricsHistory.slice(-3);
    const hasPhaseData = recentMetrics.every(m => m.phaseAngle !== undefined);
    
    if (!hasPhaseData) return null;
    
    // Simplified detection of interference patterns
    const phases = recentMetrics.map(m => m.phaseAngle!);
    const phaseDeltas = [
      Math.abs(phases[1] - phases[0]), 
      Math.abs(phases[2] - phases[1])
    ];
    
    // Detect regular oscillation pattern
    const hasRegularPattern = Math.abs(phaseDeltas[1] - phaseDeltas[0]) < 0.15;
    
    if (hasRegularPattern) {
      const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
      return {
        type: 'phase_interference',
        description: 'Phase interference detected: quantum-like oscillatory pattern',
        confidence: 0.7,
        scientificFoundation: 'Orchestrated Objective Reduction (Penrose/Hameroff)',
        affectedMetrics: currentMetrics,
        detectionTimestamp: new Date().toISOString()
      };
    }
    
    return null;
  }
  
  /**
   * Main analysis method to detect all emergent patterns
   */
  public analyzePatterns(): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];
    
    try {
      // Run all detectors and collect non-null results
      const drift = this.detectSymbolicDrift();
      if (drift) patterns.push(drift);
      
      const contradiction = this.detectContradictionLoop();
      if (contradiction) patterns.push(contradiction);
      
      const narrative = this.detectNarrativeBuildup();
      if (narrative) patterns.push(narrative);
      
      const phase = this.detectPhaseInterference();
      if (phase) patterns.push(phase);
      
      if (patterns.length > 0) {
        LoggingUtils.logInfo(`[SymbolicPatternAnalyzer] Detected ${patterns.length} emergent patterns`);
      }
      
      return patterns;
    } catch (error) {
      LoggingUtils.logError(`[SymbolicPatternAnalyzer] Error analyzing patterns: ${error}`);
      return [];
    }
  }
  
  /**
   * Converte padrões emergentes detectados em formato de string para logging
   * e para incorporação nas propriedades emergentes do sistema.
   * 
   * @param patterns Lista de padrões emergentes detectados
   * @returns Array de strings descritivas dos padrões
   */
  public formatPatterns(patterns: EmergentPattern[]): string[] {
    return patterns.map(pattern => {
      const confidencePct = Math.round(pattern.confidence * 100);
      return `${pattern.type.toUpperCase()}: ${pattern.description} (${confidencePct}% confidence)`;
    });
  }
  
  /**
   * Clears all stored history (useful for session resets)
   */
  public clearHistory(): void {
    this.contextHistory = [];
    this.metricsHistory = [];
    LoggingUtils.logInfo('[SymbolicPatternAnalyzer] History cleared');
  }
}