// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// MicrophoneContextProvider.tsx
// Microphone context provider

import React, { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { getPrimaryUser } from '../../../config/UserConfig';
import {
  ChannelAnalysis,
  IMicrophoneContext,
  MicrophoneState,
  SelectedDevices,
  SpeakerMapping
} from '../interfaces/IMicrophoneContext';
import { AudioContextService } from './AudioContextService';
import { AudioDeviceService } from './AudioDeviceService';
import { RecorderService } from './RecorderService';

// Microphone context
export const MicrophoneContext = createContext<IMicrophoneContext | null>(null);

// Hook for usage in consumer components
export function useMicrophone() {
  const context = useContext(MicrophoneContext);
  if (!context) {
    throw new Error('useMicrophone must be used within a MicrophoneProvider');
  }
  return context;
}

// Tipo para o estado do microfone
type MicrophoneStateType = {
  microphone: MediaRecorder | null;
  microphoneState: MicrophoneState;
  audioDevices: MediaDeviceInfo[];
  selectedDevices: SelectedDevices;
  isMicrophoneOn: boolean;
  isSystemAudioOn: boolean;
  speakerMappings: SpeakerMapping;
}

// Tipo para ações do reducer
type MicrophoneAction = 
  | { type: 'SET_STATE'; payload: MicrophoneState }
  | { type: 'SET_MICROPHONE'; payload: MediaRecorder | null }
  | { type: 'SET_AUDIO_DEVICES'; payload: MediaDeviceInfo[] }
  | { type: 'SET_SELECTED_DEVICES'; payload: Partial<SelectedDevices> }
  | { type: 'SET_MICROPHONE_ON'; payload: boolean }
  | { type: 'SET_SYSTEM_AUDIO_ON'; payload: boolean }
  | { type: 'UPDATE_SPEAKER_MAPPING'; payload: SpeakerMapping }
  | { type: 'RESET_STATE' };

// Estado inicial
const initialState: MicrophoneStateType = {
  microphone: null,
  microphoneState: MicrophoneState.NotSetup,
  audioDevices: [],
  selectedDevices: { microphone: null, systemAudio: null },
  isMicrophoneOn: false,
  isSystemAudioOn: false,
  speakerMappings: {}
};

// Reducer to manage state
function microphoneReducer(state: MicrophoneStateType, action: MicrophoneAction): MicrophoneStateType {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, microphoneState: action.payload };
    case 'SET_MICROPHONE':
      return { ...state, microphone: action.payload };
    case 'SET_AUDIO_DEVICES':
      return { ...state, audioDevices: action.payload };
    case 'SET_SELECTED_DEVICES':
      return { 
        ...state, 
        selectedDevices: { ...state.selectedDevices, ...action.payload } 
      };
    case 'SET_MICROPHONE_ON':
      return { ...state, isMicrophoneOn: action.payload };
    case 'SET_SYSTEM_AUDIO_ON':
      return { ...state, isSystemAudioOn: action.payload };
    case 'UPDATE_SPEAKER_MAPPING':
      return { ...state, speakerMappings: { ...state.speakerMappings, ...action.payload } };
    case 'RESET_STATE':
      return { 
        ...initialState,
        audioDevices: state.audioDevices
      };
    default:
      return state;
  }
}

