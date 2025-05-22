// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { MicrophoneState } from '../../../context';
import styles from './RecordingControl.module.css';

/**
 * Neural activation interface for audio recording control
 */
interface RecordingControlProps {
  microphoneState: MicrophoneState;
  toggleRecording: () => Promise<void>;
}

/**
 * Recording control component - Neural activation interface
 * Symbolic intent: Neural impulse control for audio signal capture
 */
const RecordingControl: React.FC<RecordingControlProps> = ({
  microphoneState,
  toggleRecording
}) => {
  return (
    <div className={styles.recordingContainer}>
      <button
        className={`orchos-btn-circular orchos-btn-fab orchos-btn-glass orchos-btn-ripple orchos-btn-rel flex items-center justify-center shadow-lg transition-all duration-200 ${styles.recordButton} ${
          microphoneState === MicrophoneState.Open 
            ? `${styles.recordButtonActive} animate-pulse` 
            : styles.recordButtonInactive
        }`}
        style={{
          border: microphoneState === MicrophoneState.Open ? '3px solid #ff4455' : '3px solid #00faff',
          boxShadow: microphoneState === MicrophoneState.Open ? '0 0 32px 8px rgba(255, 68, 85, 0.33)' : '0 0 32px 8px rgba(0, 250, 255, 0.2)'
        }}
        onClick={e => {
          // Create ripple effect - neural activation visualization
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
      >
        {microphoneState === MicrophoneState.Open ? (
          // Ícone de STOP neural (quadrado com pulso)
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="orchos-icon-glow">
            <ellipse cx="19" cy="19" rx="16" ry="12" stroke="#ff4455" strokeWidth="2.5"/>
            <rect x="13" y="13" width="12" height="12" rx="3" fill="#ff4455"/>
            <path d="M19 7 L19 3" stroke="#ff4455" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="19" cy="3" r="1.3" fill="#ff4455"/>
            <path d="M17 19 Q19 23 21 19" stroke="#ff4455" strokeWidth="1.5" fill="none"/>
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
      {/* Neural state indicator - active recording status */}
      {microphoneState === MicrophoneState.Open && (
        <div className={styles.recordingLabel}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="inline mr-1 align-text-bottom">
            <ellipse cx="9" cy="9" rx="7" ry="5" stroke="#ff4455" strokeWidth="1.5"/>
            <circle cx="9" cy="9" r="2" fill="#ff4455"/>
          </svg>
          Recording...
        </div>
      )}
    </div>
  );
};

export default RecordingControl;
