// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// AudioContextService.ts
// Implementation of the Web Audio API audio context service

import { IAudioContextService } from "../interfaces/IAudioContextService";

export class AudioContextService implements IAudioContextService {
  private audioContext: AudioContext | null = null;
  private merger: ChannelMergerNode | null = null;
  private destination: MediaStreamAudioDestinationNode | null = null;
  
  // Track audio sources connected to the merger
  private microphoneSource: AudioNode | null = null;
  private systemAudioSource: AudioNode | null = null;
  
  // Nodes for automatic gain control
  private microphoneGain: GainNode | null = null;
  private systemAudioGain: GainNode | null = null;
  private microphoneAnalyser: AnalyserNode | null = null;
  private systemAudioAnalyser: AnalyserNode | null = null;
  private microphoneFilter: BiquadFilterNode | null = null;
  
  // Parameters for automatic gain control
  private readonly MIN_VOLUME_THRESHOLD = 0.01; // Minimum volume level to consider amplification
  private readonly TARGET_VOLUME = 0.3;         // Target volume after amplification
  private readonly DEFAULT_MAX_GAIN = 5.0;      // Maximum gain for common microphones
  private readonly AIRPODS_MAX_GAIN = 12.0;     // Maximum gain for AirPods
  private readonly ANALYSIS_INTERVAL_MS = 100;  // Analysis interval in ms
  
  // Track device type
  private isMicrophoneAirPods = false;
  
  // Analysis timers
  private microphoneAnalysisTimer: NodeJS.Timeout | null = null;
  private systemAudioAnalysisTimer: NodeJS.Timeout | null = null;
  
  private readonly CHANNEL_COUNT = 2;
  private readonly LATENCY_HINT = 'interactive';

  // Access methods - return audio context components
  getAudioContext() {
    return this.audioContext;
  }

  getMerger() {
    return this.merger;
  }

  getDestination() {
    return this.destination;
  }

  // Method to verify the number of channels being processed
  getChannelInfo(): { count: number, mode: ChannelCountMode, interpretation: ChannelInterpretation } | null {
    if (!this.destination) return null;
    
    return {
      count: this.destination.channelCount,
      mode: this.destination.channelCountMode,
      interpretation: this.destination.channelInterpretation
    };
  }

  // Setup the audio context and its components
  setupAudioContext(): void {
    try {
      // Create the audio context if it doesn't exist
      if (!this.audioContext) {
        this.createNewAudioContext();
      } else if (this.audioContext.state === "suspended") {
        this.resumeAudioContext();
      }
    } catch (error) {
      console.error("❌ Error configuring AudioContext:", error);
    }
  }

  // Main method to configure and connect microphone source
  configureAndConnectMicrophoneSource(source: AudioNode, deviceInfo?: MediaDeviceInfo): void {
    if (!this.merger || !this.audioContext) {
      console.error("❌ AudioContext or merger not available to connect microphone");
      return;
    }
    
    try {
      // Disconnect previous source if it exists
      this.disconnectMicrophoneSource();
      
      // Check if the device is AirPods
      this.isMicrophoneAirPods = false;
      if (deviceInfo && deviceInfo.label) {
        this.isMicrophoneAirPods = deviceInfo.label.toLowerCase().includes("airpods");
        console.log(`🎤 Device detected: ${deviceInfo.label} ${this.isMicrophoneAirPods ? '(AirPods)' : ''}`);
      }
      
      // Create processing nodes for analysis and automatic gain control
      this.microphoneAnalyser = this.audioContext.createAnalyser();
      this.microphoneAnalyser.fftSize = 256;
      this.microphoneAnalyser.smoothingTimeConstant = 0.8;
      
      // Create equalization filter to improve voice
      this.microphoneFilter = this.audioContext.createBiquadFilter();
      this.microphoneFilter.type = "peaking";
      this.microphoneFilter.frequency.value = 1500;
      this.microphoneFilter.Q.value = 1;
      this.microphoneFilter.gain.value = 4;
      
      // Create gain node for volume control
      this.microphoneGain = this.audioContext.createGain();
      this.microphoneGain.gain.value = 1.0; // Start with neutral gain
      
      // Connect processing chain: source -> analyzer -> filter -> gain -> merger
      source.connect(this.microphoneAnalyser);
      this.microphoneAnalyser.connect(this.microphoneFilter);
      this.microphoneFilter.connect(this.microphoneGain);
      this.microphoneGain.connect(this.merger, 0, 0);
      
      // Store source
      this.microphoneSource = source;
      
      const deviceType = this.isMicrophoneAirPods ? 'AirPods' : 'default';
      console.log(`🎤 Microphone source (${deviceType}) connected to merger channel 0 with EQ and adaptive gain`);
      
      // Start periodic analysis for gain adjustment
      this.startMicrophoneVolumeAnalysis();
    } catch (error) {
      console.error("❌ Error configuring and connecting microphone source:", error);
    }
  }

