// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IConversationHistoryManager.ts
// Interface for managing conversation history

import { Message } from "../transcription/TranscriptionTypes";

export interface IConversationHistoryManager {
  /**
   * Adds a message to the conversation history
   */
  addMessage(message: Message): void;
  
  /**
   * Gets the current conversation history
   */
  getHistory(): Message[];
  
  /**
   * Clears the conversation history (keeps system message)
   */
  clearHistory(): void;
  
  /**
   * Sets the maximum number of interactions to keep
   */
  setMaxInteractions(max: number): void;
} 