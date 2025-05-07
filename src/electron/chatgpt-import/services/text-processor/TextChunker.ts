// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { countTokens } from '../../../../components/context/deepgram/services/memory/utils/tokenUtils';
import { MessageChunk, ProcessedMessage } from '../../interfaces/types';
import { Logger } from '../../utils/logging';

/**
 * Service responsible for dividing texts into smaller chunks for efficient processing
 */
export class TextChunker {
  private readonly maxTokensPerChunk: number;
  private readonly maxTokensPerBatch: number;
  private readonly logger: Logger;

  constructor(maxTokensPerChunk: number = 1000, maxTokensPerBatch: number = 8000) {
    this.maxTokensPerChunk = maxTokensPerChunk;
    this.maxTokensPerBatch = maxTokensPerBatch;
    this.logger = new Logger('[TextChunker]');
  }

  /**
   * Process messages into chunks for better processing
   */
  public processMessagesIntoChunks(messages: ProcessedMessage[]): MessageChunk[] {
    this.logger.info(`Analyzing and processing ${messages.length} messages for optimization...`);
    
    const allMessageChunks: MessageChunk[] = [];
    
    for (const message of messages) {
      // For small content, we don't need to divide
      if (countTokens(message.content) <= this.maxTokensPerChunk) {
        allMessageChunks.push({
          original: message,
          content: message.content
        });
        continue;
      }
      
      // For large content, we divide into semantically coherent chunks
      const chunks = this.splitIntoChunks(message.content);
      if (chunks.length === 1) {
        // If it didn't divide (rare case), we add it as is
        allMessageChunks.push({
          original: message,
          content: chunks[0]
        });
      } else {
        // If it was divided, we add each part with metadata
        chunks.forEach((chunkContent, index) => {
          allMessageChunks.push({
            original: message,
            content: chunkContent,
            part: index + 1,
            totalParts: chunks.length
          });
        });
      }
    }
    
    this.logger.info(`After processing: ${allMessageChunks.length} chunks created from ${messages.length} original messages`);
    return allMessageChunks;
  }

  /**
   * Splits text into semantically coherent chunks
   */
  public splitIntoChunks(text: string, maxTokens: number = this.maxTokensPerChunk): string[] {
    if (!text) return [];
    
    // If the text is already small enough, we don't need to divide
    const totalTokens = countTokens(text);
    if (totalTokens <= maxTokens) return [text];
    
    // Identify possible break points (paragraphs, sentences, etc.)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // If we have paragraphs, we try to use them as units of division
    if (paragraphs.length > 1) {
      return this.splitByParagraphs(paragraphs, maxTokens);
    }
    
    // If it's a single large paragraph, try to divide by sentences
    return this.splitBySentences(text, maxTokens);
  }

  private splitByParagraphs(paragraphs: string[], maxTokens: number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    let currentChunkTokens = 0;
    
    for (const paragraph of paragraphs) {
      const paragraphTokens = countTokens(paragraph);
      
      // If a single paragraph is too large, we need to divide it by sentences
      if (paragraphTokens > maxTokens) {
        // First add the current chunk if not empty
        if (currentChunkTokens > 0) {
          chunks.push(currentChunk);
          currentChunk = "";
          currentChunkTokens = 0;
        }
        
        // Divide the large paragraph into sentences and create new chunks
        const sentenceChunks = this.splitBySentences(paragraph, maxTokens);
        chunks.push(...sentenceChunks);
      } 
      // If adding this paragraph would exceed the limit, start a new chunk
      else if (currentChunkTokens + paragraphTokens > maxTokens) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
        currentChunkTokens = paragraphTokens;
      } 
      // Add the paragraph to the current chunk
      else {
        if (currentChunkTokens > 0) {
          currentChunk += "\n\n" + paragraph;
        } else {
          currentChunk = paragraph;
        }
        currentChunkTokens += paragraphTokens;
      }
    }
    
    // Add the last chunk if not empty
    if (currentChunkTokens > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private splitBySentences(text: string, maxTokens: number): string[] {
    return this.splitByDelimiter(text, '. ', maxTokens);
  }

  private splitByDelimiter(text: string, delimiter: string, maxTokens: number): string[] {
    if (countTokens(text) <= maxTokens) return [text];
    
    const parts = text.split(delimiter);
    const chunks: string[] = [];
    let currentChunk = "";
    let currentChunkTokens = 0;
    
    for (const part of parts) {
      const partWithDelimiter = part + (delimiter || "");
      const partTokens = countTokens(partWithDelimiter);
      
      // If a single part is larger than the maximum, we need to divide it further
      if (partTokens > maxTokens) {
        // First add the current chunk if not empty
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
          currentChunkTokens = 0;
        }
        
        // Divide using the last resort method
        const subChunks = this.forceSplitBySize(partWithDelimiter, maxTokens);
        chunks.push(...subChunks);
        continue;
      }
      
      // If adding this part would exceed the token limit, start a new chunk
      if (currentChunkTokens + partTokens > maxTokens) {
        // Save the current chunk and start a new one
        chunks.push(currentChunk);
        currentChunk = partWithDelimiter;
        currentChunkTokens = partTokens;
      } else {
        // Add the part to the current chunk
        currentChunk += partWithDelimiter;
        currentChunkTokens += partTokens;
      }
    }
    
    // Add the last chunk if not empty
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private forceSplitBySize(text: string, maxTokens: number): string[] {
    const tokens = countTokens(text);
    if (tokens <= maxTokens) return [text];
    
    // Estimate characters per token (approximately)
    const charsPerToken = text.length / tokens;
    const charsPerChunk = Math.floor(maxTokens * charsPerToken) * 0.9; // 10% margin
    
    const chunks: string[] = [];
    let startChar = 0;
    
    while (startChar < text.length) {
      let endChar = Math.min(startChar + charsPerChunk, text.length);
      
      // Try to find a space to make the break cleaner
      if (endChar < text.length) {
        const nextSpace = text.indexOf(' ', endChar - 20);
        if (nextSpace > 0 && nextSpace < endChar + 20) {
          endChar = nextSpace;
        }
      }
      
      const chunk = text.substring(startChar, endChar).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      
      startChar = endChar;
    }
    
    return chunks;
  }

  /**
   * Creates batches of chunks for efficient processing
   */
  public createProcessingBatches(messageChunks: MessageChunk[]): MessageChunk[][] {
    const batches: MessageChunk[][] = [];
    let currentBatch: MessageChunk[] = [];
    let currentBatchTokens = 0;
    
    for (const chunk of messageChunks) {
      const chunkTokens = countTokens(chunk.content);
      
      // If adding this chunk would exceed the token limit, start a new batch
      if (currentBatchTokens + chunkTokens > this.maxTokensPerBatch) {
        batches.push([...currentBatch]);
        currentBatch = [];
        currentBatchTokens = 0;
      }
      
      // Add the chunk to the current batch
      currentBatch.push(chunk);
      currentBatchTokens += chunkTokens;
    }
    
    // Add the last batch if not empty
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    this.logger.info(`Processing ${messageChunks.length} chunks in ${batches.length} batches (max ${this.maxTokensPerBatch} tokens per batch)`);
    return batches;
  }
}
