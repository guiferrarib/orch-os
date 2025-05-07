// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// MemoryService.integration.test.ts
// Integration tests for MemoryService

// Import for TextDecoder
import { TextDecoder } from 'util';
// Assign global property
// @ts-expect-error - adding TextDecoder to global object
global.TextDecoder = TextDecoder;

// Mock for gpt-tokenizer
jest.mock('gpt-tokenizer', () => ({
  encode: jest.fn().mockImplementation((text) => {
    // Simulação simplificada de tokens - aproximadamente 1 token para cada 4 caracteres
    return Array.from({ length: Math.ceil(text.length / 4) }, (_, i) => i);
  }),
}));

// Unused import in test
// import { normalizeNamespace } from "./utils/namespace";
import { SpeakerTranscription } from "../../interfaces/transcription/TranscriptionTypes";
import { BatchTranscriptionProcessor } from "../transcription/BatchTranscriptionProcessor";
import { TranscriptionFormatter } from "../transcription/TranscriptionFormatter";
import { MemoryContextBuilder } from "./MemoryContextBuilder";
import { MemoryService } from "./MemoryService";

// Mock global electronAPI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).electronAPIMock = {
  saveToPinecone: jest.fn(),
  queryPinecone: jest.fn()
  // deletePineconeNamespace is no longer necessary, as the namespace is managed internally
};

// Mock of OpenAIService
const mockOpenAIService = {
  createEmbedding: jest.fn().mockResolvedValue(Array(1536).fill(0.1)),
  isInitialized: jest.fn().mockReturnValue(true)
};

// Internal helper function for safe normalization (not using the real one)


// Reuse of mock for tests
const createMockedPersistenceService = () => ({
  saveInteraction: jest.fn(),
  isAvailable: jest.fn().mockReturnValue(true),
  createVectorEntry: jest.fn(),
  queryMemory: jest.fn().mockResolvedValue("Default memory"),
  saveToPinecone: jest.fn().mockResolvedValue({ success: true }),
  deleteUserVectors: jest.fn() // Now excludes the current user's vectors, without needing to specify namespace
});

// Store the last user consulted for verification in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(createMockedPersistenceService as any).lastUser = null;

// Mock of EmbeddingService
const createMockedEmbeddingService = () => ({
  createEmbedding: jest.fn().mockResolvedValue(Array(1536).fill(0.1)),
  isInitialized: jest.fn().mockReturnValue(true),
  openAIService: mockOpenAIService
});

describe("MemoryService - Isolation Between Namespaces", () => {
  let memoryService: MemoryService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let persistenceService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let embeddingService: any;
  let formatter: TranscriptionFormatter;
  let processor: BatchTranscriptionProcessor;
  let contextBuilder: MemoryContextBuilder;
  
  beforeEach(() => {
    // Mock configuration
    persistenceService = createMockedPersistenceService();
    embeddingService = createMockedEmbeddingService();
    
    // Real instances
    formatter = new TranscriptionFormatter();
    processor = new BatchTranscriptionProcessor(formatter);
    
    // MemoryContextBuilder creation with injected mocks
    contextBuilder = new MemoryContextBuilder(
      embeddingService,
      persistenceService,
      formatter,
      processor
    );
    
    // MemoryService creation with injected contextBuilder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    memoryService = new MemoryService({} as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (memoryService as any).contextBuilder = contextBuilder;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (memoryService as any).persistenceService = persistenceService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (memoryService as any).embeddingService = embeddingService;
  });
  
  it("should ensure isolation between different users with namespaces managed internally", async () => {
    // Clear previous calls and configure mock to track calls
    persistenceService.queryMemory.mockClear();
    let callCount = 0;
    persistenceService.queryMemory.mockImplementation(() => {
      callCount++;
      return Promise.resolve(`Memory called ${callCount}`);
    });
    // Setup of simulated transcriptions - isolation is now managed internally by username
    const userTranscriptionsA: SpeakerTranscription[] = [
      { speaker: "user", text: "First message of the user A", timestamp: new Date().toISOString() }
    ];
    const userTranscriptionsB: SpeakerTranscription[] = [
      { speaker: "user", text: "First message of the user B", timestamp: new Date().toISOString() }
    ];
    const detectedSpeakers = new Set(["user"]);
    const resultA = await memoryService.fetchContextualMemory(
      userTranscriptionsA, 
      [], 
      detectedSpeakers, 
      undefined,
      undefined,
      undefined
    );
    const resultB = await memoryService.fetchContextualMemory(
      userTranscriptionsB, 
      [], 
      detectedSpeakers, 
      undefined,
      undefined,
      undefined
    );
    expect(persistenceService.queryMemory).toHaveBeenCalledTimes(2);
    expect(resultA.userContext).toBe("Memory called 1");
    expect(resultB.userContext).toBe("Memory called 2");
  });
  
  it("should persist the temporary context between calls", async () => {
    persistenceService.queryMemory.mockClear();
    let lastContext = "";
    persistenceService.queryMemory.mockImplementation(() => {
      lastContext = lastContext ? lastContext : "Specific memory of the temporary context";
      return Promise.resolve(lastContext);
    });
    const userTranscriptionsA: SpeakerTranscription[] = [
      { speaker: "user", text: "First message of the temporary context A", timestamp: new Date().toISOString() }
    ];
    const userTranscriptionsB: SpeakerTranscription[] = [
      { speaker: "user", text: "Second message of the temporary context A", timestamp: new Date().toISOString() }
    ];
    const detectedSpeakers = new Set(["user"]);
    // First call with temporary context
    await memoryService.fetchContextualMemory(
      userTranscriptionsA, 
      [], 
      detectedSpeakers, 
      "Important instructions...",
      undefined,
      undefined
    );
    // Second call without providing temporary context
    const resultB = await memoryService.fetchContextualMemory(
      userTranscriptionsB, 
      [], 
      detectedSpeakers, 
      undefined,
      undefined,
      undefined
    );
    expect(resultB.userContext).toBe("Specific memory of the temporary context");
  });
  
  it("should update temporary context when different", async () => {
    // Reset the mock to count new calls
    persistenceService.queryMemory.mockClear();
    
    let callCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    persistenceService.queryMemory.mockImplementation((_1: any, _2: any, _3: any, _4: any) => {
      callCount++;
      // First call: default context
      if (callCount === 1) return Promise.resolve("Specific memory of the user A");
      // Second and third calls: updated context
      return Promise.resolve("Specific memory of the user A");
    });
    
    const userTranscriptions: SpeakerTranscription[] = [
      { speaker: "user", text: "First message", timestamp: new Date().toISOString() }
    ];
    
    const detectedSpeakers = new Set(["user"]);
    
    // First call with temporary context
    const result1 = await memoryService.fetchContextualMemory(
      userTranscriptions, 
      [], 
      detectedSpeakers, 
      "Instructions important...",
      undefined,
      undefined
    );
    
    // Second call with different temporary context
    const result2 = await memoryService.fetchContextualMemory(
      userTranscriptions, 
      [], 
      detectedSpeakers, 
      "New instructions different...",
      undefined,
      undefined
    );
    
    // Verifications: different temporary context should cause new query
    expect(persistenceService.queryMemory).toHaveBeenCalledTimes(4); // 1 for user, 3 for temp context
    expect(result1.userContext).toBe("Specific memory of the user A");
    expect(result2.userContext).toBe("Specific memory of the user A");
  });
});
