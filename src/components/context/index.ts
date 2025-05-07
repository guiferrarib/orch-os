// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// index.ts
// Export organization of all contexts and services

// Interfaces
export * from './deepgram/interfaces/deepgram/IDeepgramContext';
export * from './deepgram/interfaces/deepgram/IDeepgramService';
export * from './interfaces/IAudioContextService';
export * from './interfaces/IAudioDeviceService';
export * from './interfaces/IMicrophoneContext';
export * from './interfaces/IRecorderService';

// Microphone services
export { AudioContextService } from './microphone/AudioContextService';
export { AudioDeviceService } from './microphone/AudioDeviceService';
export { default as MicrophoneProvider, useMicrophone } from './microphone/MicrophoneContextProvider';
export { RecorderService } from './microphone/RecorderService';

// Deepgram services
export { DeepgramAudioAnalyzer } from './deepgram/AudioAnalyzer';
export { DeepgramConnectionService } from './deepgram/DeepgramConnectionService';
export { default as DeepgramProvider, useDeepgram } from './deepgram/DeepgramContextProvider';
export { DeepgramTranscriptionService } from './deepgram/services/DeepgramTranscriptionService';

// Transcription context
export { TranscriptionProvider, useTranscription } from './transcription';

// Enums
export { ConnectionState } from './deepgram/interfaces/deepgram/IDeepgramService';
export { MicrophoneEvents, MicrophoneState } from './interfaces/IMicrophoneContext';
 