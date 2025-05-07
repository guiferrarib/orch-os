// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// RecorderService.ts
// Implementation of the audio recording service

import { IAudioContextService } from "../interfaces/IAudioContextService";
import { MicrophoneState } from "../interfaces/IMicrophoneContext";
import { IRecorderService } from "../interfaces/IRecorderService";

// Configuration constants for audio recording
const RECORDER_CONFIG = {
  TIMESLICE: 1000,  // milliseconds between audio chunks
  AUDIO_BIT_RATE: 128000,
  MIME_TYPES: [
    "audio/webm",             // WebM - modern format supported and widely compatible
    "audio/webm;codecs=pcm",  // PCM uncompressed - ideal for STT
    "audio/wav",              // WAV - uncompressed format
    "audio/ogg;codecs=opus"   // Ogg Opus - last resort
  ]
};

export class RecorderService implements IRecorderService {
  private audioContextService: IAudioContextService;
  private setMicrophoneState: (state: MicrophoneState) => void;
  private setMicrophone: (recorder: MediaRecorder | null) => void;
  private microphone: MediaRecorder | null = null;
  private activeMimeType: string | null = null;

  constructor(
    audioContextService: IAudioContextService,
    setMicrophoneState: (state: MicrophoneState) => void,
    setMicrophone: (recorder: MediaRecorder | null) => void
  ) {
    this.audioContextService = audioContextService;
    this.setMicrophoneState = setMicrophoneState;
    this.setMicrophone = setMicrophone;
  }

  /**
   * Returns the current recorder, if it exists
   */
  getCurrentRecorder(): MediaRecorder | null {
    return this.microphone;
  }

  /**
   * Creates a new MediaRecorder
   */
  createMediaRecorder(): MediaRecorder | null {
    try {
      // Get the audio destination node
      const destination = this.validateAudioDestination();
      if (!destination) return null;

      // Create the MediaRecorder with the best available format
      const recorder = this.createOptimalRecorder(destination.stream);
      if (!recorder) return null;

      // Configure events and store references
      this.configureRecorderEvents(recorder);
      this.microphone = recorder;
      this.setMicrophone(recorder);
      
      console.log(`✅ MediaRecorder created with format: ${this.activeMimeType}`);
      return recorder;
    } catch (error) {
      console.error("❌ Error creating MediaRecorder:", error);
      return null;
    }
  }

  /**
   * Starts the recording
   */
  startRecording(): void {
    if (!this.microphone) {
      console.log("🎤 [COGNITIVE-RECORDER] Attempting to start recording without a MediaRecorder");
      return;
    }

    if (this.microphone.state === "recording") {
      console.log("ℹ️ [COGNITIVE-RECORDER] Recording already in progress for cognitive input.");
      return;
    }

    try {
      console.log("🎤 [COGNITIVE-RECORDER] Starting audio capture for brain memory...");
      this.microphone.start(RECORDER_CONFIG.TIMESLICE);
    } catch (error) {
      console.log("❌ [COGNITIVE-RECORDER] Error starting audio capture for brain memory:", error);
      this.setMicrophoneState(MicrophoneState.Error);
      this.resetRecorder();
    }
  }

  /**
   * Stops the recording
   */
  stopRecording(): void {
    if (!this.microphone) {
      console.log("ℹ️ No recording in progress to stop");
      return;
    }

    if (this.microphone.state !== "recording") {
      console.log(`ℹ️ Recorder not recording (state: ${this.microphone.state})`);
      return;
    }

    try {
      console.log("🛑 [COGNITIVE-RECORDER] Stopping audio capture for brain memory...");
      this.microphone.stop();
      this.resetRecorder();
    } catch (error) {
      console.log("❌ [COGNITIVE-RECORDER] Error stopping audio capture for brain memory:", error);
      this.setMicrophoneState(MicrophoneState.Error);
      this.resetRecorder();
    }
  }

