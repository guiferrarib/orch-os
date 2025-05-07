// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// OpenAIEmbeddingService.ts
// Implementation of IEmbeddingService using OpenAI

import { IEmbeddingService } from "../../interfaces/openai/IEmbeddingService";
import { IOpenAIService } from "../../interfaces/openai/IOpenAIService";
import { LoggingUtils } from "../../utils/LoggingUtils";

export class OpenAIEmbeddingService implements IEmbeddingService {
  private openAIService: IOpenAIService;
  
  constructor(openAIService: IOpenAIService) {
    this.openAIService = openAIService;
  }
  
  /**
   * Creates an embedding for the provided text using OpenAI
   */
  async createEmbedding(text: string): Promise<number[]> {
    if (!text?.trim()) {
      return [];
    }
    
    try {
      // Delegate to the OpenAI service
      return await this.openAIService.createEmbedding(text.trim());
    } catch (error) {
      LoggingUtils.logError("Error creating embedding", error);
      return [];
    }
  }
  
  /**
   * Checks if the embedding service is initialized
   */
  isInitialized(): boolean {
    return this.openAIService.isInitialized();
  }
  
  /**
   * Initializes the embedding service
   */
  async initialize(config?: Record<string, any>): Promise<boolean> {
    if (!this.openAIService) {
      return false;
    }
    
    if (this.isInitialized()) {
      return true;
    }
    
    try {
      // If API key is provided in config, use it
      if (config?.apiKey) {
        this.openAIService.initializeOpenAI(config.apiKey);
        return this.isInitialized();
      }
      
      // Otherwise try to load from environment
      await this.openAIService.loadApiKey();
      return this.isInitialized();
    } catch (error) {
      LoggingUtils.logError("Error initializing embedding service", error);
      return false;
    }
  }
} 