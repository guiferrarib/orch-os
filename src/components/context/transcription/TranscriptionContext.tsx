// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TranscriptionContext.tsx
// Context for managing transcriptions

import React, { createContext, useCallback, useContext, useState } from 'react';

interface TranscriptionContextType {
  texts: {
    transcription: string;
    aiResponse: string;
  };
  setTexts: React.Dispatch<React.SetStateAction<{ transcription: string; aiResponse: string }>>;
  updateTranscription: (text: string, isFinal: boolean) => void;
  clearTranscription: () => void;
}

const TranscriptionContext = createContext<TranscriptionContextType | null>(null);

export function useTranscription() {
  return useContext(TranscriptionContext);
}

export function TranscriptionProvider({ children }: { children: React.ReactNode }) {
  const [texts, setTexts] = useState({
    transcription: '',
    aiResponse: '',
  });

  // Function to update transcription with new text
  const updateTranscription = useCallback((text: string, isFinal: boolean) => {
    if (!text.trim()) return;
    
    setTexts(prev => {
      // For final text, add a paragraph or send for processing
      if (isFinal) {
        return {
          ...prev,
          transcription: prev.transcription ? `${prev.transcription}\n${text}` : text,
        };
      } 
      // For temporary text (while speaking), update the end of the transcription
      else {
        // Find the last line (where we added the temporary text)
        const lines = prev.transcription.split('\n');
        const lastLineIndex = lines.length - 1;
        
        // Update only the last line
        if (lastLineIndex >= 0) {
          lines[lastLineIndex] = text;
        } else {
          lines.push(text);
        }
        
        return {
          ...prev,
          transcription: lines.join('\n'),
        };
      }
    });
  }, []);

  // Function to clear the transcription
  const clearTranscription = useCallback(() => {
    setTexts(prev => ({
      ...prev,
      transcription: '',
    }));
  }, []);

  const value = {
    texts,
    setTexts,
    updateTranscription,
    clearTranscription,
  };

  return (
    <TranscriptionContext.Provider value={value}>
      {children}
    </TranscriptionContext.Provider>
  );
} 