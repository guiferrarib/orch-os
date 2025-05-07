// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// ISpeakerIdentificationService.ts
// Interface for speaker identification service

import { SpeakerSegment, SpeakerTranscription } from "../transcription/TranscriptionTypes";

export interface ISpeakerIdentificationService {
  /**
   * Define the name of the primary speaker (user)
   */
  setPrimaryUserSpeaker(name: string): void;
  
  /**
   * Normalizes speaker identification for comparison
   */
  normalizeAndIdentifySpeaker(speaker: string): string;
  
  /**
   * Extracts speech segments from a transcription that mixes speakers
   */
  splitMixedTranscription(text: string): SpeakerSegment[];
  
  /**
   * Filters transcriptions by specific speaker
   */
  filterTranscriptionsBySpeaker(speaker: string, transcriptions: SpeakerTranscription[]): SpeakerTranscription[];
  
  /**
   * Filters transcriptions by the primary user speaker
   */
  filterTranscriptionsByUser(transcriptions: SpeakerTranscription[]): SpeakerTranscription[];
  
  /**
   * Verifies if only the primary user speaker is speaking
   */
  isOnlyUserSpeaking(transcriptions: SpeakerTranscription[]): boolean;
  
  /**
   * Prepares the transcription text for sending, combining all inputs
   */
  prepareTranscriptionText(
    transcriptionList: string[],
    speakerTranscriptions: SpeakerTranscription[],
    lastTranscription: string
  ): string;
  
  /**
   * Gets the primary user speaker
   */
  getPrimaryUserSpeaker(): string;
} 