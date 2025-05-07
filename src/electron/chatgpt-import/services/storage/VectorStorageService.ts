// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { PineconeVector } from '../../interfaces/types';
import { PineconeHelper } from '../../../../../electron/PineconeHelper';
import { ProgressReporter } from '../../utils/progressReporter';
import { Logger } from '../../utils/logging';

/**
 * Service for storing vectors in Pinecone (neural persistence)
 */
export class VectorStorageService {
  private pineconeHelper: PineconeHelper;
  private progressReporter: ProgressReporter;
  private logger: Logger;

  constructor(pineconeHelper: PineconeHelper, progressReporter: ProgressReporter, logger?: Logger) {
    this.pineconeHelper = pineconeHelper;
    this.progressReporter = progressReporter;
    this.logger = logger || new Logger('[VectorStorageService]');
  }

  /**
   * Clears all existing data in overwrite mode
   */
  public async deleteExistingData(): Promise<void> {
    this.logger.info('OVERWRITE mode selected, clearing ALL existing primary user data...');
    
    if (this.pineconeHelper.deleteAllUserVectors) {
      await this.pineconeHelper.deleteAllUserVectors();
      this.logger.success('All existing primary user data cleared successfully in OVERWRITE mode');
    } else {
      this.logger.warn('deleteAllUserVectors method not available in pineconeHelper');
    }
  }

  /**
   * Saves vectors to Pinecone
   */
  public async saveVectors(vectors: PineconeVector[]): Promise<{ success: boolean; error?: string }> {
    this.logger.debug(`Generated vectors: ${vectors.length}`);
    
    // Start saving progress
    this.progressReporter.startStage('saving', vectors.length);
    
    if (vectors.length === 0) {
      this.logger.warn('AVISO: No vectors generated to save to Pinecone!');
      this.logger.debug('Checking possible causes:');
      this.logger.debug('No vectors to save');
      
      this.progressReporter.completeStage('saving', 0);
      return { success: true };
    }
    
    this.logger.info(`Starting saving of ${vectors.length} vectors to Pinecone`);
    this.logger.debug(`First vector to be saved: ${JSON.stringify(vectors[0]).substring(0, 200)}...`);
    
    try {
      // Divide vectors into batches for better visual feedback and performance
      const BATCH_SIZE = 500; // Ideal batch size for Pinecone
      const batches: PineconeVector[][] = [];
      
      // Divide into batches
      for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
        batches.push(vectors.slice(i, i + BATCH_SIZE));
      }
      
      this.logger.info(`Saving ${vectors.length} vectors in ${batches.length} batches of up to ${BATCH_SIZE} vectors`);
      
      let success = true;
      let error = '';
      let totalProcessed = 0;
      
      // Save by batches for better progress feedback
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        this.logger.info(`Processing batch ${i+1}/${batches.length} with ${batch.length} vectors`);
        
        try {
          // Save current batch to Pinecone
          const batchResult = await this.pineconeHelper.saveToPinecone(batch);
          
          if (!batchResult.success) {
            success = false;
            error = batchResult.error || 'Unknown error in batch ' + (i+1);
            this.logger.error(`Error in batch ${i+1}: ${error}`);
          }
          
          // Update progress
          totalProcessed += batch.length;
          this.progressReporter.updateProgress('saving', totalProcessed, vectors.length);
          
        } catch (batchError) {
          success = false;
          error = batchError instanceof Error ? batchError.message : 'Unknown error';
          this.logger.error(`Error in batch ${i+1}:`, batchError);
        }
        
        // Small pause to avoid overloading Pinecone
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Result final
      if (success) {
        this.logger.success('Save operation completed successfully!');
      } else {
        this.logger.error(`Error in saving: ${error}`);
      }
      
      // Complete saving progress
      this.progressReporter.completeStage('saving', vectors.length);
      
      // Force a small delay to ensure the last progress event is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success, error };
    } catch (error) {
      this.logger.error('Unexpected error in saving:', error);
      
      // Complete saving progress even with error
      this.progressReporter.completeStage('saving', vectors.length);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
