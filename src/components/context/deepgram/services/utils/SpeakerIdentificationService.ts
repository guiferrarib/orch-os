// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// SpeakerIdentificationService.ts
// Service responsible for speaker identification and normalization

import { getPrimaryUser } from '../../../../../config/UserConfig';
import { EXTERNAL_SPEAKER_LABEL, SpeakerSegment, SpeakerTranscription } from "../../interfaces/transcription/TranscriptionTypes";
import { ISpeakerIdentificationService } from "../../interfaces/utils/ISpeakerIdentificationService";
import { LoggingUtils } from "../../utils/LoggingUtils";

export class SpeakerIdentificationService implements ISpeakerIdentificationService {
  private primaryUserSpeaker: string = getPrimaryUser();
  private currentSpeaker: string = "";

  constructor(primaryUserSpeaker?: string) {
    if (primaryUserSpeaker) {
      this.primaryUserSpeaker = primaryUserSpeaker;
    }
  }

  /**
   * Sets the name of the primary speaker (user)
   */
  setPrimaryUserSpeaker(name: string): void {
    if (name && name.trim()) {
      this.primaryUserSpeaker = name.trim();
      LoggingUtils.logInfo(`Primary speaker set as: "${this.primaryUserSpeaker}"`);
    }
  }
  
  /**
   * Gets the primary speaker (user)
   */
  getPrimaryUserSpeaker(): string {
    return this.primaryUserSpeaker;
  }

  /**
   * Normalizes the speaker identification for comparison
   * Converts variations like "user", "usuario", etc. to the primaryUserSpeaker
   */
  normalizeAndIdentifySpeaker(speaker: string): string {
    // If the input text is empty, return the primary speaker
    if (!speaker || !speaker.trim()) {
      return this.primaryUserSpeaker;
    }
    
    // Remove brackets if they exist
    const cleanSpeaker = speaker.replace(/^\[|\]$/g, '').trim();
    
    // Simple rule:
    // 1. If it is exactly "Guilherme", return primaryUserSpeaker
    // 2. If it is a pattern "Speaker N", return "external"
    // 3. For other cases, assume primaryUserSpeaker
    
    if (cleanSpeaker === this.primaryUserSpeaker) {
      return this.primaryUserSpeaker;
    }
    
    if (/^speaker\s*\d+$/i.test(cleanSpeaker)) {
      return "external";
    }
    
    // If it is a variation of "user", return primaryUserSpeaker
    if (/^(user|usuario|usuário)$/i.test(cleanSpeaker)) {
      return this.primaryUserSpeaker;
    }
    
    // By default, assume it is the primary user
    return this.primaryUserSpeaker;
  }

