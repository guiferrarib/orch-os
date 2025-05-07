// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { IOpenAIService } from '../../../../components/context/deepgram/interfaces/openai/IOpenAIService';
import { MessageChunk, PineconeVector } from '../../interfaces/types';
import { Logger } from '../../utils/logging';
import { ProgressReporter } from '../../utils/progressReporter';

/**
 * Service for generating embeddings
 */
export class EmbeddingService {
  private openAIService: IOpenAIService | null | undefined;
  private logger: Logger;
  private progressReporter?: ProgressReporter;
  private embeddingDimension: number = 3072; // Dimension configured in Pinecone database

  constructor(openAIService: IOpenAIService | null | undefined, logger?: Logger, progressReporter?: ProgressReporter) {
    this.openAIService = openAIService;
    this.logger = logger || new Logger('[EmbeddingService]');
    this.progressReporter = progressReporter;
  }

  /**
   * Initializes the OpenAI service if necessary
   */
  public async ensureOpenAIInitialized(): Promise<boolean> {
    this.logger.info('Verifying OpenAI service initialization...');
    
    if (!this.openAIService) {
      this.logger.error('FATAL ERROR: OpenAI service not provided - verify if the service is correctly injected');
      return false;
    }

    // Verify if the service is already initialized
    const isInitialized = this.openAIService.isInitialized();
    this.logger.info(`Status of OpenAI initialization: ${isInitialized ? 'Already initialized' : 'Not initialized'}`);
    
    if (isInitialized) {
      return true;
    }
    
    this.logger.warn('OpenAI client not initialized. Attempting to initialize via loadApiKey()...');
    
    try {
      // Use the loadApiKey method from the service itself
      this.logger.info('Calling openAIService.loadApiKey()...');
      await this.openAIService.loadApiKey();
      
      // Verify if it was initialized
      if (this.openAIService.isInitialized()) {
        this.logger.success('OpenAI client initialized successfully via loadApiKey()!');
        return true;
      }
      
      // If it was not initialized, check if there is an ensureOpenAIClient method
      if (this.openAIService.ensureOpenAIClient) {
        this.logger.info('Attempting to initialize via ensureOpenAIClient()...');
        const initialized = await this.openAIService.ensureOpenAIClient();
        if (initialized) {
          this.logger.success('OpenAI client initialized successfully via ensureOpenAIClient()!');
          return true;
        }
      }
      
      this.logger.error('Failed to initialize OpenAI client. Initialization attempts failed.');
      return false;
    } catch (error) {
      this.logger.error('Error initializing OpenAI client:', error);
      return false;
    }
  }

  /**
   * Generates embeddings for text chunks
   */
  public async generateEmbeddingsForChunks(
    batches: MessageChunk[][], 
    allMessageChunks: MessageChunk[]
  ): Promise<PineconeVector[]> {
    // Start the progress of generating embeddings
    if (this.progressReporter) {
      this.progressReporter.startStage('generating_embeddings', allMessageChunks.length);
    }
    
    // Verify if we have the OpenAI service available
    const openAIInitialized = await this.ensureOpenAIInitialized();
    this.logger.info(`Status of OpenAI for embedding generation: ${openAIInitialized ? 'Initialized' : 'Not initialized'}`)
    
    if (!openAIInitialized) {
      throw new Error('OpenAI service not initialized. Configure the OPENAI_KEY variable to generate embeddings.');
    }

    const vectors: PineconeVector[] = [];
    let embeddingsProcessed = 0;
    
    let processedTotal = 0;
for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      this.logger.info(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} messages`);
      
      // Prepare the texts for the current batch
      const batchTexts = batch.map(chunk => chunk.content);
      
      // Generate embeddings for the entire batch
      let batchEmbeddings: number[][] = [];
      
      if (openAIInitialized && this.openAIService) {
        try {
          // Method to generate embeddings in batch
          if (this.openAIService.createEmbeddings) {
            // If the API supports batch embeddings
            batchEmbeddings = await this.openAIService.createEmbeddings(batchTexts);
            this.logger.success(`Embeddings generated successfully for batch ${batchIndex + 1}/${batches.length}`);
          } else {
            // Fallback: generate embeddings one by one
            this.logger.warn('API does not support batch embeddings, processing sequentially...');
            batchEmbeddings = await Promise.all(
              batchTexts.map(async (text) => {
                try {
                  return await this.openAIService!.createEmbedding(text);
                } catch (err) {
                  this.logger.error(`Error generating embedding for text: ${text.substring(0, 50)}...`, err);
                  throw new Error(`Failed to generate real embedding: ${err instanceof Error ? err.message : String(err)}`);
                }
              })
            );
          }
        } catch (batchError) {
          this.logger.error(`Error processing batch ${batchIndex + 1}:`, batchError);
          throw new Error(`Failed to process embeddings batch: ${batchError instanceof Error ? batchError.message : String(batchError)}`);
        }
      } else {
        const error = new Error(`OpenAI service not available to process batch ${batchIndex + 1}`);
        this.logger.error(error.message);
        throw error;
      }
      
      // Create vectors from generated embeddings
      for (let i = 0; i < batch.length; i++) {
        const chunk = batch[i];
        const embedding = batchEmbeddings[i];
        const msg = chunk.original;
        
        embeddingsProcessed++;
        
        try {
          // Create a unique ID for the vector - if it's part of a split message, add the part number
          const vectorId = chunk.part 
            ? `${msg.id || `msg_${Date.now()}`}_part${chunk.part}` 
            : (msg.id || `msg_${Date.now()}_${embeddingsProcessed}`);
          
          // Add the vector to the array
          vectors.push({
            id: vectorId,
            values: embedding,
            metadata: {
              // Original ChatGPT fields
              role: msg.role,
              content: chunk.content,
              timestamp: msg.timestamp || 0,
              session_title: msg.session_title || '',
              session_create_time: msg.session_create_time || 0,
              session_update_time: msg.session_update_time || 0,
              imported_from: 'chatgpt',
              imported_at: Date.now(),
              messageId: msg.id || vectorId, // Ensure it always has a valid messageId
              
              // source field for compatibility with the transcription system
              source: msg.role,
              // Chunking metadata for split messages
              ...(chunk.part ? {
                chunking_part: chunk.part,
                chunking_total_parts: chunk.totalParts || 1,
                chunking_is_partial: true
              } : {})
            }
          });
        } catch (error) {
          this.logger.error(`Error processing chunk ${embeddingsProcessed}/${allMessageChunks.length}:`, error);
        }
      }
      
      // Update progress after each batch
      processedTotal += batch.length;
      if (this.progressReporter) {
        this.progressReporter.updateProgress('generating_embeddings', processedTotal, allMessageChunks.length);
      }
      
      // Small pause to avoid API throttling
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Finalize the progress of generating embeddings
    if (this.progressReporter) {
      this.progressReporter.completeStage('generating_embeddings', allMessageChunks.length);
    }
    
    this.logger.info(`Generated ${vectors.length} vectors with embeddings`);
    return vectors;
  }
}
