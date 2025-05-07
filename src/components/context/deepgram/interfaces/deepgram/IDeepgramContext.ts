// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IDeepgramContext.ts
// Interface for the Deepgram context

import { ListenLiveClient } from "@deepgram/sdk";
import { ConnectionState } from './IDeepgramService';

export enum DeepgramState {
  NotConnected = 'not_connected',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting',
  Error = 'error'
}

import { TranscriptionStorageService } from '../../services/transcription/TranscriptionStorageService';
import { PineconeMemoryService } from '../../services/memory/PineconeMemoryService';

export interface IDeepgramContext {
  connection: ListenLiveClient | null;
  connectionState: ConnectionState;
  sendTranscriptionPrompt: (temporaryContext?: string) => Promise<void>;
  transcriptionList: string[];
  waitForConnectionState: (targetState: ConnectionState, timeoutMs?: number) => Promise<boolean>;
  getConnectionStatus: () => { 
    state: ConnectionState, 
    stateRef: ConnectionState, 
    hasConnectionObject: boolean,
    readyState: number | null,
    active: boolean 
  };
  hasActiveConnection: () => boolean;
  deepgramState: DeepgramState;
  isConnected: boolean;
  isProcessing: boolean;
  language: string;
  model: string;
  connectToDeepgram: () => Promise<boolean>;
  disconnectFromDeepgram: () => Promise<void>;
  sendAudioChunk: (chunk: Uint8Array | Blob) => Promise<boolean>;
  stopProcessing: () => void;
  setLanguage: (language: string) => void;
  setModel: (model: string) => void;
  resetState: () => void;
  setAutoQuestionDetection: (enabled: boolean) => void;

  // Advanced services exposed for UI/integration
  transcriptionService?: TranscriptionStorageService;
  memoryService?: PineconeMemoryService;
} 