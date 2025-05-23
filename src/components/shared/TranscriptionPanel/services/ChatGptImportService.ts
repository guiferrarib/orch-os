// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { EventEmitter } from 'events';
import { IChatGptImportService, ImportMode, ImportProgressData } from '../types/interfaces';

// Implementation of the import service (Single Responsibility Principle)
export class ChatGptImportService implements IChatGptImportService {
  private progressEmitter: EventEmitter;

  constructor() {
    this.progressEmitter = new EventEmitter();
  }

  async importChatHistory(options: {
    fileBuffer: ArrayBuffer | Buffer;
    mode: ImportMode;
    user: string;
    onProgress?: (data: ImportProgressData) => void;
  }): Promise<{ success: boolean; error?: string; imported?: number; skipped?: number }> {
    try {
      // Call the actual electronAPI import method
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.importChatHistory({
          fileBuffer: options.fileBuffer,
          mode: options.mode,
          user: options.user,
          onProgress: options.onProgress,
        });
        
        // Return the result obtained from the API
        return {
          success: result.success ?? false,
          imported: result.imported ?? 0,
          skipped: result.skipped ?? 0,
          error: result.error
        };
      } else {
        throw new Error("Electron API not available");
      }
    } catch (error) {
      console.error("Error in ChatGptImportService:", error);
      let errorMsg = "Import failed";
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === "string") {
        errorMsg = error;
      }
      // Return object with basic fields
      return { 
        error: errorMsg, 
        success: false,
        imported: 0,
        skipped: 0
      };
    }
  }
}

// Singleton instance for the service (Single Responsibility Principle)
const chatGptImportService = new ChatGptImportService();
export default chatGptImportService;