  // Connect microphone source to merger (Channel 0)
  connectMicrophoneSource(source: AudioNode, deviceInfo?: MediaDeviceInfo): void {
    this.configureAndConnectMicrophoneSource(source, deviceInfo);
  }
  
  // Disconnect microphone source
  disconnectMicrophoneSource(): void {
    if (!this.merger || !this.microphoneSource) return;
    
    try {
      // Verify if the source is really connected before trying to disconnect
      // using try/catch to capture possible errors
      this.microphoneSource.disconnect(this.microphoneAnalyser || this.merger);
      this.microphoneSource = null;
      
      // Disconnect and clean processing nodes
      if (this.microphoneAnalyser) {
        this.microphoneAnalyser.disconnect();
        this.microphoneAnalyser = null;
      }
      
      if (this.microphoneFilter) {
        this.microphoneFilter.disconnect();
        this.microphoneFilter = null;
      }
      
      if (this.microphoneGain) {
        this.microphoneGain.disconnect();
        this.microphoneGain = null;
      }
      
      // Stop volume analysis
      this.stopMicrophoneVolumeAnalysis();
      
      console.log("🎤 Microphone source disconnected from merger");
    } catch (error) {
      // Verify if the error is about disconnecting a node that is not connected
      if (error instanceof DOMException && 
          error.message.includes("the given destination is not connected")) {
        // Apenas limpar a referência ao nó, já que ele não está conectado
        this.microphoneSource = null;
        console.log("🎤 Microphone source reference cleared (not connected)");
      } else {
        // Reportar outros tipos de erros
        console.error("❌ Error disconnecting microphone source:", error);
      }
    }
  }
  
  // Connect system audio source to merger (Channel 1)
  connectSystemAudioSource(source: AudioNode): void {
    if (!this.merger || !this.audioContext) {
      console.error("❌ AudioContext or merger not available to connect system audio");
      return;
    }
    
    try {
      // Disconnect previous source if it exists
      this.disconnectSystemAudioSource();
      
      // Create processing nodes for analysis and automatic gain control
      this.systemAudioAnalyser = this.audioContext.createAnalyser();
      this.systemAudioAnalyser.fftSize = 256;
      this.systemAudioAnalyser.smoothingTimeConstant = 0.8;
      
      this.systemAudioGain = this.audioContext.createGain();
      this.systemAudioGain.gain.value = 1.0; // Iniciar com ganho neutro
      
      // Connect nodes: source -> analyzer -> gain -> merger
      source.connect(this.systemAudioAnalyser);
      this.systemAudioAnalyser.connect(this.systemAudioGain);
      this.systemAudioGain.connect(this.merger, 0, 1);
      
      // Store source
      this.systemAudioSource = source;
      
      console.log("🔊 System audio source connected to channel 1 of merger with automatic gain control");
      
      // Start periodic analysis for gain adjustment
      this.startSystemAudioVolumeAnalysis();
    } catch (error) {
      console.error("❌ Error connecting system audio source:", error);
    }
  }
  
