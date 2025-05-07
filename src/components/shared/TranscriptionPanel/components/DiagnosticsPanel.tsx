// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { ConnectionState, MicrophoneState } from '../../../context';

interface DiagnosticsPanelProps {
  connectionState: ConnectionState;
  microphoneState: MicrophoneState;
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ connectionState, microphoneState }) => {
  const getConnectionColor = () => {
    switch (connectionState) {
      case ConnectionState.OPEN:
        return "bg-green-500";
      case ConnectionState.CONNECTING:
        return "bg-yellow-500";
      case ConnectionState.ERROR:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMicrophoneColor = () => {
    switch (microphoneState) {
      case MicrophoneState.Open:
        return "bg-green-500";
      case MicrophoneState.Ready:
      case MicrophoneState.Opening:
        return "bg-yellow-500";
      case MicrophoneState.Error:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs mb-2">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-1 ${getConnectionColor()}`}></div>
        <span>Deepgram: {ConnectionState[connectionState]}</span>
      </div>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-1 ${getMicrophoneColor()}`}></div>
        <span>Microphone: {MicrophoneState[microphoneState]}</span>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
