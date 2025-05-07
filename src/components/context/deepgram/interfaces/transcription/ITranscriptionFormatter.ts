// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// ITranscriptionFormatter.ts
// Interface for formatting and processing transcriptions

import { SpeakerSegment } from "./TranscriptionTypes";

export interface ITranscriptionFormatter {
  /**
   * Formats mixed transcriptions with speaker labels
   */
  formatMixedTranscription(text: string, primaryUserSpeaker: string): SpeakerSegment[];
  
  /**
   * Formats external speaker content to ensure correct labeling
   */
  formatExternalSpeakerContent(content: string): string;
  
  /**
   * Sanitizes memory content and fixes speaker attributions
   */
  sanitizeMemoryContent(content: string, isSpeakerContent?: boolean): string;
  
  /**
   * Combines speaker segments into a coherent conversation
   */
  buildConversationFromSegments(
    segments: SpeakerSegment[], 
    preserveSpeakerLabels?: boolean
  ): string;
} 