// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// BatchTranscriptionProcessor.ts
// Implementation of IBatchTranscriptionProcessor

import { IBatchTranscriptionProcessor } from "../../interfaces/transcription/IBatchTranscriptionProcessor";
import { ITranscriptionFormatter } from "../../interfaces/transcription/ITranscriptionFormatter";
import { EXTERNAL_HEADER, EXTERNAL_SPEAKER_LABEL, Message, SpeakerSegment, SpeakerTranscription, USER_HEADER } from "../../interfaces/transcription/TranscriptionTypes";

export class BatchTranscriptionProcessor implements IBatchTranscriptionProcessor {
  private formatter: ITranscriptionFormatter;
  
  constructor(formatter: ITranscriptionFormatter) {
    this.formatter = formatter;
  }
  
  /**
   * Processes and formats transcriptions from multiple speakers
   */
  processTranscriptions(
    transcriptions: SpeakerTranscription[],
    primaryUserSpeaker: string
  ): SpeakerSegment[] {
    // First, remove duplicates
    const uniqueTranscriptions = this.deduplicateTranscriptions(transcriptions);
    
    // Sort chronologically by timestamp
    const sortedTranscriptions = [...uniqueTranscriptions]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const segments: SpeakerSegment[] = [];
    let lastSpeakerKey = "";
    
    // Process each transcription
    for (const transcription of sortedTranscriptions) {
      // Check if it's a mixed transcription with multiple speakers
      if (transcription.text.includes('[') && transcription.text.includes(']')) {
        // Split mixed transcription into segments
        const mixedSegments = this.formatter.formatMixedTranscription(
          transcription.text, 
          primaryUserSpeaker
        );
        
        // Process each segment individually
        for (const segment of mixedSegments) {
          // Update show speaker flag based on whether speaker changed
          const showSpeaker = (lastSpeakerKey !== segment.speaker);
          lastSpeakerKey = segment.speaker;
          
          segments.push({
            ...segment,
            showSpeaker
          });
        }
      } else {
        // Regular transcription (single speaker)
        let speakerKey = transcription.speaker;
        let speakerLabel: string;
        
        // Determine the correct label for the speaker
        if (speakerKey === primaryUserSpeaker) {
          speakerLabel = primaryUserSpeaker;
        } else {
          // For external speaker, check for original label
          const originalLabel = transcription.text.match(/^\[([^\]]+)\]/)?.[1];
          if (originalLabel && originalLabel.toLowerCase().includes("speaker")) {
            speakerLabel = originalLabel;
            speakerKey = "external";
          } else {
            speakerLabel = EXTERNAL_SPEAKER_LABEL;
            speakerKey = "external";
          }
        }
        
        // Clean the text of any existing speaker markings
        const cleanText = transcription.text.replace(/^\[[^\]]+\]\s*/, '');
        
        // Update show speaker flag based on whether speaker changed
        const showSpeaker = (lastSpeakerKey !== speakerKey);
        lastSpeakerKey = speakerKey;
        
        segments.push({
          speaker: speakerKey,
          text: showSpeaker ? `[${speakerLabel}] ${cleanText}` : cleanText,
          showSpeaker
        });
      }
    }
    
    return segments;
  }
  
  /**
   * Removes duplicate content from transcriptions
   */
  deduplicateTranscriptions(
    transcriptions: SpeakerTranscription[]
  ): SpeakerTranscription[] {
    const processedTexts = new Set<string>();
    const uniqueTranscriptions: SpeakerTranscription[] = [];
    
    for (const transcription of transcriptions) {
      // Skip duplicates
      if (processedTexts.has(transcription.text)) continue;
      
      processedTexts.add(transcription.text);
      uniqueTranscriptions.push(transcription);
    }
    
    return uniqueTranscriptions;
  }
  
  /**
   * Extracts the last message from each speaker
   */
  extractLastMessageBySpeaker(
    transcriptions: SpeakerTranscription[],
    speakers: string[]
  ): Map<string, SpeakerTranscription> {
    const lastMessages = new Map<string, SpeakerTranscription>();
    
    // Helper to get the last message from a specific speaker
    const getLastMessageFrom = (speaker: string): SpeakerTranscription | null => {
      const filteredMessages = transcriptions.filter(st => st.speaker === speaker);
      return filteredMessages.length > 0 ? filteredMessages[filteredMessages.length - 1] : null;
    };
    
    // Get last message for each requested speaker
    for (const speaker of speakers) {
      const lastMessage = getLastMessageFrom(speaker);
      if (lastMessage) {
        lastMessages.set(speaker, lastMessage);
      }
    }
    
    return lastMessages;
  }
  
  /**
   * Formats transcriptions for conversation history
   */
  formatTranscriptionsForHistory(
    transcriptions: SpeakerTranscription[],
    primaryUserSpeaker: string
  ): Message[] {
    const messages: Message[] = [];
    
    // Get the last message from the primary user
    const lastMessages = this.extractLastMessageBySpeaker(
      transcriptions,
      [primaryUserSpeaker, "external"]
    );
    
    // Add the primary user's message
    const lastUserMessage = lastMessages.get(primaryUserSpeaker);
    if (lastUserMessage) {
      messages.push({
        role: "user",
        content: `${USER_HEADER} (last message):\n${lastUserMessage.text}`
      });
    }
    
    // Add external speaker message
    const lastExternalMessage = lastMessages.get("external");
    if (lastExternalMessage) {
      // Extract original label if available
      const originalLabel = lastExternalMessage.text.includes('[') ?
        lastExternalMessage.text.match(/^\[([^\]]+)\]/)?.[1] : null;
        
      // Use original label when available and contains "Speaker"
      const speakerLabel = originalLabel?.includes("Speaker") ?
        originalLabel : EXTERNAL_SPEAKER_LABEL;
        
      // Clean any existing speaker prefix
      const cleanText = lastExternalMessage.text.replace(/^\[[^\]]+\]\s*/, '');
      
      messages.push({
        role: "user",
        content: `${EXTERNAL_HEADER} ${speakerLabel} (last message):\n[${speakerLabel}] ${cleanText}`
      });
    }
    
    return messages;
  }
} 