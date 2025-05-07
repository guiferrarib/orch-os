// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { ConnectionState, MicrophoneState } from '../../../context';
import DiagnosticsPanel from './DiagnosticsPanel';

interface RecordingControlProps {
  connectionState: ConnectionState;
  microphoneState: MicrophoneState;
  toggleRecording: () => Promise<void>;
}

const RecordingControl: React.FC<RecordingControlProps> = ({
  connectionState,
  microphoneState,
  toggleRecording
}) => {
  return (
    <div className="w-full">
      <DiagnosticsPanel
        connectionState={connectionState}
        microphoneState={microphoneState}
      />
      <button
        className={`w-full py-2 text-center rounded-lg text-white transition-colors ${
          microphoneState === MicrophoneState.Open
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={toggleRecording}
      >
        {microphoneState === MicrophoneState.Open
          ? "Stop Recording & Transcription"
          : "Start Recording & Transcription"
        }
      </button>
    </div>
  );
};

export default RecordingControl;
