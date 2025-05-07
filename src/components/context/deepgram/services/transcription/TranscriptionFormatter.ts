// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TranscriptionFormatter.ts
// Implementation of ITranscriptionFormatter

import { ITranscriptionFormatter } from "../../interfaces/transcription/ITranscriptionFormatter";
import { SpeakerSegment } from "../../interfaces/transcription/TranscriptionTypes";

export class TranscriptionFormatter implements ITranscriptionFormatter {
  /**
   * Formats mixed transcriptions with speaker labels
   */
  formatMixedTranscription(text: string, primaryUserSpeaker: string): SpeakerSegment[] {
    const results: SpeakerSegment[] = [];
    const speakerPattern = /\[([^\]]+)\]\s*(.*?)(?=\s*\[[^\]]+\]|$)/gs;
    let match;
    let lastSpeaker = "";
    
    while ((match = speakerPattern.exec(text)) !== null) {
      if (match[1] && match[2]) {
        const rawSpeaker = match[1].trim();
        const spokenText = match[2].trim();
        
        if (spokenText) {
          let speaker: string;
          
          // Simplified speaker attribution rules
          if (rawSpeaker === primaryUserSpeaker) {
            speaker = primaryUserSpeaker;
          } else if (rawSpeaker.toLowerCase().includes("speaker")) {
            speaker = "external";
          } else {
            speaker = "external";
          }
          
          // Only show speaker label when it changes
          const showSpeaker = (lastSpeaker !== speaker);
          lastSpeaker = speaker;
          
          results.push({
            speaker,
            text: `[${rawSpeaker}] ${spokenText}`,
            showSpeaker
          });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Formats external speaker content to ensure correct labeling
   */
  formatExternalSpeakerContent(content: string): string {
    if (!content) return "";
    
    const lines = content.split('\n');
    const formattedLines = lines.map(line => {
      if (!line.trim()) return line;
      
      // Check if it already has a [Speaker X] prefix
      if (line.match(/^\[[^\]]+\]/)) {
        return line; // Already has prefix, keep as is
      }
      
      // Check if it contains "Speaker" without prefix
      if (line.toLowerCase().includes("speaker")) {
        // Extract speaker number if present
        const speakerMatch = line.match(/speaker\s*(\d+)/i);
        const speakerLabel = speakerMatch ? 
          `Speaker ${speakerMatch[1]}` : "External Participant";
          
        // Add prefix
        return `[${speakerLabel}] ${line}`;
      }
      
      return line;
    });
    
    return formattedLines.join('\n');
  }
  
  /**
   * Sanitizes memory content and fixes speaker attributions
   */
  sanitizeMemoryContent(content: string, isSpeakerContent: boolean = false): string {
    if (!content) return "";
    
    // If already speaker content or doesn't contain "Speaker", return as is
    if (isSpeakerContent || !content.toLowerCase().includes("speaker")) {
      return content;
    }
    
    // Process text lines to add speaker prefixes to lines mentioning "Speaker"
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
      if (line.toLowerCase().includes("speaker")) {
        // Check if already has Speaker prefix
        if (line.match(/^\[[^\]]+\]/)) {
          return line; // Already has prefix, keep as is
        }
        
        // Extract speaker number if present
        const speakerMatch = line.match(/speaker\s*(\d+)/i);
        const speakerLabel = speakerMatch ? 
          `Speaker ${speakerMatch[1]}` : "External Participant";
          
        // Add prefix
        return `[${speakerLabel}] ${line}`;
      }
      return line;
    });
    
    return processedLines.join('\n');
  }
  
  /**
   * Combines speaker segments into a coherent conversation
   */
  buildConversationFromSegments(
    segments: SpeakerSegment[], 
    preserveSpeakerLabels: boolean = true
  ): string {
    const conversation: string[] = [];
    
    for (const segment of segments) {
      // Extract the original speaker label if available
      let text = segment.text;
      
      if (!preserveSpeakerLabels) {
        // Remove any existing speaker labels
        text = text.replace(/^\[[^\]]+\]\s*/, '');
      }
      
      conversation.push(text);
    }
    
    return conversation.join('\n');
  }
} 