  // Disconnect system audio source
  disconnectSystemAudioSource(): void {
    if (!this.merger || !this.systemAudioSource) return;
    
    try {
      // Verify if the source is really connected before trying to disconnect
      // using try/catch to capture possible errors
      this.systemAudioSource.disconnect(this.systemAudioAnalyser || this.merger);
      this.systemAudioSource = null;
      
      // Disconnect and clean processing nodes
      if (this.systemAudioAnalyser) {
        this.systemAudioAnalyser.disconnect();
        this.systemAudioAnalyser = null;
      }
      
      if (this.systemAudioGain) {
        this.systemAudioGain.disconnect();
        this.systemAudioGain = null;
      }
      
      // Stop volume analysis
      this.stopSystemAudioVolumeAnalysis();
      
      console.log("🔊 System audio source disconnected from merger");
    } catch (error) {
      // Verify if the error is about disconnecting a node that is not connected
      if (error instanceof DOMException && 
          error.message.includes("the given destination is not connected")) {
        // Just clear the node reference, since it's not connected
        this.systemAudioSource = null;
        console.log("🔊 System audio source reference cleared (not connected)");
      } else {
        // Report other types of errors
        console.error("❌ Error disconnecting system audio source:", error);
      }
    }
  }

  // Reset the audio system, optionally forcing a complete closure
  async resetAudioSystem(forceClose: boolean = false): Promise<void> {
    console.log(`🔄 Resetting audio system (forceClose: ${forceClose})`);
    
    try {
      // Stop volume analyses to avoid pending references
      this.stopMicrophoneVolumeAnalysis();
      this.stopSystemAudioVolumeAnalysis();
      
      // Disconnect all audio sources
      this.disconnectMicrophoneSource();
      this.disconnectSystemAudioSource();
      
      if (forceClose && this.audioContext) {
        console.log("🔒 Closing AudioContext completely for clean restart");
        // Close the audio context completely
        await this.closeAudioContext();
        
        // Small pause to ensure the closure is completed
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Create a new audio context from scratch
        this.createNewAudioContext();
        console.log("✅ Audio system restarted with new AudioContext");
      } else if (this.audioContext) {
        // If the context is reused, ensure it is in a usable state
        if (this.audioContext.state === "suspended") {
          console.log("🔄 Resuming existing AudioContext");
          await this.audioContext.resume();
        }
        
        // Verify if essential nodes exist, recreate if necessary
        if (!this.merger || !this.destination) {
          console.log("🔄 Recreating audio nodes");
          this.setupAudioNodes();
          this.connectAudioNodes();
        }
        
        console.log("✅ Audio system reset");
      } else {
        // No audio context, create a new one
        console.log("🔄 Creating new AudioContext (none existing)");
        this.createNewAudioContext();
        console.log("✅ New audio system initialized");
      }
      
      return;
    } catch (error) {
      console.error("❌ Error resetting audio system:", error);
      
      // In case of a critical error, try to clean everything and start over
      this.resetState();
      
      // Try to create a new context even after error
      try {
        this.createNewAudioContext();
        console.log("⚠️ Audio system re-created after error");
      } catch (secondError) {
        console.error("❌ Critical error re-creating audio system:", secondError);
        throw new Error("Audio system restart failed");
      }
    }
  }

  // Close the audio context and clean resources
  async closeAudioContext(): Promise<void> {
    if (!this.audioContext) return;
    
    try {
      console.log("🔄 Closing AudioContext...");
      
      // Disconnect all sources first
      this.disconnectMicrophoneSource();
      this.disconnectSystemAudioSource();
      
      // Stop volume analyses to avoid pending callbacks
      this.stopMicrophoneVolumeAnalysis();
      this.stopSystemAudioVolumeAnalysis();
      
      // Verify if there are audio nodes and disconnect them explicitly
      if (this.merger && this.destination) {
        try {
          this.merger.disconnect(this.destination);
          console.log("🔌 Audio nodes disconnected explicitly");
        } catch (err) {
          console.warn("⚠️ Could not disconnect audio nodes:", err);
        }
      }
      
      // Close the audio context
      await this.audioContext.close();
      
      // Reset state variables
      this.resetState();
      console.log("✅ AudioContext closed successfully and resources released");
    } catch (error) {
      console.error("❌ Error closing AudioContext:", error);
      // In case of an error, try to reset the state anyway
      throw error;
    }
  }

  // Verify if a microphone source is connected
  isMicrophoneConnected(): boolean {
    return this.microphoneSource !== null;
  }
  
