// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * AudioSender handles the preparation and sending of audio data to Deepgram.
 */
import { ConnectionState } from '../../interfaces/deepgram/IDeepgramService';
import { ConnectionManager } from '../connection/ConnectionManager';
import { Logger } from '../utils/Logger';
import { AudioProcessor } from './AudioProcessor';
import { AudioQueue } from './AudioQueue';
import { ListenLiveClient } from '@deepgram/sdk';

export class AudioSender {
  private logger: Logger;
  private audioProcessor: AudioProcessor;
  private audioQueue: AudioQueue;
  private connectionManager: ConnectionManager;
  private lastRealAudioTimestamp: number = Date.now();
  
  constructor(
    audioProcessor: AudioProcessor,
    audioQueue: AudioQueue,
    connectionManager: ConnectionManager
  ) {
    this.logger = new Logger('AudioSender');
    this.audioProcessor = audioProcessor;
    this.audioQueue = audioQueue;
    this.connectionManager = connectionManager;
  }
  
  /**
   * Send audio chunk to Deepgram
   */
  public async sendAudioChunk(blob: Blob | Uint8Array): Promise<boolean> {
    // Caso ideal: conexão ativa e pronta
    if (this.connectionManager.isActiveConnection()) {
      return this.processAndSendAudio(blob);
    }
    
    // Verify if we should continue adding to the queue
    if (this.audioQueue.isQueueFull()) {
      // If we reach the maximum queue size and we are still trying to connect for a long time,
      // something is wrong. Let's reset the connection.
      if (this.connectionManager.getConnectionState() === ConnectionState.CONNECTING) {
        this.logger.warning(`Queue is full (${this.audioQueue.getQueueSize()}) but connection is not established. Resetting connection.`);
        this.connectionManager.resetConnection(ConnectionState.CLOSED);
        
        // Partially clear the queue to avoid overloading
        this.audioQueue.discardHalfQueue();
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          this.connectionManager.forceReconnect();
        }, 1000);
        
        return false;
      }
      
