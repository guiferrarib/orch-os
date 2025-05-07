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
      
      // Converter para ArrayBuffer sem fazer nenhuma modificação
      let buffer: ArrayBufferLike;
      if (blob instanceof Uint8Array) {
        buffer = blob.buffer;
      } else {
        buffer = await blob.arrayBuffer();
      }
      
      // Não modificar o buffer de forma alguma - enviar exatamente como recebido
      if (shouldLog) {
        this.logger.info(`Enviando buffer sem modificações: ${buffer.byteLength} bytes`);
      }
      
      return { buffer: buffer as ArrayBuffer, valid: true };
    } catch (error) {
      this.logger.handleError("Erro no processamento do áudio", error);
      return { buffer: null, valid: false };
    }
  }
  
  /**
   * Check audio format and provide diagnostic information
   */
  public checkAudioFormat(buffer: ArrayBufferLike): void {
    const view = new Uint8Array(buffer);
    
    // Verificar se é um formato de container (WAV, MP3, etc)
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
      this.logger.warning(`Formato detectado: ${isWav ? 'WAV' : isMP3 ? 'MP3' : isOGG ? 'OGG' : 'AAC'}. Deepgram espera PCM bruto!`);
      console.log(`⚠️ [COGNITIVE-AUDIO] Inadequate format detected. Deepgram expects raw Linear PCM (not WAV/MP3/OGG/AAC files). Artificial brain audio input rejected.`);
    }
    
    // Verificar se o PCM parece válido
    if (!isWav && !isMP3 && !isOGG && !isAAC) {
      // Contar bytes não-zero (se tudo for zero, o áudio é silêncio)
      const nonZeroCount = Array.from(view.slice(0, Math.min(1000, view.length)))
                         .filter(val => val !== 0).length;
      
      if (nonZeroCount === 0) {
        this.logger.warning("Áudio detectado como silêncio total (todos bytes são zero)");
        console.log("⚠️ [COGNITIVE-AUDIO] Silence detected: all bytes are zero! No cognitive input for brain memory.");
      } else if (nonZeroCount < 10) {
        this.logger.warning("Áudio com muito pouca variação (quase silêncio)");
        console.log("⚠️ [COGNITIVE-AUDIO] Nearly silent audio: few non-zero bytes. Weak input for cognitive memory.");
      }
    }
  }
  
  /**
   * Generate a silence frame (kept for compatibility)
   */
  public generateSilenceFrame(): ArrayBuffer {
    // Criar um pequeno buffer vazio apenas para compatibilidade
    return new ArrayBuffer(0);
  }
}
