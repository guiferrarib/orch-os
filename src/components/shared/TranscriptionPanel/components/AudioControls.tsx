// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { AudioControlsProps } from '../types/interfaces';
import ToggleSwitch from './ToggleSwitch';
import DeviceSelector from './DeviceSelector';

const AudioControls: React.FC<AudioControlsProps> = ({
  isMicrophoneOn,
  setIsMicrophoneOn,
  isSystemAudioOn,
  setIsSystemAudioOn,
  audioDevices,
  selectedDevices,
  handleDeviceChange
}) => {
  return (
    <div className="space-y-3">
      <ToggleSwitch
        label="Microphone"
        isOn={isMicrophoneOn}
        onChange={() => setIsMicrophoneOn(!isMicrophoneOn)}
        title="Toggle microphone"
      />

      {isMicrophoneOn && (
        <DeviceSelector
          devices={audioDevices}
          selectedId={selectedDevices.microphone ?? ""}
          onChange={(deviceId) => handleDeviceChange(deviceId, false)}
          title="Select microphone"
          isSystemAudio={false}
        />
      )}

      <ToggleSwitch
        label="System Audio"
        isOn={isSystemAudioOn}
        onChange={() => setIsSystemAudioOn(!isSystemAudioOn)}
        title="Toggle system audio"
      />

      {isSystemAudioOn && (
        <DeviceSelector
          devices={audioDevices}
          selectedId={selectedDevices.systemAudio ?? ""}
          onChange={(deviceId) => handleDeviceChange(deviceId, true)}
          title="Select system audio source"
          isSystemAudio={true}
        />
      )}
    </div>
  );
};

export default AudioControls;
