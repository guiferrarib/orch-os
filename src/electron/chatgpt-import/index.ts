// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Export the main module for importing ChatGPT history
 * SOLID implementation with separated services and well-defined responsibilities
 */

// Export the main handler
export { importChatGPTHistoryHandler } from './handlers/importChatGPTHandler';

// Export public types and interfaces
export type { 
  ImportChatGPTParams, 
  ImportResult,
  ProgressInfo 
} from './interfaces/types';