  // Verify if a system audio source is connected
  isSystemAudioConnected(): boolean {
    return this.systemAudioSource !== null;
  }
  
  // Returns the connection status of both channels
  getConnectionStatus(): { microphone: boolean, systemAudio: boolean } {
    return {
      microphone: this.isMicrophoneConnected(),
      systemAudio: this.isSystemAudioConnected()
    };
  }

  // Start microphone volume analysis
  private startMicrophoneVolumeAnalysis(): void {
    if (this.microphoneAnalysisTimer) {
      clearInterval(this.microphoneAnalysisTimer);
    }
    
    this.microphoneAnalysisTimer = setInterval(() => {
      if (!this.microphoneAnalyser || !this.microphoneGain) return;
      
      const volume = this.getVolumeFromAnalyser(this.microphoneAnalyser);
      this.adjustGainForVolume(volume, this.microphoneGain, "microphone", this.isMicrophoneAirPods);
    }, this.ANALYSIS_INTERVAL_MS);
  }
  
  // Stop microphone volume analysis
  private stopMicrophoneVolumeAnalysis(): void {
    if (this.microphoneAnalysisTimer) {
      clearInterval(this.microphoneAnalysisTimer);
      this.microphoneAnalysisTimer = null;
    }
  }
  
  // Start system audio volume analysis
  private startSystemAudioVolumeAnalysis(): void {
    if (this.systemAudioAnalysisTimer) {
      clearInterval(this.systemAudioAnalysisTimer);
    }
    
    this.systemAudioAnalysisTimer = setInterval(() => {
      if (!this.systemAudioAnalyser || !this.systemAudioGain) return;
      
      const volume = this.getVolumeFromAnalyser(this.systemAudioAnalyser);
      this.adjustGainForVolume(volume, this.systemAudioGain, "system", false);
    }, this.ANALYSIS_INTERVAL_MS);
  }
  
  // Stop system audio volume analysis
  private stopSystemAudioVolumeAnalysis(): void {
    if (this.systemAudioAnalysisTimer) {
      clearInterval(this.systemAudioAnalysisTimer);
      this.systemAudioAnalysisTimer = null;
    }
  }
  
