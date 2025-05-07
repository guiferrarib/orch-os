// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { PineconeMemoryService } from './PineconeMemoryService';

// Import for TextDecoder
import { TextDecoder } from 'util';
// Assign global property
// @ts-expect-error - adding TextDecoder to global object
global.TextDecoder = TextDecoder;

// Mock for gpt-tokenizer
jest.mock('gpt-tokenizer', () => ({
  encode: jest.fn().mockImplementation((text) => {
    // Simulated tokenization - approximately 1 token for every 4 characters
    return Array.from({ length: Math.ceil(text.length / 4) }, (_, i) => i);
  }),
}));

// Mock uuid for predictable test results
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234'),
}));

// Interface for the mock of electronAPI
interface ElectronAPIMock {
  queryPinecone: jest.Mock;
  saveToPinecone?: jest.Mock;
  // deletePineconeNamespace is no longer necessary, as the namespace is managed internally by PineconeHelper
}

// Type for the extended global object
interface GlobalWithMocks {
  electronAPIMock?: ElectronAPIMock;
  window?: {
    electronAPI?: ElectronAPIMock;
  };
}

// Mock helper functions 
function setupMock(mock: ElectronAPIMock): void {
  // This type of cast is acceptable in test environment
  // to configure mocks necessary for tests
  const globalObj = global as unknown as GlobalWithMocks;
  globalObj.electronAPIMock = mock;
  globalObj.window = globalObj.window || {};
  if (globalObj.window) {
    globalObj.window.electronAPI = mock;
  }
}

function cleanupMock(): void {
  const globalObj = global as unknown as GlobalWithMocks;
  if (globalObj.electronAPIMock) {
    delete globalObj.electronAPIMock;
  }
  if (globalObj.window?.electronAPI) {
    delete globalObj.window.electronAPI;
  }
}

describe('PineconeMemoryService (unit)', () => {
  
  // Set up test spy for our private method
  let getSymbolicBufferSpy: jest.SpyInstance<any, any>;
  const mockEmbeddingService = {
    isInitialized: () => true,
    createEmbedding: async () => [1, 2, 3],
    initialize: async () => true as boolean | Promise<boolean>
  };
  
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });
  
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Helper function for caching tests
  const createCacheHelpers = () => {
    const cache = new Map<string, string>();
    
    function getCacheKey(embedding: number[], topK: number, keywords: string[]) {
      return JSON.stringify({embedding, topK, keywords});
    }
    
    async function cachedQueryMemory(
      service: PineconeMemoryService, 
      embedding: number[], 
      topK: number, 
      keywords: string[]
    ) {
      const key = getCacheKey(embedding, topK, keywords);
      if (cache.has(key)) return cache.get(key);
      const result = await service.queryMemory(embedding, topK, keywords);
      cache.set(key, result);
      return result;
    }
    
    return { cache, cachedQueryMemory };
  };

  // O teste de namespace não é mais aplicável pois o parâmetro foi removido do Pinecone
  // Caso queira testar isolamento multiusuário, utilize lógica interna própria


  it('should cache identical queries for same user (namespace gerenciado internamente)', async () => {
    const mockQuery = jest.fn().mockResolvedValue({ matches: [{ metadata: { content: 'cached' } }] });
    setupMock({ queryPinecone: mockQuery });
    
    const service = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service, 'isAvailable').mockReturnValue(true);
    
    // Use isolated cache helpers for this test
    const { cache, cachedQueryMemory } = createCacheHelpers();
    
    cache.clear();
    const res1 = await cachedQueryMemory(service, [1,2,3], 5, []);
    const res2 = await cachedQueryMemory(service, [1,2,3], 5, []);
    
    expect(res1).toBe('cached');
    expect(res2).toBe('cached');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    
    cleanupMock();
  });

  it('should handle persistence service failure gracefully', async () => {
    setupMock({ queryPinecone: jest.fn().mockResolvedValue(undefined) });
    
    const service = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service, 'isAvailable').mockReturnValue(true);
    
    const result = await service.queryMemory([1,2,3], 5, []);
    expect(result).toBe("");
    
    cleanupMock();
  });

  it('should call electronAPIMock.queryPinecone in Node env', async () => {
    setupMock({ queryPinecone: jest.fn().mockResolvedValue({ matches: [{ metadata: { content: 'pinecone-mock' } }] }) });
    
    const service = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service, 'isAvailable').mockReturnValue(true);
    
    const result = await service.queryMemory([1, 2, 3], 3, ['a', 'b']);
    expect(result).toBe('pinecone-mock');
    
    cleanupMock();
  });
  
  it('should return empty string if not available or embedding is empty', async () => {
    // Test when service is not available
    const service1 = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service1, 'isAvailable').mockReturnValue(false);
    expect(await service1.queryMemory([1, 2, 3])).toBe("");
    
    // Test when embedding is empty
    const service2 = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service2, 'isAvailable').mockReturnValue(true);
    expect(await service2.queryMemory([])).toBe("");
  });

  it('should handle rejected promises gracefully', async () => {
    setupMock({ queryPinecone: jest.fn().mockRejectedValue(new Error('Simulated failure')) });
    
    const service = new PineconeMemoryService(mockEmbeddingService);
    jest.spyOn(service, 'isAvailable').mockReturnValue(true);
    
    const result = await service.queryMemory([1,2,3], 5, []);
    expect(result).toBe("");
    
    cleanupMock();
  });
});
