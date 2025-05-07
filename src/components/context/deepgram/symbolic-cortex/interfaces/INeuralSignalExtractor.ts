// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// INeuralSignalExtractor.ts
// Interface for neural signal extractors

import { NeuralSignalResponse } from "../../interfaces/neural/NeuralSignalTypes";
import { SpeakerMemoryResults, SpeakerTranscription } from "../../interfaces/transcription/TranscriptionTypes";
/**
 * Configuration for neural signal extraction
 */
export interface NeuralExtractionConfig {
  /**
   * Current transcription being processed (sensory stimulus)
   */
  transcription: string;
  
  /**
   * Temporary context optional
   */
  temporaryContext?: string;
  
  /**
   * Current session state
   */
  sessionState?: {
    sessionId: string;
    interactionCount: number;
    timestamp: string;
  };
  
  /**
   * Speaker metadata
   */
  speakerMetadata?: {
    primarySpeaker?: string;
    detectedSpeakers?: string[];
    speakerTranscriptions?: SpeakerTranscription[];
  };

  userContextData?: SpeakerMemoryResults;
}

/**
 * Interface for extracting neural signals
 * Defines the contract for components that transform stimuli into neural impulses
 */
export interface INeuralSignalExtractor {
  /**
   * Extracts neural signals from the current context
   * @param config Configuration for neural signal extraction containing the current context
   * @returns Response containing neural signals for post-processing
   */
  extractNeuralSignals(config: NeuralExtractionConfig): Promise<NeuralSignalResponse>;
}
