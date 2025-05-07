// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IAudioDeviceService.ts
// Interface for managing audio devices and their connections


// Interface for audio source
export interface AudioSource {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  speakerName: string;
  isSystemAudio?: boolean;
  oscillator?: OscillatorNode;
}

export interface IAudioDeviceService {
  getAudioDevices: () => MediaDeviceInfo[];
  setAudioDevices: (devices: MediaDeviceInfo[]) => void;
  getSources: () => Record<string, AudioSource>;
  connectDevice: (deviceId: string | null) => Promise<boolean>;
  disconnectDevice: (deviceId: string) => void;
  getSpeakerNameForDevice: (device: MediaDeviceInfo) => string;
  createSilentSource: (channelIndex: number, speakerName: string) => string | null;
  isSystemAudioDevice: (device: MediaDeviceInfo) => boolean;
  filterDevicesForUI: () => { 
    microphoneDevices: MediaDeviceInfo[],
    systemAudioDevices: MediaDeviceInfo[]
  };
} 