// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IMemoryContextBuilder.ts
// Interface for building memory contexts

import { Message, SpeakerMemoryResults, SpeakerTranscription } from "../transcription/TranscriptionTypes";

export interface IMemoryContextBuilder {
  /**
   * Retrieves contextual memory based on speakers
   */
  fetchContextualMemory(
    userTranscriptions: SpeakerTranscription[],
    externalTranscriptions: SpeakerTranscription[],
    detectedSpeakers: Set<string>,
    temporaryContext?: string,
    topK?: number,
    keywords?: string[]
  ): Promise<SpeakerMemoryResults>;
  
  /**
   * Queries external memory system for relevant context
   */
  queryExternalMemory(inputText: string, topK?: number, keywords?: string[]): Promise<string>;
  
  /**
   * Builds conversation messages with appropriate memory contexts
   */
  buildMessagesWithContext(
    transcription: string,
    conversationHistory: Message[],
    useSimplifiedHistory: boolean,
    speakerTranscriptions: SpeakerTranscription[],
    detectedSpeakers: Set<string>,
    primaryUserSpeaker: string,
    temporaryContext?: string,
    memoryResults?: SpeakerMemoryResults
  ): Message[];
  
  /**
   * Resets the snapshot tracker to clear all tracked transcription lines
   */
  resetSnapshotTracker(): void;
  
  /**
   * Resets just the temporary context
   */
  resetTemporaryContext(): void;
  
  /**
   * Resets both the snapshot tracker and temporary context
   */
  resetAll(): void;
} 