// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { createContext, useContext } from 'react';
import { AudioAnalysisResult, AudioQualityResult, IAudioAnalyzer } from '../deepgram/interfaces/deepgram/IDeepgramService';

// Minimal implementation of IAudioAnalyzer
class SimpleAudioAnalyzer implements IAudioAnalyzer {
  analyzeAudioBuffer(buffer: ArrayBufferLike): AudioAnalysisResult {
    // Get the current sample rate of the system, or use a default value if not available
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const currentSampleRate = audioContext.sampleRate;
    audioContext.close(); // Close immediately to avoid leaving resources open
    
    return {
      valid: true,
      details: { format: 'audio/webm', sampleRate: currentSampleRate, channels: 2 }
    };
  }
  
  async testAudioQuality(): Promise<AudioQualityResult> {
    return { valid: true };
  }
}

const analyzer = new SimpleAudioAnalyzer();

const AudioAnalyzerContext = createContext<IAudioAnalyzer>(analyzer);

export const useAudioAnalyzer = () => useContext(AudioAnalyzerContext);

export const AudioAnalyzerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <AudioAnalyzerContext.Provider value={analyzer}>
      {children}
    </AudioAnalyzerContext.Provider>
  );
}; 