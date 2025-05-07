// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TranscriptionSnapshotTracker.ts
// Tracks previously sent transcription lines to prevent duplication

/**
 * A class responsible for tracking transcription lines that have already
 * been sent to OpenAI to prevent duplication in future requests.
 */
export class TranscriptionSnapshotTracker {
  private sentLines: Set<string> = new Set<string>();
  
  /**
   * Filters a transcription text to only include lines that haven't been sent before
   * @param transcription The full transcription text to filter
   * @returns A filtered transcription containing only new content
   */
  public filterTranscription(transcription: string): string {
    if (!transcription?.trim()) return '';
    
    // Split the transcription into lines and normalize each line
    const lines = transcription.split('\n')
      .map(line => this.normalizeLine(line))
      .filter(line => line.length > 0);
    
    // Filter out lines that have already been sent
    const newLines = lines.filter(line => !this.sentLines.has(line));
    
    // If no new lines, return empty string
    if (newLines.length === 0) return '';
    
    // Return the filtered transcription
    return newLines.join('\n');
  }
  
  /**
   * Updates the snapshot with lines that were just sent to OpenAI
   * @param transcription The transcription that was actually sent
   */
  public updateSnapshot(transcription: string): void {
    if (!transcription?.trim()) return;
    
    // Split the transcription into lines and normalize each line
    const lines = transcription.split('\n')
      .map(line => this.normalizeLine(line))
      .filter(line => line.length > 0);
    
    for (const line of lines) {
      this.sentLines.add(line);
    }
  }
  
  /**
   * Checks if a transcription contains only content that has already been sent
   * @param transcription The transcription to check
   * @returns True if all content has already been sent
   */
  public isAllContentSent(transcription: string): boolean {
    if (!transcription?.trim()) return true;
    
    const lines = transcription.split('\n')
      .map(line => this.normalizeLine(line))
      .filter(line => line.length > 0);
    
    // Check if all lines are already in the sent lines set
    return lines.every(line => this.sentLines.has(line));
  }
  
  /**
   * Resets the snapshot tracker, clearing all tracked lines
   */
  public reset(): void {
    this.sentLines.clear();
  }
  
  /**
   * Normalizes a line of text by trimming and collapsing whitespace
   * @param line The line of text to normalize
   * @returns Normalized line
   */
  private normalizeLine(line: string): string {
    if (!line) return '';
    
    // Trim the line and collapse multiple whitespaces within the line
    return line.trim().replace(/\s+/g, ' ');
  }
} 