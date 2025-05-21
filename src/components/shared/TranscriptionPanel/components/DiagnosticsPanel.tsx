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
    <div className="flex items-center space-x-4 text-xs mb-2">
      {/* Deepgram Status */}
      <div className="flex items-center gap-1">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className={`orchos-status-icon ${connectionState === ConnectionState.OPEN ? 'animate-pulse' : ''}`}> 
          <ellipse cx="8.5" cy="8.5" rx="7.5" ry="5.5" stroke={connectionState === ConnectionState.OPEN ? '#00faff' : connectionState === ConnectionState.CONNECTING ? '#ffe066' : '#ff416c'} strokeWidth="1.3"/>
          {/* Plug icon */}
          <rect x="7" y="4" width="3" height="6" rx="1" fill={connectionState === ConnectionState.OPEN ? '#00faff' : connectionState === ConnectionState.CONNECTING ? '#ffe066' : '#ff416c'}/>
          <rect x="7.7" y="2.5" width="1.6" height="2" rx="0.7" fill={connectionState === ConnectionState.OPEN ? '#00faff' : connectionState === ConnectionState.CONNECTING ? '#ffe066' : '#ff416c'}/>
        </svg>
        <span className={`font-semibold ${connectionState === ConnectionState.OPEN ? 'text-cyan-300' : connectionState === ConnectionState.CONNECTING ? 'text-yellow-300' : 'text-pink-400'}`}>Deepgram:</span>
        <span className={`${connectionState === ConnectionState.OPEN ? 'text-cyan-200' : connectionState === ConnectionState.CONNECTING ? 'text-yellow-200' : 'text-pink-300'} ml-1`}>{ConnectionState[connectionState]}</span>
      </div>
      {/* Microphone Status */}
      <div className="flex items-center gap-1">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className={`orchos-status-icon ${microphoneState === MicrophoneState.Open ? 'animate-pulse' : ''}`}>
          <ellipse cx="8.5" cy="8.5" rx="7.5" ry="5.5" stroke={microphoneState === MicrophoneState.Open ? '#00faff' : microphoneState === MicrophoneState.Error ? '#ff416c' : '#ffe066'} strokeWidth="1.3"/>
          {/* Mic icon */}
          <rect x="7" y="5" width="3" height="6" rx="1.2" fill={microphoneState === MicrophoneState.Open ? '#00faff' : microphoneState === MicrophoneState.Error ? '#ff416c' : '#ffe066'}/>
          <rect x="8" y="11.5" width="1" height="2" rx="0.5" fill={microphoneState === MicrophoneState.Open ? '#00faff' : microphoneState === MicrophoneState.Error ? '#ff416c' : '#ffe066'}/>
        </svg>
        <span className={`font-semibold ${microphoneState === MicrophoneState.Open ? 'text-cyan-300' : microphoneState === MicrophoneState.Error ? 'text-pink-400' : 'text-yellow-300'}`}>Microphone:</span>
        <span className={`${microphoneState === MicrophoneState.Open ? 'text-cyan-200' : microphoneState === MicrophoneState.Error ? 'text-pink-300' : 'text-yellow-200'} ml-1`}>{MicrophoneState[microphoneState]}</span>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