      this.logger.warning(`Audio queue is full (${this.audioQueue.getQueueSize()}), discarding chunk`);
      return false;
    }
    
    // Enqueue the audio and manage the connection based on the current state
    await this.audioQueue.enqueueAudio(blob);
    
    // Inconsistent state: OPEN without connection object
    if (this.connectionManager.getConnectionState() === ConnectionState.OPEN && 
        !this.connectionManager.getConnection()) {
      this.logger.error("Inconsistent state: OPEN without connection");
      await this.connectionManager.forceReconnect();
      return false;
    }
    
    // Already connecting: just enqueued
    if (this.connectionManager.getConnectionState() === ConnectionState.CONNECTING) {
      this.logger.info("Connection in progress, audio enqueued");
      return false;
    }
    
    // No connection and not trying to connect: start one
    if (this.connectionManager.getConnectionState() === ConnectionState.CLOSED || 
        this.connectionManager.getConnectionState() === ConnectionState.ERROR ||
        this.connectionManager.getConnectionState() === ConnectionState.STOPPED) {
      this.logger.info("Starting connection to send audio");
      await this.connectionManager.connectToDeepgram();
      return false;
    }
    
    // Update the timestamp of the last real audio sent
    this.lastRealAudioTimestamp = Date.now();
    
    return true;
  }
  
  /**
   * Process queued audio chunks
   */
  public async processQueuedChunks(): Promise<void> {
    if (!this.audioQueue.hasItems()) {
      this.logger.debug("No audio enqueued to process");
      return;
    }
    
    if (!this.connectionManager.isActiveConnection()) {
      // Check if the connection is in progress
      if (this.connectionManager.getConnectionState() === ConnectionState.CONNECTING) {
        this.logger.info("Waiting for connection to be established to process queue");
        return;
      }
      
      this.logger.warning("Unable to process queue: connection unavailable");
      
      // If closed, try to reconnect
      if ((this.connectionManager.getConnectionState() === ConnectionState.CLOSED || 
           this.connectionManager.getConnectionState() === ConnectionState.ERROR) && 
          this.audioQueue.hasItems()) {
        
        this.logger.info("Trying to reconnect to process enqueued audio");
        await this.connectionManager.forceReconnect();
        return; // The reconnection will call processQueuedChunks() again after establishing connection
      }
      
      return;
    }
    
    const queueSize = this.audioQueue.getQueueSize();
    this.logger.info(`Processing audio queue (${queueSize} chunks)`);
    
    // Limit the number of chunks processed at once to avoid overloading
    const maxChunksPerBatch = 5;
    const chunksToProcess = Math.min(queueSize, maxChunksPerBatch);
    
    let successCount = 0;
    
    // Set processing flag
    this.audioQueue.setProcessing(true);
    
    try {
      for (let i = 0; i < chunksToProcess; i++) {
        const chunk = this.audioQueue.dequeueAudio();
        if (!chunk) break;
        
        // Process without re-enqueueing to avoid loops
        const success = await this.processAndSendAudio(chunk, false);
        if (success) successCount++;
        
        // Small pause between chunks to avoid overloading
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if the connection is still active after each chunk
        if (!this.connectionManager.isActiveConnection()) {
          this.logger.warning("Connection lost during queue processing. Stopping.");
          break;
        }
      }
      
      this.logger.info(`Processed ${successCount}/${chunksToProcess} chunks of the queue. Remaining: ${this.audioQueue.getQueueSize()}`);
      
      // If there are still items in the queue, schedule another processing
      if (this.audioQueue.hasItems() && this.connectionManager.isActiveConnection()) {
        setTimeout(() => this.processQueuedChunks(), 500);
      }
    } finally {
      // Clear processing flag
      this.audioQueue.setProcessing(false);
    }
  }
  
  /**
   * Process and send audio to Deepgram
   */
  private async processAndSendAudio(blob: Blob | Uint8Array, allowEnqueue = true): Promise<boolean> {
    try {
      const shouldLog = Math.random() < 0.05;
      
      if (shouldLog) this.audioProcessor.logAudioDiagnostics(blob, this.connectionManager.getConnection() as ListenLiveClient);
      
      // If we don't have an active connection
      if (!this.connectionManager.isActiveConnection()) {
        if (allowEnqueue) {
          await this.audioQueue.enqueueAudio(blob);
          
          // If the connection is closed, start a new one
          if (this.connectionManager.getConnectionState() === ConnectionState.CLOSED ||
              this.connectionManager.getConnectionState() === ConnectionState.ERROR) {
            this.logger.info("Starting connection to send audio");
            this.connectionManager.connectToDeepgram().catch(err => {
              this.logger.error("Error starting connection", err);
            });
          }
        }
        return false;
      }
      
      const { buffer, valid } = await this.audioProcessor.prepareAudioBuffer(blob, shouldLog);
      if (!valid || !buffer) return false;
      
      // Verify if the connection is still active before sending
      const connection = this.connectionManager.getConnection();
      if (!connection || connection.getReadyState() !== 1) {
        this.logger.warning("Connection lost before sending audio");
        if (allowEnqueue) {
          await this.audioQueue.enqueueAudio(blob);
        }
        return false;
      }
      
      // Ocasional log without modifying the audio
      if (Math.random() < 0.01) {
        console.log(`📢 [AUDIO] Sending buffer of ${buffer.byteLength} bytes`);
      }
      
      connection.send(buffer);
      if (shouldLog) this.logger.debug(`Audio sent: ${buffer.byteLength} bytes`);
      
      // Reset empty audio counter when valid data is sent
      this.audioQueue.resetEmptyAudioCounter();
      
      return true;
    } catch (error) {
      this.logger.handleError("Error processing/sending audio", error);
      return false;
    }
  }
  
  /**
   * Get the timestamp of the last real audio sent
   */
  public getLastRealAudioTimestamp(): number {
    return this.lastRealAudioTimestamp;
  }
  
  /**
   * Set the timestamp of the last real audio sent
   */
  public updateLastRealAudioTimestamp(): void {
    this.lastRealAudioTimestamp = Date.now();
  }
}
