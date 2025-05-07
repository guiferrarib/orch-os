// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// ITranscriptionProcessor.ts
// Interface for processing and managing transcriptions

import { Message, SpeakerSegment, SpeakerTranscription } from "./TranscriptionTypes";

export interface IBatchTranscriptionProcessor {
  /**
   * Processes and formats transcriptions from multiple speakers
   */
  processTranscriptions(
    transcriptions: SpeakerTranscription[],
    primaryUserSpeaker: string
  ): SpeakerSegment[];
  
  /**
   * Removes duplicate content from transcriptions
   */
  deduplicateTranscriptions(
    transcriptions: SpeakerTranscription[]
  ): SpeakerTranscription[];
  
  /**
   * Extracts the last message from each speaker
   */
  extractLastMessageBySpeaker(
    transcriptions: SpeakerTranscription[],
    speakers: string[]
  ): Map<string, SpeakerTranscription>;
  
  /**
   * Formats transcriptions for conversation history
   */
  formatTranscriptionsForHistory(
    transcriptions: SpeakerTranscription[],
    primaryUserSpeaker: string
  ): Message[];
} 