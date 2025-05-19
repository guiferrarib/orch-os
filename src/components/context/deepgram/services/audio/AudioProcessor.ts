// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * AudioProcessor handles audio processing, validation, and diagnostics
 * for the Deepgram service.
 */
import { IAudioAnalyzer } from '../../interfaces/deepgram/IDeepgramService';
import { AudioProcessingResult } from '../utils/DeepgramTypes';
import { Logger } from '../utils/Logger';

export class AudioProcessor {
  private logger: Logger;
  private analyzer: IAudioAnalyzer | null;
  
  constructor(analyzer: IAudioAnalyzer | null) {
    this.logger = new Logger('AudioProcessor');
    this.analyzer = analyzer;
  }
  
  /**
   * Log diagnostic information about the audio
   */
  public logAudioDiagnostics(blob: Blob | Uint8Array, connection?: { getReadyState: () => number }): void {
    try {
      if (blob instanceof Uint8Array) {
        const firstBytes = Array.from(blob.slice(0, 16))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        
        this.logger.debug("AUDIO DIAGNOSTICS (COGNITIVE)", {
          type: "Uint8Array",
          size: blob.byteLength,
          firstBytes: firstBytes,
          brainConnectionActive: !!connection,
          readyState: connection?.getReadyState()
        });
      } else {
        this.logger.debug("AUDIO DIAGNOSTICS (COGNITIVE)", {
          type: "Blob",
          size: blob.size,
          mimeType: blob.type,
          brainConnectionActive: !!connection,
          readyState: connection?.getReadyState()
        });
      }
    } catch (e) {
      this.logger.warning("Error analyzing audio data for cognitive brain input", e);
    }
  }
  
  /**
   * Prepare and validate audio buffer for sending to Deepgram
   */
  public async prepareAudioBuffer(blob: Blob | Uint8Array, shouldLog: boolean): Promise<AudioProcessingResult> {
    try {
      // Tamanho mínimo para envio
      const size = blob instanceof Blob ? blob.size : blob.byteLength;
      if (size < 32) {
        if (shouldLog) this.logger.warning(`Pacote de áudio muito pequeno (${size} bytes)`);
        return { buffer: null, valid: false };
      }
      
      // Converter para ArrayBuffer
      let buffer: ArrayBufferLike;
      if (blob instanceof Uint8Array) {
        buffer = blob.buffer;
      } else {
        buffer = await blob.arrayBuffer();
      }
      
      // For raw PCM, we need to ensure data is interpreted correctly
      // We can verify format and adjust if necessary
      if (shouldLog) {
        this.logger.info(`Sending PCM buffer: ${buffer.byteLength} bytes (16-bit linear PCM mono, 16kHz)`);
        
        // Log first bytes for debugging (optional)
        const view = new Uint8Array(buffer);
        const firstBytes = Array.from(view.slice(0, 16))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
        this.logger.debug(`First bytes of PCM: ${firstBytes}`);
      }
      
      return { buffer: buffer as ArrayBuffer, valid: true };
    } catch (error) {
      this.logger.handleError("Error processing audio", error);
      return { buffer: null, valid: false };
    }
  }
  
  /**
   * Check audio format and provide diagnostic information
   */
  public checkAudioFormat(buffer: ArrayBufferLike): void {
    const view = new Uint8Array(buffer);
    
    // Check if it's a container format (WAV, MP3, etc)
    const isWav = view.length > 12 && 
                  view[0] === 0x52 && view[1] === 0x49 && // "RI"
                  view[2] === 0x46 && view[3] === 0x46 && // "FF"
                  view[8] === 0x57 && view[9] === 0x41 && // "WA" 
                  view[10] === 0x56 && view[11] === 0x45; // "VE"
    
    const isMP3 = view.length > 3 &&
                  ((view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33) || // "ID3"
                  (view[0] === 0xFF && (view[1] & 0xE0) === 0xE0));              // MP3 frame sync
    
    const isOGG = view.length > 4 && 
                  view[0] === 0x4F && view[1] === 0x67 && // "Og"
                  view[2] === 0x67 && view[3] === 0x53;   // "gS"
    
    const isAAC = view.length > 2 && 
                 (view[0] === 0xFF && (view[1] & 0xF0) === 0xF0);
    
    if (isWav || isMP3 || isOGG || isAAC) {
      this.logger.warning(`Format detected: ${isWav ? 'WAV' : isMP3 ? 'MP3' : isOGG ? 'OGG' : 'AAC'}. Deepgram expects raw PCM!`);
      console.log(`⚠️ [COGNITIVE-AUDIO] Inadequate format detected. Deepgram expects raw Linear PCM (not WAV/MP3/OGG/AAC files). Artificial brain audio input rejected.`);
    }
    
    // Check if the PCM seems valid
    if (!isWav && !isMP3 && !isOGG && !isAAC) {
      // Count non-zero bytes (if all zero, the audio is silence)
      const nonZeroCount = Array.from(view.slice(0, Math.min(1000, view.length)))
                         .filter(val => val !== 0).length;
      
      if (nonZeroCount === 0) {
        this.logger.warning("Audio detected as complete silence (all bytes are zero)");
        console.log("⚠️ [COGNITIVE-AUDIO] Silence detected: all bytes are zero! No cognitive input for brain memory.");
      } else if (nonZeroCount < 10) {
        this.logger.warning("Audio with very little variation (nearly silence)");
        console.log("⚠️ [COGNITIVE-AUDIO] Nearly silent audio: few non-zero bytes. Weak input for cognitive memory.");
      }
    }
  }
  
  /**
   * Generate a silence frame (kept for compatibility)
   */
  public generateSilenceFrame(): ArrayBuffer {
    // Create a small empty buffer just for compatibility
    return new ArrayBuffer(0);
  }
}
