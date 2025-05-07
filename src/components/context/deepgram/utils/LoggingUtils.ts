// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// LoggingUtils.ts
// Logging utilities

export class LoggingUtils {
  private static readonly PREFIX = "[Transcription]";
  
  /**
   * Logs an informative message
   */
  static logInfo(message: string): void {
    console.log(`ℹ️ ${this.PREFIX} ${message}`);
  }
  
  /**
   * Logs a warning
   */
  static logWarning(message: string): void {
    console.warn(`⚠️ ${this.PREFIX} ${message}`);
  }
  
  /**
   * Logs an error
   */
  static logError(message: string, error?: unknown): void {
    if (error) {
      console.error(`❌ ${this.PREFIX} ${message}:`, error);
    } else {
      console.error(`❌ ${this.PREFIX} ${message}`);
    }
  }
} 