  /**
   * Extracts speech segments from a transcription that mixes speakers
   * Example: "[Guilherme] Olá [Speaker 0] Como vai? [Guilherme] Estou bem"
   * → [{ speaker: "Guilherme", text: "Olá" }, { speaker: "Speaker 0", text: "Como vai?" }, ...]
   */
  splitMixedTranscription(text: string): SpeakerSegment[] {
    const segments: SpeakerSegment[] = [];
    
    // Sanitize the input text
    const cleanText = text?.trim() || "";
    if (!cleanText) {
      return segments;
    }
    
    // Regex simplified to capture patterns like [Speaker] text until the next [Speaker]
    // Captures group 1: speaker name between brackets
    // Captures group 2: text spoken until the next speaker or end of the string
    const speakerPattern = /\[([^\]]+)\]\s*(.*?)(?=\s*\[[^\]]+\]|$)/gs;
    
    let match;
    let matchFound = false;
    let lastSpeakerKey = "";
    
    while ((match = speakerPattern.exec(cleanText)) !== null) {
      matchFound = true;
      const rawSpeaker = match[1].trim();
      const spokenText = match[2].trim();
      
      if (spokenText) {
        // Simple rule: If the speaker is "Guilherme", assign to the user
        // If the speaker is "Speaker N", assign as external
        let speakerToUse;
        
        if (rawSpeaker === this.primaryUserSpeaker) {
          speakerToUse = this.primaryUserSpeaker;
        } else if (/^speaker\s*\d+$/i.test(rawSpeaker)) {
          speakerToUse = "external";
        } else {
          // For other cases, use normalization
          speakerToUse = this.normalizeAndIdentifySpeaker(rawSpeaker);
        }
        
        // Show speaker if different from the previous one
        const showSpeaker = (lastSpeakerKey !== speakerToUse);
        lastSpeakerKey = speakerToUse;
        
        LoggingUtils.logInfo(`Segmento [${rawSpeaker}] → ${speakerToUse}: "${spokenText.substring(0, 30)}..."`);
        
        segments.push({
          speaker: speakerToUse,
          text: spokenText,
          showSpeaker: showSpeaker
        });
      }
    }
    
    // If no speaker pattern is found, consider the complete text
    if (!matchFound && cleanText) {
      // Use the current speaker of the service, if available
      const speakerToUse = this.currentSpeaker || this.primaryUserSpeaker;
      
      segments.push({
        speaker: speakerToUse,
        text: cleanText,
        showSpeaker: true // Always show when there is no explicit pattern
      });
      
      LoggingUtils.logInfo(`Text without speaker labels, assigned to: "${speakerToUse}"`);
    }
    
    return segments;
  }

  /**
   * Filters transcriptions by specific speaker
   */
  filterTranscriptionsBySpeaker(speaker: string, transcriptions: SpeakerTranscription[]): SpeakerTranscription[] {
    return transcriptions.filter(
      st => st.speaker === speaker
    );
  }

  /**
   * Filters transcriptions by the primary user,
   * extracting only segments where the user is speaking
   */
  filterTranscriptionsByUser(transcriptions: SpeakerTranscription[]): SpeakerTranscription[] {
    const userTranscriptions = transcriptions.filter(st => {
      // Basic verification: speaker must be the primary user
      if (st.speaker !== this.primaryUserSpeaker) {
        LoggingUtils.logInfo(`[FiltroUser] Rejeitado: speaker diferente do usuário principal (${st.speaker}) - texto: ${st.text.substring(0, 60)}`);
        return false;
      }
      // If the text contains speaker delimiters [...], ensure no external segments are present
      if (st.text.includes('[') && st.text.includes(']')) {
        const segments = this.splitMixedTranscription(st.text);
        if (segments.some(segment => segment.speaker !== this.primaryUserSpeaker)) {
          LoggingUtils.logInfo(`[FiltroUser] Rejeitado: transcrição mista com segmento externo detectado - texto: ${st.text.substring(0, 60)}`);
          return false;
        }
      }
      // If the text starts with an external speaker pattern, it is not from the user
      if (/^speaker\s*\d+\s*:/i.test(st.text)) {
        LoggingUtils.logInfo(`[FiltroUser] Rejeitado: começa como falante externo - texto: ${st.text.substring(0, 60)}`);
        return false;
      }
      // If the text explicitly mentions '[Speaker' at the beginning, log for diagnosis
      if (/^\[Speaker\s*\d+\]/i.test(st.text)) {
        LoggingUtils.logInfo(`[FiltroUser] Rejeitado: possível segmento externo no início - texto: ${st.text.substring(0, 60)}`);
        return false;
      }
      return true;
    });
    
    LoggingUtils.logInfo(`Filtrado ${userTranscriptions.length} transcrições do usuário principal`);
    return userTranscriptions;
  }

  /**
   * Verifies if only the primary user is speaking
   */
  isOnlyUserSpeaking(transcriptions: SpeakerTranscription[]): boolean {
    if (transcriptions.length === 0) {
      return true; // No transcriptions yet, assume only user
    }
    
    // For each transcription, verify if it contains only the user speaking
    for (const transcription of transcriptions) {
      // If the transcription contains speaker markers [Speaker]
      if (transcription.text.includes('[') && transcription.text.includes(']')) {
        const segments = this.splitMixedTranscription(transcription.text);
        
        // If any segment is not from the primary user, it is not just the user speaking
        const hasNonUserSegment = segments.some(segment => 
          this.normalizeAndIdentifySpeaker(segment.speaker) !== this.primaryUserSpeaker
        );
        
        if (hasNonUserSegment) {
          return false;
        }
      } else {
        // If no markers, verify by the speaker field
        if (this.normalizeAndIdentifySpeaker(transcription.speaker) !== this.primaryUserSpeaker) {
          return false;
        }
      }
    }
    
    // If it got here, all transcriptions are from the user
    return true;
  }

  /**
   * Prepares the transcription text for sending, combining all inputs
   */
  prepareTranscriptionText(
    transcriptionList: string[],
    speakerTranscriptions: SpeakerTranscription[],
    lastTranscription: string
  ): string {
    // If we have transcriptions by speaker, use primarily these
    if (speakerTranscriptions.length > 0) {
      // Use a Set to avoid duplicate text
      const processedTexts = new Set<string>();
      
      // First, sort by timestamp to ensure chronological order
      const sortedTranscriptions = [...speakerTranscriptions]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Process each transcription, maintaining all speakers in sequence
      const conversationPieces: string[] = [];
      let lastSpeakerKey = "";
      
      for (const st of sortedTranscriptions) {
        // Avoid duplicate text
        if (processedTexts.has(st.text)) continue;
        processedTexts.add(st.text);
        
        // For transcriptions already with [Speaker] format
        if (st.text.includes('[') && st.text.includes(']')) {
          // Divide into segments to preserve multiple speakers within the same sentence
          const speakerPattern = /\[([^\]]+)\]\s*(.*?)(?=\s*\[[^\]]+\]|$)/gs;
          let match;
          let segmentFound = false;
          
          while ((match = speakerPattern.exec(st.text)) !== null) {
            segmentFound = true;
            if (match[1] && match[2]) {
              const rawSpeaker = match[1].trim();
              const spokenText = match[2].trim();
              
              // For each segment, determine if to show the speaker or not
              const speakerKey = /^speaker\s*\d+$/i.test(rawSpeaker) ? 
                `speaker_${rawSpeaker}` : rawSpeaker;
              
              // Show speaker if different from the previous one
              const showSpeaker = (lastSpeakerKey !== speakerKey);
              
              // Format the text appropriately
              if (showSpeaker && spokenText) {
                conversationPieces.push(`[${rawSpeaker}] ${spokenText}`);
              } else if (spokenText) {
                conversationPieces.push(spokenText);
              }
              
              lastSpeakerKey = speakerKey;
            }
          }
          
          // If no segments found, add the text as is
          if (!segmentFound && st.text.trim()) {
            conversationPieces.push(st.text.trim());
          }
        } else {
          // For transcriptions without explicit [Speaker] format
          // Determine the correct speaker
          let speakerLabel: string;
          let speakerKey: string;
          
          if (st.speaker === this.primaryUserSpeaker) {
            speakerLabel = this.primaryUserSpeaker;
            speakerKey = this.primaryUserSpeaker;
          } else {
            // For external speakers, verify if they have a specific number using a more precise regex
            const speakerMatch = st.text.match(/\bspeaker\s*(\d+)\b/i);
            if (speakerMatch && speakerMatch[1]) {
              speakerLabel = `Speaker ${speakerMatch[1]}`;
              speakerKey = `speaker_${speakerMatch[1]}`;
            } else {
              speakerLabel = EXTERNAL_SPEAKER_LABEL;
              speakerKey = "external";
            }
          }
          
          // Show speaker if different from the previous one
          const showSpeaker = (lastSpeakerKey !== speakerKey);
          
          // Format the text appropriately
          if (showSpeaker) {
            conversationPieces.push(`[${speakerLabel}] ${st.text}`);
          } else {
            conversationPieces.push(st.text);
          }
          
          lastSpeakerKey = speakerKey;
        }
      }
      
      return conversationPieces.join("\n");
    }
    
    // Alternative case: use the traditional list
    const validTranscriptions = transcriptionList
      .filter(text => text && text.trim().length > 0);
    
    if (validTranscriptions.length > 0) {
      // Remove duplicates while maintaining order
      const uniqueTranscriptions = [...new Set(validTranscriptions)];
      return uniqueTranscriptions.join(" ").trim();
    }
    
    // Last option: use the last known transcription
    if (lastTranscription && lastTranscription.trim()) {
      return lastTranscription.trim();
    }
    
    return "Please respond based only on the context provided.";
  }
} 