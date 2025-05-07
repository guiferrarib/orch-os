// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// IEmbeddingService.ts
// Interface for embedding text services

export interface IEmbeddingService {
  /**
   * Creates an embedding for the provided text
   */
  createEmbedding(text: string): Promise<number[]>;
  
  /**
   * Checks if the embedding service is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Initializes the embedding service
   */
  initialize(config?: Record<string, any>): Promise<boolean>;
} 