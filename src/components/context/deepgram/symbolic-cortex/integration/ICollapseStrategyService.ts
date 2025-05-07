// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Interface for services that determine the collapse strategy for neural integration
 */
export interface ICollapseStrategyService {
  /**
   * Determines whether the symbolic collapse should be deterministic or probabilistic
   * based on emotional intensity, symbolic tension, and nature of the user's input.
   * 
   * @param params Parameters to determine the collapse strategy
   * @returns Strategy decision with deterministic flag, temperature, and justification
   */
  decideCollapseStrategy(params: CollapseStrategyParams): Promise<CollapseStrategyDecision>;
}

/**
 * User intent weights across different cognitive dimensions
 */
export interface UserIntentWeights {
  /**
   * Weights for different intent categories (all optional)
   * Values should be between 0 and 1 indicating strength/relevance of that intent
   */
  practical?: number;
  analytical?: number;
  reflective?: number;
  existential?: number;
  symbolic?: number;
  emotional?: number;
  narrative?: number;
  mythic?: number;
  trivial?: number;
  ambiguous?: number;
}

/**
 * Parameters for determining the collapse strategy
 */
export interface CollapseStrategyParams {
  /**
   * Cores activated in this cognitive cycle
   */
  activatedCores: string[];

  /**
   * Average emotional intensity across activated cores
   */
  averageEmotionalWeight: number;

  /**
   * Average contradiction score among retrieved insights
   */
  averageContradictionScore: number;

  /**
   * Original text input that triggered this cognitive cycle
   * Used internally to help infer user intent directly from the content
   */
  originalText?: string;
}

/**
 * Result of the collapse strategy decision
 */
export interface CollapseStrategyDecision {
  /**
   * Whether the collapse should be deterministic (true) or probabilistic (false)
   */
  deterministic: boolean;

  /**
   * Temperature for the collapse (0-2, higher = more random)
   */
  temperature: number;

  /**
   * Justification for the decision
   */
  justification: string;
  
  /**
   * Inferred user intent weights across different cognitive dimensions
   * Generated from original text analysis
   */
  userIntent?: UserIntentWeights;
  
  /**
   * Dominant cognitive theme based on the input analysis
   * Examples: "social connection", "technical inquiry", "philosophical exploration"
   */
  dominantTheme?: string;
  
  /**
   * Focus of attention for the response generation
   * Examples: "emotional tone", "factual information", "conceptual clarity"
   */
  attentionFocus?: string;
  
  /**
   * Overall cognitive context for the interaction
   * Examples: "relational", "analytical", "exploratory", "creative"
   */
  cognitiveContext?: string;
  
  /**
   * Emergent properties detected in the neural response patterns
   * Examples: "Low response diversity", "Cognitive dissonance", "Emotional ambivalence"
   */
  emergentProperties?: string[];
}
