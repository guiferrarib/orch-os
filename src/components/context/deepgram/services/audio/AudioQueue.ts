// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * AudioQueue manages the queuing and processing of audio chunks
 * for the Deepgram service.
 */
import { Logger } from '../utils/Logger';

export class AudioQueue {
  private logger: Logger;
  private audioQueue: Uint8Array[] = [];
  private maxQueueSize: number = 10;
  private isProcessingQueue: boolean = false;
  private emptyAudioCounter: number = 0;
  
  constructor(maxQueueSize?: number) {
    this.logger = new Logger('AudioQueue');
    if (maxQueueSize) {
      this.maxQueueSize = maxQueueSize;
    }
  }
  
  /**
   * Check if the queue is full
   */
  public isQueueFull(): boolean {
    return this.audioQueue.length >= this.maxQueueSize;
  }
  
  /**
   * Get the current queue size
   */
  public getQueueSize(): number {
    return this.audioQueue.length;
  }
  
  /**
   * Clear the queue
   */
  public clearQueue(): void {
    const queueSize = this.audioQueue.length;
    if (queueSize > 0) {
      this.logger.info(`Limpando fila de áudio (${queueSize} chunks)`);
      this.audioQueue = [];
    }
  }
  
  /**
   * Reset the empty audio counter
   */
  public resetEmptyAudioCounter(): void {
    this.emptyAudioCounter = 0;
  }
  
  /**
   * Increment the empty audio counter
   */
  public incrementEmptyAudioCounter(): void {
    this.emptyAudioCounter++;
  }
  
  /**
   * Get the empty audio counter value
   */
  public getEmptyAudioCounter(): number {
    return this.emptyAudioCounter;
  }
  
  /**
   * Check if the queue is currently being processed
   */
  public isProcessing(): boolean {
    return this.isProcessingQueue;
  }
  
  /**
   * Set the processing state
   */
  public setProcessing(isProcessing: boolean): void {
    this.isProcessingQueue = isProcessing;
  }
  
  /**
   * Add audio to the queue
   */
  public async enqueueAudio(blob: Blob | Uint8Array): Promise<void> {
    if (this.isQueueFull()) {
      this.logger.warning(`Fila cheia (${this.audioQueue.length}), ignorando novo chunk de áudio`);
      return;
    }
    
    try {
      if (blob instanceof Blob) {
        const arrayBuffer = await blob.arrayBuffer();
        this.audioQueue.push(new Uint8Array(arrayBuffer));
      } else {
        this.audioQueue.push(blob);
      }
      
      // Reduzir frequência de logs para evitar spam
      if (this.audioQueue.length % 5 === 0 || this.audioQueue.length === 1) {
        this.logger.debug(`Áudio enfileirado (total: ${this.audioQueue.length})`);
      }
    } catch (error) {
      this.logger.handleError("Erro ao enfileirar áudio", error);
    }
  }
  
  /**
   * Retrieve and remove the next audio chunk from the queue
   */
  public dequeueAudio(): Uint8Array | null {
    if (this.audioQueue.length === 0) {
      return null;
    }
    
    return this.audioQueue.shift() || null;
  }
  
  /**
   * Discard half of the queue when needed (e.g., after reconnection failures)
   */
  public discardHalfQueue(): void {
    if (this.audioQueue.length > 0) {
      this.logger.warning(`Descartando metade da fila (${this.audioQueue.length} chunks)`);
      this.audioQueue = this.audioQueue.slice(-Math.floor(this.audioQueue.length / 2));
    }
  }
  
  /**
   * Check if the queue has any items
   */
  public hasItems(): boolean {
    return this.audioQueue.length > 0;
  }
}
