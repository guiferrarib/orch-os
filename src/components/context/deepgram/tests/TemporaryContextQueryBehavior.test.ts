// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TemporaryContextQueryBehavior.test.ts
// Tests to verify Pinecone query behavior when temporary context changes

import { IPersistenceService } from "../interfaces/memory/IPersistenceService";
import { IEmbeddingService } from "../interfaces/openai/IEmbeddingService";
import { SpeakerTranscription } from "../interfaces/transcription/TranscriptionTypes";
import { MemoryContextBuilder } from "../services/memory/MemoryContextBuilder";
import { BatchTranscriptionProcessor } from "../services/transcription/BatchTranscriptionProcessor";
import { TranscriptionContextManager } from "../services/transcription/TranscriptionContextManager";
import { TranscriptionFormatter } from "../services/transcription/TranscriptionFormatter";

describe("TemporaryContextQueryBehavior", () => {
  let memoryContextBuilder: MemoryContextBuilder;
  let contextManager: TranscriptionContextManager;
  let mockCreateEmbedding: jest.Mock<Promise<number[]>, [string]>;
  
  // Query tracking for tests
  const queryTracker = {
    calls: 0,
    contexts: [] as string[],
    reset() {
      this.calls = 0;
      this.contexts = [];
    }
  };
  
  // Mocks
  const mockEmbeddingService: IEmbeddingService = {
    isInitialized: jest.fn().mockReturnValue(true),
    createEmbedding: jest.fn(),
    initialize: jest.fn().mockResolvedValue(true)
  };

  const mockPersistenceService: IPersistenceService = {
    saveToPinecone: jest.fn().mockResolvedValue(undefined),

    isAvailable: jest.fn().mockReturnValue(true),
    saveInteraction: jest.fn().mockResolvedValue(undefined),
    createVectorEntry: jest.fn().mockReturnValue({}),
    queryMemory: jest.fn().mockResolvedValue("")
  };
  
  // Mock for queryMemory that tracks queries
  mockPersistenceService.queryMemory = jest.fn().mockImplementation(async (embedding: number[], /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ _topK?: number, /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ _keywords?: string[]) => {
    // Track calls
    queryTracker.calls++;
    queryTracker.contexts.push(embedding.toString());
    
    return `Memory for embedding [${embedding.join(', ')}]`;
  });
  
  beforeEach(() => {
    // Reset mocks and state
    jest.clearAllMocks();
    queryTracker.reset();

    mockCreateEmbedding = (mockEmbeddingService.createEmbedding as jest.Mock).mockImplementation((text: string) => {
      return Promise.resolve([text.length, text.charCodeAt(0) || 0]);
    });
    
    // Reset singleton
    contextManager = TranscriptionContextManager.getInstance();
    contextManager.clearTemporaryContext();
    
    // Create clean instance for each test
    const formatter = new TranscriptionFormatter();
    const processor = new BatchTranscriptionProcessor(formatter);
    memoryContextBuilder = new MemoryContextBuilder(
      mockEmbeddingService,
      mockPersistenceService,
      formatter,
      processor
    );
    
    // Reset builder state
    memoryContextBuilder.resetAll();
  });
  
  // Basic data used in tests
  const baseTranscriptions: SpeakerTranscription[] = [
    { speaker: "User", text: "Basic test", timestamp: "2023-01-01T10:00:00Z" }
  ];
  
  test("Should make new Pinecone query when instructions are modified", async () => {
    // 1. Define initial instructions
    const initialInstructions = "Initial instructions for test";
    
    // 2. First query with initial instructions
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialInstructions
    );
    
    // Should make new Pinecone query when instructions are modified
    expect(queryTracker.calls).toBe(2); // One for temporary context, one for transcription
    expect(mockCreateEmbedding).toHaveBeenCalledWith(initialInstructions);
    queryTracker.reset();
    
    // 3. Second query with the same instructions
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialInstructions
    );
    
    // Should not make new Pinecone query when instructions are the same
    expect(queryTracker.calls).toBe(1); // Only for transcription
    queryTracker.reset();
    
    // 4. Third query with modified instructions
    const modifiedInstructions = "Modified instructions for test";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), modifiedInstructions
    );
    
    // Should make new Pinecone query when instructions are modified
    expect(queryTracker.calls).toBe(2); // New query for modified context + transcription
    expect(mockCreateEmbedding).toHaveBeenCalledWith(modifiedInstructions);
    queryTracker.reset();
  });
  
  test("Small modifications in instructions should generate new query", async () => {
    // 1. Initial instructions
    const baseInstructions = "Detailed instructions for the assistant to follow";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), baseInstructions
    );
    expect(queryTracker.calls).toBe(2);
    expect(mockCreateEmbedding).toHaveBeenCalledWith(baseInstructions);
    queryTracker.reset();
    mockCreateEmbedding.mockClear();
    
    // 2. Instructions with small modification (additional punctuation)
    const slightlyModifiedInstructions = "Detailed instructions for the assistant to follow.";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), slightlyModifiedInstructions
    );
    
    // Should detect the change and make new query
    expect(queryTracker.calls).toBe(2);
    expect(mockCreateEmbedding).toHaveBeenCalledWith(slightlyModifiedInstructions);
    queryTracker.reset();
  });
  
  test("Format modifications (extra spaces) should generate new query", async () => {
    // 1. Initial instructions
    const baseInstructions = "Detailed instructions for the assistant to follow";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), baseInstructions
    );
    expect(queryTracker.calls).toBe(2);
    expect(mockCreateEmbedding).toHaveBeenCalledWith(baseInstructions);
    queryTracker.reset();
    mockCreateEmbedding.mockClear();
    
    // 2. Instructions with extra spaces
    const formattedInstructions = "Detailed instructions for the assistant to follow";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), formattedInstructions
    );
    
    // Should detect the change and make new query
    expect(queryTracker.calls).toBe(1);
    expect(mockCreateEmbedding).toHaveBeenCalledWith("Basic test");
    queryTracker.reset();
  });
  
  test("Embeddings should be different for different instructions", async () => {
    // 1. Initial instructions and their embedding
    const initialInstructions = "Detailed instructions for the assistant to follow";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialInstructions
    );
    
    const initialEmbeddingCall = mockCreateEmbedding.mock.calls[0][0];
    expect(initialEmbeddingCall).toBe(initialInstructions);
    
    mockCreateEmbedding.mockClear();
    queryTracker.reset();
    
    // 2. Different instructions and their embedding
    const updatedInstructions = "Detailed instructions for the assistant to follow";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), updatedInstructions
    );
    
    const updatedEmbeddingCall = mockCreateEmbedding.mock.calls[0][0];
    expect(updatedEmbeddingCall).toBe("Basic test");
    
    // Should verify that the texts passed to createEmbedding are different
    expect(initialEmbeddingCall).not.toBe(updatedEmbeddingCall);
  });
  
  test("Should preserve memory when the same query is made", async () => {
    // 1. Initial query
    const instructions = "Instruções para preservação de memória";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), instructions
    );
    
    // 2. Store the memory of the first query
    const initialMemory = contextManager.getTemporaryContextMemory();
    expect(mockCreateEmbedding).toHaveBeenCalledWith(instructions);
    mockCreateEmbedding.mockClear();
    
    // 2. Second query with the same instructions
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), instructions
    );
    
    // Should not call createEmbedding for the context again
    expect(mockCreateEmbedding).not.toHaveBeenCalledWith(instructions);
    
    // Should verify that the memory remains the same
    const secondMemory = contextManager.getTemporaryContextMemory();
    expect(secondMemory).toBe(initialMemory);
  });
  
  test("Dynamic context that changes between calls should generate new query", async () => {
    // 1. Create a dynamic context object (as it would be in production)
    const dynamicContext = {
      instructions: "Dynamic instructions version original",
      get value() { return this.instructions; }
    };
    
    // 2. First query with original value
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), dynamicContext.value
    );
    
    // Should verify that createEmbedding was called with the original context
    expect(mockCreateEmbedding).toHaveBeenCalledWith(dynamicContext.value);
    const originalEmbeddingCall = mockCreateEmbedding.mock.calls[0][0];
    mockCreateEmbedding.mockClear();
    queryTracker.reset();
    
    // 3. Modify the dynamic context object after the first call
    dynamicContext.instructions = "Dynamic instructions version modified";
    
    // 4. Second query with the modified object
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), dynamicContext.value
    );
    
    // Should verify that createEmbedding was called with the modified context
    expect(mockCreateEmbedding).toHaveBeenCalledWith(dynamicContext.value);
    const modifiedEmbeddingCall = mockCreateEmbedding.mock.calls[0][0];
    
    // Should verify that the contexts passed to createEmbedding are different
    expect(originalEmbeddingCall).not.toBe(modifiedEmbeddingCall);
    
    // Should detect the change and make new query
    expect(queryTracker.calls).toBe(2);
  });
}); 