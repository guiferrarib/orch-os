// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Logger utility for Deepgram services
 * Provides consistent logging throughout the Deepgram service modules
 */
export class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  /**
   * Log informational message
   */
  public info(message: string): void {
    console.log(`✅ [${this.context}] ${message}`);
  }
  
  /**
   * Log debug message with optional data
   */
  public debug(message: string, data?: any): void {
    if (data) {
      console.log(`🔍 [${this.context}] ${message}:`, data);
    } else {
      console.log(`🔍 [${this.context}] ${message}`);
    }
  }
  
  /**
   * Log warning message with optional error
   */
  public warning(message: string, error?: any): void {
    if (error) {
      console.warn(`⚠️ [${this.context}] ${message}:`, error);
    } else {
      console.warn(`⚠️ [${this.context}] ${message}`);
    }
  }
  
  /**
   * Log error message with optional error object
   */
  public error(message: string, error?: any): void {
    if (error) {
      console.error(`❌ [${this.context}] ${message}:`, error);
    } else {
      console.error(`❌ [${this.context}] ${message}`);
    }
  }
  
  /**
   * Handle error with context
   */
  public handleError(context: string, error: any): void {
    console.error(`❌ [${this.context}] ${context}:`, error);
  }
}

export default Logger;
