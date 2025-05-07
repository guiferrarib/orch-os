// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IRecorderService.ts
// Interface for managing audio recording with MediaRecorder


export interface IRecorderService {
  createMediaRecorder: () => MediaRecorder | null;
  startRecording: () => void;
  stopRecording: () => void;
  configureRecorderEvents: (recorder: MediaRecorder) => void;
  getCurrentRecorder: () => MediaRecorder | null;
} 