// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Common types and interfaces used across Deepgram service modules
 */
import { ListenLiveClient } from "@deepgram/sdk";
import { ConnectionState } from "../../interfaces/deepgram/IDeepgramService";

/**
 * Speaker segment buffer structure
 */
export interface SpeakerBuffer {
  lastSpeaker: string;
  currentSegment: string[];
  formattedSegment: string;
  lastFlushedText: string;
}

/**
 * Transcription callback data structure
 */
export interface TranscriptionData {
  text: string;
  isFinal: boolean;
  channel: number;
  speaker: string;
}

/**
 * Connection status information
 */
export interface ConnectionStatus {
  state: ConnectionState;
  stateRef: ConnectionState;
  hasConnectionObject: boolean;
  readyState: number | null;
  active: boolean;
}

/**
 * Audio processing result
 */
export interface AudioProcessingResult {
  buffer: ArrayBuffer | null;
  valid: boolean;
}

/**
 * Connection state update callback
 */
export type ConnectionStateCallback = (state: ConnectionState) => void;

/**
 * Connection object update callback
 */
export type ConnectionCallback = (connection: ListenLiveClient | null) => void;

/**
 * Transcription event callback
 */
export type TranscriptionEventCallback = (event: string, data: any) => void;
