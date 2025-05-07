// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IMicrophoneContext.ts
// Interface for the microphone context

// Enums for microphone states and events
export enum MicrophoneEvents {
  DataAvailable = "dataavailable",
  Error = "error",
  Pause = "pause",
  Resume = "resume",
  Start = "start",
  Stop = "stop",
}

export enum MicrophoneState {
  NotSetup = -1,
  SettingUp = 0,
  Ready = 1,
  Opening = 2,
  Open = 3,
  Error = 4,
  Stopping = 5,
  Stopped = 6,
  Resuming = 7
}

// Basic types
export type SelectedDevices = {
  microphone: string | null;
  systemAudio: string | null;
};

export type SpeakerMapping = {
  [deviceId: string]: string;
};

// Interface for channel analysis
export interface ChannelAnalysis {
  channelCount: number;
  totalSamples: number;
  sampleRate: number;
  durationSeconds?: number;
  channels: {
    avgVolume: number;
    rmsVolume?: number;
    peakVolume: number;
    hasAudio: boolean;
    sampleValues?: number[];
  }[];
  error?: string;
}

// Interface for the microphone context that will be exposed to components
export interface IMicrophoneContext {
  microphone: MediaRecorder | null;
  startMicrophone: () => void;
  stopMicrophone: (forceReset?: boolean) => void;
  setupMicrophone: (deviceIds?: string[]) => Promise<boolean>;
  resetAudioSystem: (autoRestart?: boolean) => Promise<void>;
  microphoneState: MicrophoneState;
  getCurrentMicrophoneState: () => MicrophoneState;
  audioDevices: MediaDeviceInfo[];
  selectedDevices: SelectedDevices;
  setSelectedDevices: React.Dispatch<React.SetStateAction<SelectedDevices>>;
  disconnectSource: (deviceId: string) => void;
  handleDeviceChange: (deviceId: string, isSystemAudio: boolean) => void;
  setIsMicrophoneOn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSystemAudioOn: React.Dispatch<React.SetStateAction<boolean>>;
  isMicrophoneOn: boolean;
  isSystemAudioOn: boolean;
  speakerMappings: SpeakerMapping;
  generateTestWAV: () => Promise<ChannelAnalysis | null>;
} 