  /**
   * Configures the MediaRecorder events
   * Public implementation for compatibility with IRecorderService
   */
  configureRecorderEvents(recorder: MediaRecorder): void {
    // Process audio data
    recorder.ondataavailable = this.handleAudioData.bind(this);

    // State change events
    recorder.onstart = () => {
      console.log("🎤 [COGNITIVE-RECORDER] Recording started");
      this.setMicrophoneState(MicrophoneState.Open);
    };

    recorder.onpause = () => {
      console.log("⏸️ Recording paused");
      this.setMicrophoneState(MicrophoneState.Stopped);
    };

    recorder.onresume = () => {
      console.log("▶️ Recording resumed");
      this.setMicrophoneState(MicrophoneState.Open);
    };

    recorder.onstop = () => {
      console.log("⏹️ Recording stopped");
      this.setMicrophoneState(MicrophoneState.Stopped);
    };

    recorder.onerror = (event) => {
      console.error("🎤 [COGNITIVE-RECORDER] Error in MediaRecorder:", event);
      this.setMicrophoneState(MicrophoneState.Error);
    };
  }

  // --- Private Helper Methods ---

  /**
   * Validates and returns the audio destination node
   */
  private validateAudioDestination(): MediaStreamAudioDestinationNode | null {
    const destination = this.audioContextService.getDestination();
    if (!destination) {
      console.error("❌ [COGNITIVE-RECORDER] No audio destination available for recording");
      return null;
    }

    // Check if there are audio tracks
    if (destination.stream.getAudioTracks().length === 0) {
      console.error("❌ [COGNITIVE-RECORDER] No audio tracks available for recording");
      return null;
    }

    return destination;
  }

  /**
   * Creates a MediaRecorder with the best available format
   */
  private createOptimalRecorder(stream: MediaStream): MediaRecorder | null {
    // Try creating the MediaRecorder with the preferred formats
    for (const mimeType of RECORDER_CONFIG.MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        try {
          const options: MediaRecorderOptions = {
            mimeType,
            audioBitsPerSecond: RECORDER_CONFIG.AUDIO_BIT_RATE
          };
          
          console.log(`🎤 [COGNITIVE-RECORDER] Using format: ${mimeType}`);
          const recorder = new MediaRecorder(stream, options);
          this.activeMimeType = mimeType;
          return recorder;
        } catch (err) {
          console.warn(`⚠️ Format ${mimeType} failed:`, err);
        }
      }
    }

    // Final attempt without specifying format
    try {
      console.log("⚠️ Using default browser format");
      const recorder = new MediaRecorder(stream);
      this.activeMimeType = recorder.mimeType;
      return recorder;
    } catch (err) {
      console.error("❌ [COGNITIVE-RECORDER] Unable to create MediaRecorder:", err);
      return null;
    }
  }

  /**
   * Processes the received audio data
   */
  private async handleAudioData(event: BlobEvent): Promise<void> {
    if (event.data.size <= 0) return;

    try {
      // Convert the Blob to ArrayBuffer
      const arrayBuffer = await event.data.arrayBuffer();
      
      // Convert to Uint8Array as expected by the API
      const audioData = new Uint8Array(arrayBuffer);
      
      // Send the audio without additional modifications
      // This allows Deepgram to detect the format automatically
      if (window.electronAPI) {
        window.electronAPI.sendAudioChunk(audioData);
        
        // Occasional log for debugging
        if (Math.random() < 0.05) {
          console.log("🎤 [COGNITIVE-RECORDER] Audio data received for brain memory:", audioData);
        }
      } else {
        console.warn("⚠️ Electron API not available for audio transmission");
      }
    } catch (error) {
      console.error("❌ [COGNITIVE-RECORDER] Error processing audio data:", error);
    }
  }

  /**
   * Resets the recorder after use
   */
  private resetRecorder(): void {
    // Use setTimeout to ensure pending operations complete
    setTimeout(() => {
      this.microphone = null;
      this.setMicrophone(null);
      this.activeMimeType = null;
    }, 100);
  }
} 