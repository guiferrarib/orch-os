// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { ProgressInfo } from '../interfaces/types';
import { Logger } from './logging';

/**
 * Class responsible for reporting the progress of operations
 */
export class ProgressReporter {
  private onProgress?: (info: ProgressInfo) => void;
  private logger: Logger;
  private lastUpdate: number = 0;
  private throttleInterval: number = 100; // Minimum ms between updates
  private lastPercentage: number = -1; // Track last percentage to avoid duplicate updates
  private queuedUpdate: NodeJS.Timeout | null = null;

  constructor(onProgress?: (info: ProgressInfo) => void, logger?: Logger) {
    this.onProgress = onProgress;
    this.logger = logger || new Logger('[ProgressReporter]');
  }

  /**
   * Starts a new processing stage
   */
  public startStage(stage: 'parsing' | 'deduplicating' | 'generating_embeddings' | 'saving', total: number): void {
    this.lastPercentage = -1; // Reset percentage tracker on new stage
    this.updateProgress(stage, 0, total);
  }

  /**
   * Updates the progress of a stage with throttling and error handling
   */
  public updateProgress(
    stage: 'parsing' | 'deduplicating' | 'generating_embeddings' | 'saving', 
    processed: number, 
    total: number
  ): void {
    if (!this.onProgress) return;
    
    const now = Date.now();
    const percentage = Math.round((processed / Math.max(total, 1)) * 100);
    
    // Skip if same percentage and not the final update (100%)
    if (percentage === this.lastPercentage && percentage !== 100 && processed !== total) {
      return;
    }
    
    // If we recently updated and this isn't a completion update, throttle it
    if (now - this.lastUpdate < this.throttleInterval && percentage !== 100 && processed !== total) {
      // Clear any existing queued update
      if (this.queuedUpdate) {
        clearTimeout(this.queuedUpdate);
      }
      
      // Queue this update to run after the throttle interval
      this.queuedUpdate = setTimeout(() => {
        this.lastUpdate = Date.now();
        this.lastPercentage = percentage;
        this.safelyCallProgressCallback({
          processed,
          total,
          percentage,
          stage
        });
        this.queuedUpdate = null;
      }, this.throttleInterval - (now - this.lastUpdate));
      return;
    }
    
    // Otherwise, update immediately
    this.lastUpdate = now;
    this.lastPercentage = percentage;
    this.safelyCallProgressCallback({
      processed,
      total,
      percentage,
      stage
    });
  }

  /**
   * Safely calls the progress callback with error handling
   */
  private safelyCallProgressCallback(info: ProgressInfo): void {
    if (!this.onProgress) return;
    
    try {
      this.onProgress(info);
    } catch (error) {
      // Log the error but don't let it crash the process
      this.logger.warn(`Error sending progress update: ${error}`);
      // If we've had one error, don't keep trying to call the callback
      if (error instanceof Error && error.message.includes('Object has been destroyed')) {
        this.logger.warn('WebContents has been destroyed, disabling progress updates');
        this.onProgress = undefined; // Stop trying to call the callback
      }
    }
  }

  /**
   * Completes a processing stage
   */
  public completeStage(stage: 'parsing' | 'deduplicating' | 'generating_embeddings' | 'saving', total: number): void {
    // Clear any queued updates
    if (this.queuedUpdate) {
      clearTimeout(this.queuedUpdate);
      this.queuedUpdate = null;
    }
    
    // Force completion update
    this.lastPercentage = 100;
    this.updateProgress(stage, total, total);
  }
}
