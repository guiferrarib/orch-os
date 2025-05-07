// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Utility class for standardizing log messages
 */
export class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Log information
   */
  public info(message: string): void {
    console.log(`${this.prefix} ${message}`);
  }

  /**
   * Log warning
   */
  public warn(message: string): void {
    console.warn(`${this.prefix} ⚠️ ${message}`);
  }

  /**
   * Log error
   */
  public error(message: string, error?: unknown): void {
    if (error) {
      console.error(`${this.prefix} ❌ ${message}`, error);
    } else {
      console.error(`${this.prefix} ❌ ${message}`);
    }
  }

  /**
   * Log debug (only in development environment)
   */
  public debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      if (data) {
        console.log(`${this.prefix} 🔍 DEBUG - ${message}`, data);
      } else {
        console.log(`${this.prefix} 🔍 DEBUG - ${message}`);
      }
    }
  }

  /**
   * Log success
   */
  public success(message: string): void {
    console.log(`${this.prefix} ✅ ${message}`);
  }

  /**
   * Log stage
   */
  public stage(stage: string, details: string): void {
    console.log(`${this.prefix} [${stage}] ${details}`);
  }
}
