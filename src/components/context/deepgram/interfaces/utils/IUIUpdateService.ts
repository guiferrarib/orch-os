// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IUIUpdateService.ts
// Interface for the UI update service and notifications

export interface IUIUpdateService {
  /**
   * Updates the UI with new values
   */
  updateUI(update: Record<string, any>): void;
  
  /**
   * Notifies the start of prompt processing via IPC
   */
  notifyPromptProcessingStarted(temporaryContext?: string): void;
  
  /**
   * Notifies the completion of prompt processing via IPC
   */
  notifyPromptComplete(response: string): void;
  
  /**
   * Notifies an error in prompt processing via IPC
   */
  notifyPromptError(errorMessage: string): void;
} 