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
    <div className="orchos-recording-fab-container w-full flex flex-col items-center justify-center relative" >
      <DiagnosticsPanel
        connectionState={connectionState}
        microphoneState={microphoneState}
      />
      <button
        className={
          `orchos-btn-circular orchos-btn-fab orchos-btn-glass orchos-btn-ripple orchos-btn-rel flex items-center justify-center shadow-lg transition-all duration-200` +
          (microphoneState === MicrophoneState.Open ? " orchos-btn-fab-active animate-pulse" : " orchos-btn-fab-inactive")
        }
        onClick={e => {
          const btn = e.currentTarget;
          const ripple = document.createElement('span');
          ripple.className = 'ripple orchos-ripple-electric';
          ripple.style.left = `${e.nativeEvent.offsetX}px`;
          ripple.style.top = `${e.nativeEvent.offsetY}px`;
          btn.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
          toggleRecording();
        }}
        title={microphoneState === MicrophoneState.Open ? 'Stop Recording' : 'Start Recording'}
        aria-label={microphoneState === MicrophoneState.Open ? 'Stop Recording' : 'Start Recording'}
        style={{ width: 72, height: 72, minWidth: 72, minHeight: 72, border: microphoneState === MicrophoneState.Open ? '3px solid #ff4dd2' : '3px solid #00faff', background: 'rgba(24,24,40,0.82)', boxShadow: microphoneState === MicrophoneState.Open ? '0 0 32px 8px #ff4dd255' : '0 0 32px 8px #00faff33' }}
      >
        {microphoneState === MicrophoneState.Open ? (
          // Ícone de STOP neural (quadrado com pulso)
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="orchos-icon-glow">
            <ellipse cx="19" cy="19" rx="16" ry="12" stroke="#ff4dd2" strokeWidth="2.5"/>
            <rect x="13" y="13" width="12" height="12" rx="3" fill="#ff4dd2"/>
            <path d="M19 7 L19 3" stroke="#ff4dd2" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="19" cy="3" r="1.3" fill="#ff4dd2"/>
            <path d="M17 19 Q19 23 21 19" stroke="#ff4dd2" strokeWidth="1.5" fill="none"/>
          </svg>
        ) : (
          // Ícone de microfone neural (START)
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="orchos-icon-glow">
            <ellipse cx="19" cy="19" rx="16" ry="12" stroke="#00faff" strokeWidth="2.5"/>
            <rect x="16" y="11" width="6" height="14" rx="3" fill="#00faff"/>
            <rect x="17.5" y="25" width="3" height="3" rx="1.5" fill="#00faff"/>
            <path d="M19 7 L19 3" stroke="#00faff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="19" cy="3" r="1.3" fill="#00faff"/>
            <path d="M17 19 Q19 23 21 19" stroke="#00faff" strokeWidth="1.5" fill="none"/>
          </svg>
        )}
      </button>
      {/* Label de status acima do botão */}
      {microphoneState === MicrophoneState.Open && (
        <div className="orchos-recording-label orchos-recording-label-fab text-xs font-bold animate-pulse select-none relative mt-4 px-4 py-1.5 rounded-full bg-pink-900/70 border border-pink-400 shadow-2xl drop-shadow-[0_0_16px_#ff4dd2cc] backdrop-blur-md z-20"
          style={{letterSpacing: '0.02em', minWidth: 110, boxShadow: '0 0 24px 3px #ff4dd288, 0 0 0 2px #ff4dd2cc'}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="inline mr-1 align-text-bottom"><ellipse cx="9" cy="9" rx="7" ry="5" stroke="#ff4dd2" strokeWidth="1.5"/><circle cx="9" cy="9" r="2" fill="#ff4dd2"/></svg>
          Recording...
        </div>
      )}
    </div>
  );
};

export default RecordingControl;
