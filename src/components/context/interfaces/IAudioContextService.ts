// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IAudioContextService.ts
// Interface for managing the Web Audio API audio context

export interface IAudioContextService {
  getAudioContext: () => AudioContext | null;
  setupAudioContext: () => void;
  closeAudioContext: () => Promise<void>;
  getMerger: () => ChannelMergerNode | null;
  getDestination: () => MediaStreamAudioDestinationNode | null;
  getChannelInfo: () => { 
    count: number, 
    mode: ChannelCountMode, 
    interpretation: ChannelInterpretation 
  } | null;
  connectMicrophoneSource: (source: AudioNode) => void;
  disconnectMicrophoneSource: () => void;
  connectSystemAudioSource: (source: AudioNode) => void;
  disconnectSystemAudioSource: () => void;
  isMicrophoneConnected: () => boolean;
  isSystemAudioConnected: () => boolean;
  getConnectionStatus: () => { microphone: boolean, systemAudio: boolean };
} 