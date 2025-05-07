// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// AudioAnalyzer.ts
// Implementation of the audio analysis service for Deepgram

import { ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { IAudioAnalyzer } from "./interfaces/deepgram/IDeepgramService";

export class DeepgramAudioAnalyzer implements IAudioAnalyzer {
  private getConnection: () => ListenLiveClient | null;

  constructor(getConnection: () => ListenLiveClient | null) {
    this.getConnection = getConnection;
  }

  analyzeAudioBuffer(buffer: ArrayBufferLike): { valid: boolean, details: any } {
    try {
      const view = new DataView(buffer);
      const uint8View = new Uint8Array(buffer);
      
      // Check minimum buffer size
      if (buffer.byteLength < 64) {
        return {
          valid: false,
          details: {
            reason: "Buffer too small",
            size: buffer.byteLength
          }
        };
      }
      
      // Detect if it looks like a WAV header
      const isWav = 
        String.fromCharCode(uint8View[0], uint8View[1], uint8View[2], uint8View[3]) === 'RIFF' &&
        String.fromCharCode(uint8View[8], uint8View[9], uint8View[10], uint8View[11]) === 'WAVE';
      
      // Detect if it looks like a WebM (starts with 0x1A 0x45 0xDF 0xA3)
      const isWebM = uint8View[0] === 0x1A && uint8View[1] === 0x45 && uint8View[2] === 0xDF && uint8View[3] === 0xA3;
      
      // PCM raw analysis (no header)
      const pcmAnalysis = {
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE,
        avg: 0,
        rms: 0,
        zeroCount: 0,
        sampleCount: 0
      };
      
      // Ensure the buffer has enough data for Int16Array
      // Int16Array requires an even number of bytes
      const alignedLength = Math.floor(buffer.byteLength / 2) * 2;
      
      // Proceed with PCM analysis only if we have enough data
      if (alignedLength >= 64) {
        // Create an Int16Array view adjusted to the correct size
        const int16View = new Int16Array(buffer.slice(0, alignedLength));
        pcmAnalysis.sampleCount = int16View.length;
        
        // Calculate statistics for the first X samples (max 1000)
        const samplesToAnalyze = Math.min(int16View.length, 1000);
        let sum = 0;
        let sumSquares = 0;
        
        for (let i = 0; i < samplesToAnalyze; i++) {
          const sample = int16View[i];
          pcmAnalysis.min = Math.min(pcmAnalysis.min, sample);
          pcmAnalysis.max = Math.max(pcmAnalysis.max, sample);
          sum += Math.abs(sample);
          sumSquares += sample * sample;
          if (sample === 0) pcmAnalysis.zeroCount++;
        }
        
        pcmAnalysis.avg = sum / samplesToAnalyze;
        pcmAnalysis.rms = Math.sqrt(sumSquares / samplesToAnalyze);
      } else {
        // Not possible to analyze as PCM
        pcmAnalysis.min = 0;
        pcmAnalysis.max = 0;
      }
      
      // Check if the audio appears to be silence
      const isSilence = pcmAnalysis.rms < 10; // A very low threshold indicates silence
      
      // Check if the buffer format matches what Deepgram expects
      const formatDescription = isWav ? "WAV" : isWebM ? "WebM" : "PCM brute";
      const hasCorrectFormat = !isWav && !isWebM; // Deepgram expects PCM brute
      
      // Return detailed analysis
      return {
        valid: hasCorrectFormat && !isSilence && buffer.byteLength % 2 === 0,
        details: {
          format: formatDescription,
          byteLength: buffer.byteLength,
          byteIsEven: buffer.byteLength % 2 === 0,
          headerBytes: Array.from(uint8View.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '),
          pcmAnalysis,
          isSilence,
          isFormatCorrect: hasCorrectFormat
        }
      };
    } catch (error) {
      return {
        valid: false,
        details: {
          reason: "Error analyzing buffer",
          error: String(error)
        }
      };
    }
  }

  async testAudioQuality(): Promise<{ valid: boolean, reason?: string }> {
    try {
      const activeConn = this.getConnection();
      if (!activeConn || activeConn.getReadyState() !== 1) {
        return { valid: false, reason: "No active connection to Deepgram" };
      }
      
      // Create an audio context to get the native sample rate of the system
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      
      // Create a test buffer with synthetic audio data (test tone)
      const duration = 0.5; // 500ms
      const sampleCount = Math.floor(sampleRate * duration);
      
      // Log for debug of the sample rate used
      console.log(`🎵 Generating test signal with native sample rate: ${sampleRate}Hz`);
      
      // Create a buffer for PCM 16-bit, 2 channels (4 bytes per sample)
      const buffer = new ArrayBuffer(sampleCount * 4);
      const view = new DataView(buffer);
      
      // Generate different tones for each channel
      // Channel 0: 440Hz (A4), Channel 1: 880Hz (A5)
      const freq1 = 440;
      const freq2 = 880;
      
      for (let i = 0; i < sampleCount; i++) {
        // Time in seconds
        const t = i / sampleRate;
        
        // Calculate amplitude for each channel (-0.5 to 0.5 to avoid distortion)
        const amplitude1 = 0.3 * Math.sin(2 * Math.PI * freq1 * t);
        const amplitude2 = 0.3 * Math.sin(2 * Math.PI * freq2 * t);
        
        // Convert to int16 (-32768 to 32767)
        const sample1 = Math.floor(amplitude1 * 32767);
        const sample2 = Math.floor(amplitude2 * 32767);
        
        // Write interlaced samples for both channels (PCM stereo format)
        view.setInt16(i * 4, sample1, true);     // left channel (0)
        view.setInt16(i * 4 + 2, sample2, true); // right channel (1)
      }
      
      // Close the audio context to avoid leaving resources open
      audioContext.close();
      
      console.log("🔊 Sending test signal to Deepgram");
      
      // Send the test buffer
      if (activeConn) {
        activeConn.send(buffer);
        
        // Wait for a short period to see if we receive transcription/error
        return new Promise((resolve) => {
          let responseReceived = false;
          
          // Temporary handler to capture responses
          const handleMessage = (data: any) => {
            responseReceived = true;
            
            // Check if the response contains any specific error
            if (data.error) {
              console.error("❌ Error returned by Deepgram:", data.error);
              resolve({ valid: false, reason: `Error from Deepgram: ${data.error}` });
              return;
            }
            
              // If we receive any response without error, consider it valid
            console.log("✅ Test signal accepted by Deepgram");
            resolve({ valid: true });
          };
          
          // Add and then remove the temporary handler
          activeConn.addListener(LiveTranscriptionEvents.Transcript, handleMessage);
          
          // Set a timeout to resolve if we don't receive a response
          setTimeout(() => {
            // Remove the temporary handler
            activeConn.removeListener(LiveTranscriptionEvents.Transcript, handleMessage);
            
            if (!responseReceived) {
              console.warn("⚠️ Timeout in audio quality check - no response received");
              // Timeout is acceptable, as Deepgram might simply not return anything for audio with no speech
              resolve({ valid: true, reason: "No response, but active connection" });
            }
          }, 3000);
        });
      }
      
      return { valid: false, reason: "Active connection but invalid" };
    } catch (error) {
      console.error("❌ Error testing audio quality:", error);
      return { valid: false, reason: String(error) };
    }
  }
} 