// Microphone context provider
export default function MicrophoneProvider({ children }: { children: React.ReactNode }) {
  // State management using reducer
  const [state, dispatch] = useReducer(microphoneReducer, initialState);
  
  // Reference to the current state (for use in async callbacks)
  const stateRef = useRef<MicrophoneState>(MicrophoneState.NotSetup);
  
  // Services
  const services = useRef({
    audioContext: new AudioContextService(),
    audioDevice: null as AudioDeviceService | null,
    recorder: null as RecorderService | null
  });
  
  // Update state reference when state changes
  useEffect(() => {
    stateRef.current = state.microphoneState;
  }, [state.microphoneState]);
  
  // Initialize services and configure event listeners
  useEffect(() => {
    // Initialize services
    const initializeServices = () => {
      // Initialize AudioDeviceService
      services.current.audioDevice = new AudioDeviceService(services.current.audioContext);
      
      // Initialize RecorderService
      services.current.recorder = new RecorderService(
        services.current.audioContext,
        (newState) => dispatch({ type: 'SET_STATE', payload: newState }),
        (recorder) => dispatch({ type: 'SET_MICROPHONE', payload: recorder })
      );
    };
    
    // Initialize services
    initializeServices();
    
    // Enumerate audio devices
    enumerateAudioDevices();
    
    // Configure event listener for device changes
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChangeEvent);
    
    // Handler for cleaning up resources before closing/reloading the page
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("🔄 Page being closed or reloaded, shutting down audio system...");
      
      // Force audio system shutdown
      const { audioContext, audioDevice, recorder } = services.current;
      
      try {
        // Stop recording
        if (recorder) {
          recorder.stopRecording();
        }
        
        // Disconnect all sources
        if (audioDevice) {
          const sources = audioDevice.getSources();
          Object.keys(sources).forEach(deviceId => {
            audioDevice.disconnectDevice(deviceId);
          });
        }
        
        // Disconnect merger sources
        if (audioContext) {
          audioContext.disconnectMicrophoneSource();
          audioContext.disconnectSystemAudioSource();
          
          // Try to close the audio context synchronously
          try {
            audioContext.getAudioContext()?.close();
          } catch (error) {
            console.error("❌ Error closing AudioContext during unload:", error);
          }
        }
      } catch (error) {
        console.error("❌ Error cleaning up audio resources during unload:", error);
      }
      
      // Prevent system from keeping open resources
      return null;
    };
    
    // Add handler for beforeunload event
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check and turn off audio system if already running in the background
    const checkExistingAudioSystem = () => {
      const { audioContext } = services.current;
      if (audioContext && audioContext.getAudioContext()?.state === 'running') {
        console.warn("⚠️ Audio system already running, resetting to prevent resource leaks");
        resetAudioSystem(false);
      }
    };
    
    // Check existing audio system on startup
    checkExistingAudioSystem();
    
    // Cleanup on unmount
    return () => {
      stopMicrophone(true);
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChangeEvent);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      resetAudioSystem(false);
    };
  }, []);
  
  // Handle device change events
  const handleDeviceChangeEvent = useCallback(() => {
    console.log("🔄 Device change detected, re-enumerating devices");
    enumerateAudioDevices();
  }, []);
  
  // Enumerate audio devices
  const enumerateAudioDevices = async () => {
    try {
      const { audioDevice } = services.current;
      if (!audioDevice) return;
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputDevices.length > 0) {
        console.log(`🎙️ Found ${audioInputDevices.length} audio input devices`);
        
        // Map speakers to devices
        const speakerMap: SpeakerMapping = {};
        
        audioInputDevices.forEach((device) => {
          const speakerName = audioDevice.getSpeakerNameForDevice(device);
          if (speakerName) {
            speakerMap[device.deviceId] = speakerName;
          }
        });
        
        // Update device list and speaker mapping
        dispatch({ type: 'SET_AUDIO_DEVICES', payload: audioInputDevices });
        dispatch({ type: 'UPDATE_SPEAKER_MAPPING', payload: speakerMap });
        
        // Update device service
        audioDevice.setAudioDevices(audioInputDevices);
        
        // Automatically select the first available microphone and system audio device if none are selected
        const { systemAudioDevices, microphoneDevices } = audioDevice.filterDevicesForUI();
        
        if (!state.selectedDevices.microphone && microphoneDevices.length > 0) {
          console.log(`🎤 Automatically selecting the first available microphone: ${microphoneDevices[0].label}`);
          dispatch({ 
            type: 'SET_SELECTED_DEVICES', 
            payload: { microphone: microphoneDevices[0].deviceId } 
          });
        }
        
        if (!state.selectedDevices.systemAudio && systemAudioDevices.length > 0) {
          console.log(`🔊 Automatically selecting the first available system audio device: ${systemAudioDevices[0].label}`);
          dispatch({ 
            type: 'SET_SELECTED_DEVICES', 
            payload: { systemAudio: systemAudioDevices[0].deviceId } 
          });
        }
      } else {
        console.warn("⚠️ No audio input devices found!");
      }
    } catch (error) {
      console.error("❌ Error enumerating audio devices:", error);
    }
  };
  
  // Disconnect a specific audio source
  const disconnectSource = useCallback((deviceId: string) => {
    const { audioDevice } = services.current;
    if (!audioDevice) return;
    
    audioDevice.disconnectDevice(deviceId);
  }, []);
  
  // Handle device change
  const handleDeviceChange = useCallback(async (deviceId: string, isSystemAudio: boolean) => {
    const { audioDevice, audioContext } = services.current;
    if (!audioDevice) return;
    
    // Determine device type
    const deviceType = isSystemAudio ? 'systemAudio' : 'microphone';
    
    // Check if the device is already selected
    const currentDevice = state.selectedDevices[deviceType];
    if (currentDevice === deviceId) return;
    
    // Disconnect the current device if it exists
    if (currentDevice) {
      disconnectSource(currentDevice);
    }
    
    // Update selected device
    dispatch({ 
      type: 'SET_SELECTED_DEVICES', 
      payload: { [deviceType]: deviceId } 
    });
    
    // Check if this type of device is active
    const isActive = isSystemAudio ? state.isSystemAudioOn : state.isMicrophoneOn;
    
    // If the device type is active, connect the new device
    if (isActive) {
      // Ensure the AudioContext is configured
      audioContext.setupAudioContext();
      
      // Connect the new device
      const connected = await audioDevice.connectDevice(deviceId);
      
      if (!connected) {
        console.error(`❌ Failed to connect ${isSystemAudio ? 'system audio' : 'microphone'}: ${deviceId}`);
        
        // Reset selection on failure
        dispatch({ 
          type: 'SET_SELECTED_DEVICES', 
          payload: { [deviceType]: null } 
        });
      }
    }
  }, [state.selectedDevices, state.isMicrophoneOn, state.isSystemAudioOn, disconnectSource]);
  
  // Configure microphone
  const setupMicrophone = async () => {
    console.log("🔄 Configuring microphone...");
    
    try {
      const { audioContext, recorder } = services.current;
      if (!recorder) return false;
      
      // Update state
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.SettingUp });
      stateRef.current = MicrophoneState.SettingUp;
      
      // Configure AudioContext
      audioContext.setupAudioContext();
      
      // Reset recorder
      dispatch({ type: 'SET_MICROPHONE', payload: null });
      
      // Create new MediaRecorder
      const newRecorder = recorder.createMediaRecorder();
      if (!newRecorder) {
        throw new Error("Failed to create MediaRecorder");
      }
      
      console.log("✅ Microphone configuration completed");
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Ready });
      stateRef.current = MicrophoneState.Ready;
      
      return true;
    } catch (error) {
      console.error("❌ Error configuring microphone:", error);
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Error });
      stateRef.current = MicrophoneState.Error;
      
      return false;
    }
  };
  
  // Helper function to connect active devices
  const connectActiveDevices = async () => {
    const { audioContext, audioDevice } = services.current;
    if (!audioContext || !audioDevice) return;
    
    // Connect microphone if active
    if (state.isMicrophoneOn) {
      if (state.selectedDevices.microphone) {
        // First, connect the device to obtain the audio source
        const connected = await audioDevice.connectDevice(state.selectedDevices.microphone);
        if (!connected) {
          console.warn(`⚠️ Failed to connect microphone ${state.selectedDevices.microphone}`);
        } else {
          // Now, connect the source to the correct channel in the merger
          const sources = audioDevice.getSources();
          const source = sources[state.selectedDevices.microphone];
          if (source) {
            audioContext.connectMicrophoneSource(source.source);
            console.log("✅ Microphone source connected to merger");
          }
        }
      } else {
        // Create silent source for the microphone channel
        const silentDeviceId = audioDevice.createSilentSource(0, getPrimaryUser());
        if (silentDeviceId) {
          console.log("🔇 Created silent source for channel 0 (microphone)");
          // Connect silent source to the microphone channel
          const sources = audioDevice.getSources();
          const source = sources[silentDeviceId];
          if (source) {
            audioContext.connectMicrophoneSource(source.source);
          }
        }
      }
    } else {
      // If microphone is disabled, ensure it is disconnected
      audioContext.disconnectMicrophoneSource();
    }
    
    // Connect system audio if active
    if (state.isSystemAudioOn) {
      if (state.selectedDevices.systemAudio) {
        // First, connect the device to obtain the audio source
        const connected = await audioDevice.connectDevice(state.selectedDevices.systemAudio);
        if (!connected) {
          console.warn(`⚠️ Failed to connect system audio ${state.selectedDevices.systemAudio}`);
        } else {
          // Now, connect the source to the correct channel in the merger
          const sources = audioDevice.getSources();
          const source = sources[state.selectedDevices.systemAudio];
          if (source) {
            audioContext.connectSystemAudioSource(source.source);
            console.log("✅ System audio source connected to merger");
          }
        }
      } else {
        // Create silent source for the system audio channel
        const silentDeviceId = audioDevice.createSilentSource(1, "");
        if (silentDeviceId) {
          console.log("🔇 Created silent source for channel 1 (system audio)");
          // Connect silent source to the system audio channel
          const sources = audioDevice.getSources();
          const source = sources[silentDeviceId];
          if (source) {
            audioContext.connectSystemAudioSource(source.source);
          }
        }
      }
    } else {
      // If system audio is disabled, ensure it is disconnected
      audioContext.disconnectSystemAudioSource();
    }
  };
  
  // Start recording
  const startMicrophone = useCallback(async () => {
    console.log("🎙️ Starting microphone...");
    
    try {
      const { audioContext, recorder } = services.current;
      if (!audioContext || !recorder) {
        throw new Error("Services not initialized");
      }
      
      // If not configured, configure first
      if (stateRef.current === MicrophoneState.NotSetup) {
        await setupMicrophone();
      }
      
      // Update state
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Opening });
      stateRef.current = MicrophoneState.Opening;
      
      // Configure AudioContext
      audioContext.setupAudioContext();
      
      // Connect active devices
      await connectActiveDevices();
      
      // Check if we have a recorder
      let currentRecorder = recorder.getCurrentRecorder();
      if (!currentRecorder) {
        currentRecorder = recorder.createMediaRecorder();
        if (!currentRecorder) {
          throw new Error("Failed to create MediaRecorder");
        }
      }
      
      // Start recording
      recorder.startRecording();
      
      console.log("✅ Microphone started successfully");
    } catch (error) {
      console.error("❌ Error starting microphone:", error);
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Error });
      stateRef.current = MicrophoneState.Error;
    }
  }, []);
  
  // Stop recording
  const stopMicrophone = useCallback(async (forceReset: boolean = false) => {
    console.log("🛑 Stopping microphone...");
    
    try {
      const { recorder } = services.current;
      if (!recorder) return;
      
      // Update state
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Stopping });
      stateRef.current = MicrophoneState.Stopping;
      
      // Stop recording
      recorder.stopRecording();
      
      // Reset if necessary
      if (forceReset) {
        resetAudioSystem(false);
      }
      
      console.log("✅ Microphone stopped successfully");
    } catch (error) {
      console.error("❌ Error stopping microphone:", error);
      dispatch({ type: 'SET_STATE', payload: MicrophoneState.Error });
      stateRef.current = MicrophoneState.Error;
    }
  }, []);
  
  // Reset the entire audio system
  const resetAudioSystem = async (autoRestart: boolean = false) => {
    console.log("🧹 Resetting audio system...");
    
    try {
      const { audioContext, audioDevice, recorder } = services.current;
      if (!audioContext || !audioDevice) return;
      
      // Stop recording
      if (recorder) {
        recorder.stopRecording();
      }
      
      // Clear sources
      const sources = audioDevice.getSources();
      Object.keys(sources).forEach(deviceId => {
        audioDevice.disconnectDevice(deviceId);
      });
      
      // Close AudioContext
      await audioContext.closeAudioContext();
      
      // Reset state
      dispatch({ type: 'RESET_STATE' });
      stateRef.current = MicrophoneState.NotSetup;
      
      console.log("✅ Audio system reset successfully");  
      
      // Restart if necessary
      if (autoRestart) {
        setTimeout(() => setupMicrophone(), 500);
      }
    } catch (error) {
      console.error("❌ Error resetting audio system:", error);
    }
  };
  
  // Get current microphone state
  const getCurrentMicrophoneState = useCallback(() => {
    return stateRef.current;
  }, []);
  
  // Generate test WAV file for analysis
  const generateTestWAV = async (): Promise<ChannelAnalysis | null> => {
    const { audioContext } = services.current;
    if (!audioContext) return null;
    
    const context = audioContext.getAudioContext();
    if (!context) return null;
    
    // Use the native sample rate of the context
    const sampleRate = context.sampleRate;
    const duration = 0.5; // 500ms
    const samples = Math.floor(sampleRate * duration);
    
    const buffer = context.createBuffer(2, samples, sampleRate);
    
    // Generate different tones in each channel
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      const frequency = channel === 0 ? 440 : 880; // A4 for channel 0, A5 for channel 1
      
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        channelData[i] = 0.5 * Math.sin(2 * Math.PI * frequency * t);
      }
    }
    
    // Analyze the generated buffer
    const analysis: ChannelAnalysis = {
      channelCount: 2,
      totalSamples: samples,
      sampleRate: sampleRate,
      durationSeconds: duration,
      channels: [
        { avgVolume: 0.5, peakVolume: 0.5, hasAudio: true },
        { avgVolume: 0.5, peakVolume: 0.5, hasAudio: true }
      ]
    };
    
    return analysis;
  };
  
  // Functions adapted to match the expected signatures of the IMicrophoneContext interface
  
  // Define microphone state - adapted for SetStateAction
  const setIsMicrophoneOn: Dispatch<SetStateAction<boolean>> = useCallback((value) => {
    const prevValue = state.isMicrophoneOn;
    const newValue = typeof value === 'function' ? value(prevValue) : value;
    
    // If no change, do nothing
    if (prevValue === newValue) return;
    
    console.log(`🎙️ Microphone state changed: ${prevValue} -> ${newValue}`);
    
    // Update state
    dispatch({ type: 'SET_MICROPHONE_ON', payload: newValue });
    
    // Use try/catch to facilitate diagnosis
    try {
      const { audioContext, audioDevice } = services.current;
      if (!audioContext) {
        throw new Error("AudioContext não disponível");
      }
      if (!audioDevice) {
        throw new Error("AudioDevice não disponível");
      }
      
      // If activating the microphone
      if (newValue) {
        console.log("🔵 Activating microphone channel");
        
        // Ensure the AudioContext is configured and active
        audioContext.setupAudioContext();
        
        const status = audioContext.getConnectionStatus();
        console.log(`🔍 Connection status - before activation: Microphone = ${status.microphone}, System = ${status.systemAudio}`);
        
        // Check if we have a microphone device selected
        let microphoneDeviceId = state.selectedDevices.microphone;
        
        // If no device selected, try selecting the first available
        if (!microphoneDeviceId) {
          console.log("🔍 No microphone device selected, trying to select the first available");
          const { microphoneDevices } = audioDevice.filterDevicesForUI();
          
          if (microphoneDevices.length > 0) {
            microphoneDeviceId = microphoneDevices[0].deviceId;
            console.log(`✅ Automatically selected: ${microphoneDevices[0].label}`);
            
            // Update state with the selected device
            dispatch({ 
              type: 'SET_SELECTED_DEVICES', 
              payload: { microphone: microphoneDeviceId } 
            });
          } else {
            console.warn("⚠️ No microphone device available to select");
          }
        }
        
        // Connect the selected microphone device, if available
        if (microphoneDeviceId) {
          console.log(`🔄 Trying to connect microphone: ${microphoneDeviceId}`);
          
          // Using async/await directly (chained promises may lose context)
          (async () => {
            const connected = await audioDevice.connectDevice(microphoneDeviceId!);
            
            console.log(`🔄 Trying to connect microphone ${microphoneDeviceId}: ${connected ? 'Success' : 'Failure'}`);
            
            if (connected) {
              // Get the audio source and connect it to the microphone channel (0)
              const sources = audioDevice.getSources();
              const source = sources[microphoneDeviceId!];
              
              if (source) {
                audioContext.connectMicrophoneSource(source.source);
                console.log("✅ Success: Microphone source connected to merger");
                
                const finalStatus = audioContext.getConnectionStatus();
                console.log(`🔍 Final connection status: Microphone = ${finalStatus.microphone}, System = ${finalStatus.systemAudio}`);
              } else {
                console.error("❌ Error: Microphone source not found after connection");
              }
            }
          })();
        } else {
          console.log("⚠️ No microphone device selected or available, creating silent source");
          
          // Create silent source for the microphone channel
          const silentDeviceId = audioDevice.createSilentSource(0, getPrimaryUser());
          if (silentDeviceId) {
            console.log("🔇 Created silent source for channel 0 (microphone)");
            // Connect silent source to the microphone channel
            const sources = audioDevice.getSources();
            const source = sources[silentDeviceId];
            if (source) {
              audioContext.connectMicrophoneSource(source.source);
              console.log("✅ Silent source connected to microphone channel");
            }
          }
        }
      }
      // If deactivating the microphone
      else {
        console.log("🔴 Deactivating microphone channel");
        
        // Debug of status before disconnection
        const statusBefore = audioContext.getConnectionStatus();
        console.log(`🔍 Status of connections - before disconnection: Microphone = ${statusBefore.microphone}, System = ${statusBefore.systemAudio}`);
        
        // Disconnect the microphone source from the merger - now synchronous
        audioContext.disconnectMicrophoneSource();
        
        // Debug of status after disconnection from the merger
        const statusAfterMerger = audioContext.getConnectionStatus();
        console.log(`🔍 Status after disconnecting from merger: Microphone = ${statusAfterMerger.microphone}, System = ${statusAfterMerger.systemAudio}`);
        
        // If the device is connected, disconnect
        if (state.selectedDevices.microphone) {
          console.log(`🔄 Disconnecting microphone device: ${state.selectedDevices.microphone}`);
          audioDevice.disconnectDevice(state.selectedDevices.microphone);
          console.log("✅ Success: Microphone device disconnected");
        }
        
        // Debug of final status
        const statusAfter = audioContext.getConnectionStatus();
        console.log(`🔍 Final connection status: Microphone = ${statusAfter.microphone}, System = ${statusAfter.systemAudio}`);
      }
    } catch (error) {
      console.error("❌ Error handling microphone:", error);
    }
  }, [state.isMicrophoneOn, state.selectedDevices.microphone]);
  
  // Define audio system state - adapted for SetStateAction
  const setIsSystemAudioOn: Dispatch<SetStateAction<boolean>> = useCallback((value) => {
    const prevValue = state.isSystemAudioOn;
    const newValue = typeof value === 'function' ? value(prevValue) : value;
    
    // If no change, do nothing
    if (prevValue === newValue) return;
    
    console.log(`🔊 Alterando estado do áudio do sistema: ${prevValue} -> ${newValue}`);
    
    // Update state
    dispatch({ type: 'SET_SYSTEM_AUDIO_ON', payload: newValue });
    
    // Uso do try/catch para facilitar diagnóstico
    try {
      const { audioContext, audioDevice } = services.current;
      if (!audioContext) {
        throw new Error("AudioContext não disponível");
      }
      if (!audioDevice) {
        throw new Error("AudioDevice não disponível");
      }
      
      // If activating the system audio
      if (newValue) {
        console.log("🔵 Activating system audio channel");
        
        // Ensure the AudioContext is configured and active
        audioContext.setupAudioContext();
        
        const status = audioContext.getConnectionStatus();
        console.log(`🔍 Status of connections - before activation: Microphone = ${status.microphone}, System = ${status.systemAudio}`);
        
        // Verify if we have a system audio device selected
        let systemAudioDeviceId = state.selectedDevices.systemAudio;
        
        // If no device selected, try selecting the first available
        if (!systemAudioDeviceId) {
          console.log("🔍 No system audio device selected, trying to select the first available");
          const { systemAudioDevices } = audioDevice.filterDevicesForUI();
          
          if (systemAudioDevices.length > 0) {
            systemAudioDeviceId = systemAudioDevices[0].deviceId;
            console.log(`✅ Automatically selected: ${systemAudioDevices[0].label}`);
            
            // Update state with the selected device
            dispatch({ 
              type: 'SET_SELECTED_DEVICES', 
              payload: { systemAudio: systemAudioDeviceId } 
            });
          } else {
            console.warn("⚠️ No system audio device available to select");
          }
        }
        
        // Connect the selected system audio device, if available
        if (systemAudioDeviceId) {
          console.log(`🔄 Trying to connect system audio: ${systemAudioDeviceId}`);
          
          // Using async/await directly
          (async () => {
            const connected = await audioDevice.connectDevice(systemAudioDeviceId!);
            
            console.log(`🔄 Trying to connect system audio ${systemAudioDeviceId}: ${connected ? 'Success' : 'Failure'}`);
            
            if (connected) {
              // Get the audio source and connect it to the system audio channel (1)
              const sources = audioDevice.getSources();
              const source = sources[systemAudioDeviceId!];
              
              if (source) {
                audioContext.connectSystemAudioSource(source.source);
                console.log("✅ Success: System audio source connected to merger");
                
                const finalStatus = audioContext.getConnectionStatus();
                console.log(`🔍 Final connection status: Microphone = ${finalStatus.microphone}, System = ${finalStatus.systemAudio}`);
              } else {
                console.error("❌ Error: System audio source not found after connection");
              }
            }
          })();
        } else {
          console.log("⚠️ No system audio device selected or available, creating silent source");
          
          // Create silent source for the system audio channel
          const silentDeviceId = audioDevice.createSilentSource(1, "");
          if (silentDeviceId) {
            console.log("🔇 Created silent source for channel 1 (system)");
            // Connect silent source to the system audio channel
            const sources = audioDevice.getSources();
            const source = sources[silentDeviceId];
            if (source) {
              audioContext.connectSystemAudioSource(source.source);
              console.log("✅ Silent source connected to system audio channel");
            }
          }
        }
      } 
      // If deactivating the system audio
      else {
        console.log("🔴 Deactivating system audio channel");
        
        // Debug of status before disconnection
        const statusBefore = audioContext.getConnectionStatus();
        console.log(`🔍 Status of connections - before disconnection: Microphone = ${statusBefore.microphone}, System = ${statusBefore.systemAudio}`);
        
        // Disconnect the system audio source from the merger - now synchronous
        audioContext.disconnectSystemAudioSource();
        
        // Debug of status after disconnection from the merger
        const statusAfterMerger = audioContext.getConnectionStatus();
        console.log(`🔍 Status after disconnecting from merger: Microphone = ${statusAfterMerger.microphone}, System = ${statusAfterMerger.systemAudio}`);
        
        // If the device is connected, disconnect
        if (state.selectedDevices.systemAudio) {
          console.log(`🔄 Disconnecting system audio device: ${state.selectedDevices.systemAudio}`);
          audioDevice.disconnectDevice(state.selectedDevices.systemAudio);
          console.log("✅ Success: System audio device disconnected");
        }
        
        // Debug of final status
        const statusAfter = audioContext.getConnectionStatus();
        console.log(`🔍 Final connection status: Microphone = ${statusAfter.microphone}, System = ${statusAfter.systemAudio}`);
      }
    } catch (error) {
      console.error("❌ Error handling system audio:", error);
    }
  }, [state.isSystemAudioOn, state.selectedDevices.systemAudio]);
  
  // Define selected devices - adapted for SetStateAction
  const setSelectedDevices: Dispatch<SetStateAction<SelectedDevices>> = useCallback((value) => {
    if (typeof value === 'function') {
      const newDevices = value(state.selectedDevices);
      dispatch({ type: 'SET_SELECTED_DEVICES', payload: newDevices });
    } else {
      dispatch({ type: 'SET_SELECTED_DEVICES', payload: value });
    }
  }, [state.selectedDevices]);
  
  // Context value to be provided
  const contextValue: IMicrophoneContext = {
    microphone: state.microphone,
    startMicrophone,
    stopMicrophone,
    setupMicrophone,
    resetAudioSystem,
    microphoneState: state.microphoneState,
    getCurrentMicrophoneState,
    audioDevices: state.audioDevices,
    selectedDevices: state.selectedDevices,
    setSelectedDevices,
    disconnectSource,
    handleDeviceChange,
    setIsMicrophoneOn,
    setIsSystemAudioOn,
    isMicrophoneOn: state.isMicrophoneOn,
    isSystemAudioOn: state.isSystemAudioOn,
    speakerMappings: state.speakerMappings,
    generateTestWAV
  };
  
  return (
    <MicrophoneContext.Provider value={contextValue}>
      {children}
    </MicrophoneContext.Provider>
  );
} 