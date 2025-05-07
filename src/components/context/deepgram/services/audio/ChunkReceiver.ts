// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * ChunkReceiver handles receiving audio chunks from the IPC channel.
 */
import { Logger } from '../utils/Logger';

export class ChunkReceiver {
  private logger: Logger;
  private removeChunkListener: (() => void) | null = null;
  private audioChunkHandler: (arrayBuffer: ArrayBuffer) => Promise<void>;
  
  constructor(audioChunkHandler: (arrayBuffer: ArrayBuffer) => Promise<void>) {
    this.logger = new Logger('ChunkReceiver');
    this.audioChunkHandler = audioChunkHandler;
  }
  
  /**
   * Set up the chunk receiver from the main process via IPC
   */
  public setupChunkReceiver(): void {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Clear previous listener if it exists
      if (this.removeChunkListener) {
        this.removeChunkListener();
      }
      
      this.logger.info("Registering audio chunk receiver via IPC");
      
      // Register new listener to receive audio chunks from the main process
      this.removeChunkListener = window.electronAPI.onSendChunk((arrayBuffer: ArrayBuffer) => {
        this.handleIncomingAudioChunk(arrayBuffer);
      });
    } else {
      this.logger.warning("API Electron not available, IPC audio reception disabled");
    }
  }
  
  /**
   * Handle incoming audio chunks from IPC
   */
  private async handleIncomingAudioChunk(arrayBuffer: ArrayBuffer): Promise<void> {
    try {
      // Convert ArrayBuffer to Uint8Array for compatibility
      const audioData = new Uint8Array(arrayBuffer);
      
      if (audioData.byteLength > 0) {
        if (Math.random() < 0.01) {
          // Periodic log to verify data flow
          this.logger.info(`Chunk of audio received via IPC: ${audioData.byteLength} bytes`);
        }
        
        // Pass the audio chunk to the configured handler
        await this.audioChunkHandler(arrayBuffer);
      }
    } catch (error) {
      this.logger.handleError("Error processing audio chunk from IPC", error);
    }
  }
  
  /**
   * Clean up the chunk receiver
   */
  public cleanup(): void {
    if (this.removeChunkListener) {
      this.removeChunkListener();
      this.removeChunkListener = null;
    }
  }
}