  // Get the current volume from the analyzer
  private getVolumeFromAnalyser(analyser: AnalyserNode): number {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    
    // Calculate RMS (Root Mean Square) - standard metric for audio volume
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // Converter de [0, 255] para [-1, 1]
      const normalized = (dataArray[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    
    const rms = Math.sqrt(sumSquares / dataArray.length);
    return rms;
  }
  
  // Adjust gain based on volume
  private adjustGainForVolume(
    volume: number, 
    gainNode: GainNode, 
    sourceType: string, 
    isAirPods: boolean = false
  ): void {
    // Set maximum gain based on device type
    const maxGain = isAirPods ? this.AIRPODS_MAX_GAIN : this.DEFAULT_MAX_GAIN;
    const deviceTypeStr = isAirPods ? "AirPods" : "default";
    
    // Verify if the volume is below the minimum threshold
    if (volume < this.MIN_VOLUME_THRESHOLD && volume > 0.001) {
      // Calculate the gain needed to reach the target volume, but limit to maximum
      const requiredGain = Math.min(this.TARGET_VOLUME / volume, maxGain);
      
      // Adjust gain gradually to avoid clicks
      const currentGain = gainNode.gain.value;
      const newGain = currentGain * 0.8 + requiredGain * 0.2; // Blend suave
      
      gainNode.gain.setValueAtTime(newGain, this.audioContext?.currentTime || 0);
      
      // Log ocasional for diagnosis (1 in every 10 adjustments)
      if (Math.random() < 0.1) {
        console.log(`🔊 Adjusting ${sourceType} (${deviceTypeStr}): volume=${volume.toFixed(3)}, gain=${newGain.toFixed(2)}x, max=${maxGain}x`);
      }
    } else if (volume >= this.MIN_VOLUME_THRESHOLD || volume <= 0.001) {
      // If the volume is above the threshold or effectively silent, gradually return to normal gain
      const currentGain = gainNode.gain.value;
      
      // If we are significantly above the normal gain, gradually reduce
      if (currentGain > 1.2) {
        const newGain = currentGain * 0.95 + 1.0 * 0.05; // Gradually return to gain 1.0
        gainNode.gain.setValueAtTime(newGain, this.audioContext?.currentTime || 0);
        
        // Log ocasional
        if (Math.random() < 0.1) {
          console.log(`🔊 Normalizing gain of ${sourceType} (${deviceTypeStr}): ${newGain.toFixed(2)}x, volume=${volume.toFixed(3)}`);
        }
      }
    }
  }

  // Private methods for better organization
  
  private createNewAudioContext(): void {
    console.log("🔊 Creating new AudioContext");
    
    try {
      // Create the context with ideal parameters for speech processing
      this.audioContext = new AudioContext({
        latencyHint: this.LATENCY_HINT
      });
      
      // Verify if the context started correctly
      this.ensureRunningState();
      
      // Configure the audio processing components
      this.setupAudioNodes();
      
      // Connect the audio nodes
      this.connectAudioNodes();
      
      // Log of complete configuration
      this.logAudioSetup();
    } catch (error) {
      console.error("❌ Error creating AudioContext:", error);
      this.resetState();
      throw new Error("Could not create audio context");
    }
  }
  
  private ensureRunningState(): void {
    if (!this.audioContext) return;
    
    if (this.audioContext.state !== "running") {
      console.log(`⚠️ AudioContext in state ${this.audioContext.state}, trying to resume...`);
      
      this.audioContext.resume()
        .then(() => {
          if (this.audioContext) {
            console.log(`✅ AudioContext now: ${this.audioContext.state}`);
          }
        })
        .catch(error => {
          console.error("❌ Error resuming AudioContext:", error);
        });
    }
  }
  
  private resumeAudioContext(): void {
    if (!this.audioContext) return;
    
    console.log("🔄 Resuming suspended AudioContext");
    
    this.audioContext.resume()
      .catch(error => {
        console.error("❌ Error resuming AudioContext suspenso:", error);
      });
  }
  
  private setupAudioNodes(): void {
    if (!this.audioContext) return;
    
    // Configure the merger to combine audio channels
    console.log("🔀 Creating ChannelMerger");
    this.merger = this.audioContext.createChannelMerger(this.CHANNEL_COUNT);
    this.merger.channelInterpretation = 'discrete';
    this.merger.channelCountMode = 'explicit';
    
    // Configure the destination to receive processed audio
    console.log("🎯 Configurando MediaStreamAudioDestinationNode");
    this.destination = this.audioContext.createMediaStreamDestination();
    this.destination.channelCount = this.CHANNEL_COUNT;
    this.destination.channelCountMode = 'explicit';
    this.destination.channelInterpretation = 'discrete';
  }
  
  private connectAudioNodes(): void {
    if (!this.merger || !this.destination) {
      console.error("❌ Audio nodes not available for connection");
      return;
    }
    
    try {
      this.merger.connect(this.destination);
      console.log("🔌 ChannelMerger connected to MediaStreamAudioDestinationNode");
    } catch (error) {
      console.error("❌ Error connecting audio nodes:", error);
    }
  }
  
  private logAudioSetup(): void {
    if (!this.audioContext || !this.destination) return;
    
    console.log(`🎛️ Native sample rate: ${this.audioContext.sampleRate}Hz`);
    console.log(`🎚️ Number of channels: ${this.destination.channelCount}`);
    
    if (this.destination.stream) {
      console.log(`🔍 Destination stream has ${this.destination.stream.getAudioTracks().length} audio tracks`);
    }
  }
  
  private resetState(): void {
    // Stop volume analyses
    this.stopMicrophoneVolumeAnalysis();
    this.stopSystemAudioVolumeAnalysis();
    
    this.microphoneSource = null;
    this.systemAudioSource = null;
    this.microphoneGain = null;
    this.systemAudioGain = null;
    this.microphoneAnalyser = null;
    this.systemAudioAnalyser = null;
    this.microphoneFilter = null;
    this.audioContext = null;
    this.merger = null; 
    this.destination = null;
    this.isMicrophoneAirPods = false;
  }
} 