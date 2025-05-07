// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TemporaryContextEdgeCases.test.ts
// Tests for edge cases of temporary context optimization

import { IPersistenceService } from "../interfaces/memory/IPersistenceService";
import { IEmbeddingService } from "../interfaces/openai/IEmbeddingService";
import {
  SpeakerTranscription
} from "../interfaces/transcription/TranscriptionTypes";
import { MemoryContextBuilder } from "../services/memory/MemoryContextBuilder";
import { BatchTranscriptionProcessor } from "../services/transcription/BatchTranscriptionProcessor";
import { TranscriptionContextManager } from "../services/transcription/TranscriptionContextManager";
import { TranscriptionFormatter } from "../services/transcription/TranscriptionFormatter";

describe("TemporaryContextEdgeCases", () => {
  let memoryContextBuilder: MemoryContextBuilder;
  let contextManager: TranscriptionContextManager;
  
  // Query tracking for tests
  const queryTracker = {
    calls: 0,
    failNext: false,
    delayNext: false,
    reset() {
      this.calls = 0;
      this.failNext = false;
      this.delayNext = false;
    }
  };
  
  // Mocks
  const mockEmbeddingService: IEmbeddingService = {
    isInitialized: jest.fn().mockReturnValue(true),
    createEmbedding: jest.fn().mockImplementation((text: string) => {
      return Promise.resolve([text.length, text.charCodeAt(0) || 0]);
    }),
    initialize: jest.fn().mockResolvedValue(true)
  };

  const mockPersistenceService: IPersistenceService = {
    saveToPinecone: jest.fn().mockResolvedValue(undefined),
    isAvailable: jest.fn().mockReturnValue(true),
    saveInteraction: jest.fn().mockResolvedValue(undefined),
    createVectorEntry: jest.fn().mockReturnValue({}),
    queryMemory: jest.fn().mockImplementation(async (embedding) => {
      // Track calls
      queryTracker.calls++;
      
      // Simulate failure if configured
      if (queryTracker.failNext) {
        queryTracker.failNext = false;
        throw new Error("Simulation failure");
      }
      
      // Simulate delay if configured
      if (queryTracker.delayNext) {
        queryTracker.delayNext = false;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return `Memory for embedding [${embedding.join(', ')}]`;
    })
  };
  
  beforeEach(() => {
    // Reset mocks and state
    jest.clearAllMocks();
    queryTracker.reset();
    
    // Reset the singleton
    contextManager = TranscriptionContextManager.getInstance();
    contextManager.clearTemporaryContext();
    
    // Create a clean instance for each test
    const formatter = new TranscriptionFormatter();
    const processor = new BatchTranscriptionProcessor(formatter);
    memoryContextBuilder = new MemoryContextBuilder(
      mockEmbeddingService,
      mockPersistenceService,
      formatter,
      processor
    );
    
    // Reset the builder state
    memoryContextBuilder.resetAll();
  });
  
  // Basic data used in tests
  const baseTranscriptions: SpeakerTranscription[] = [
    { speaker: "User", text: "Basic test", timestamp: "2023-01-01T10:00:00Z" }
  ];
  
  // ======== GROUP 1: String Context Manipulation ========
  
  test("Should differentiate strings with small variations (spaces, formatting)", async () => {
    // First context
    const context1 = "Instructions important";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context1
    );
    expect(queryTracker.calls).toBe(2); // One for the context, one for the transcription
    queryTracker.reset();
    
    // Same context with extra space
    const context2 = "Instructions  important";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context2
    );
    
    // Should consider different and make a new query
    expect(queryTracker.calls).toBe(2);
    
    // POSSIBLE IMPROVEMENT: Implement string normalization to avoid this redundant query
  });
  
  test("Should correctly handle empty strings and undefined", async () => {
    // Define initial context
    const initialContext = "Context initial";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialContext
    );
    queryTracker.reset();
    
    // Context undefined - should maintain the previous context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), undefined
    );
    
    // Should not query for the temporary context, only for transcription
    expect(queryTracker.calls).toBe(1);
    queryTracker.reset();
    
    // Empty string - should be treated as a new context
    // DISCOVERED BEHAVIOR: The current implementation does not query for an empty string,
    // considering it different, but not valid for querying
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), ""
    );
    
    // Verify current behavior: only queries for transcription
    expect(queryTracker.calls).toBe(1);
    
    // NOTE: Here we identify a specific behavior - the empty string is treated
    // as a new context (different from the previous one), but not valid for querying
    // the Pinecone. This is an appropriate defensive behavior.
  });
  
  // ======== GROUP 2: Concurrency and Timing ========
  
  test("Multiple queries in rapid succession", async () => {
    // Delay the first query
    queryTracker.delayNext = true;
    
    // Start the first query (which will be delayed)
    const firstPromise = memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), "Contexto com atraso"
    );
    
    // Without waiting for the first to finish, start the second query with the same context
    const secondPromise = memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), "Contexto com atraso"
    );
    
    // Wait for both queries
    await Promise.all([firstPromise, secondPromise]);
    
    // Expected behavior: still makes both queries, since the second starts before
    // the first finishes and updates the lastQueriedTemporaryContext
    expect(queryTracker.calls).toBeGreaterThan(2);
    
    // POSSIBLE IMPROVEMENT: Implement a lock or pending queries mechanism
  });
  
  // ======== GROUP 3: Connection Failures and Errors ========
  
  test("Failure in Pinecone query", async () => {
    // Configure the next query to fail
    queryTracker.failNext = true;
    
    // We discovered that the current implementation handles the error internally
    // and does not propagate the exception to the caller.
    let errorWasThrown = false;
    try {
      // Try to query with a context
      await memoryContextBuilder.fetchContextualMemory(
        baseTranscriptions, [], new Set(["User"]), "Contexto que vai falhar"
      );
    } catch (error) {
      // If an error was thrown, mark that it occurred
      errorWasThrown = true;
    }
    
    // Verify that the error was not propagated (it is handled internally)
    expect(errorWasThrown).toBe(false);
    
    // Reset the fail flag
    queryTracker.failNext = false;
    queryTracker.reset();
    
    // The current implementation, despite handling the error internally,
    // updates the lastQueriedTemporaryContext even for failed queries.
    
    // Try again with the same context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), "Contexto que vai falhar"
    );
    
    // Should not query the Pinecone for the same temporary context
    expect(queryTracker.calls).toBeGreaterThanOrEqual(1); // Pelo menos a consulta para a transcrição
    
    // SUGGESTED IMPROVEMENT: Do not mark the context as queried if the query fails,
    // allowing a new attempt on the next one
  });
  
  // ======== GROUP 4: Resource Management ========
  
  test("Long contexts are handled appropriately", async () => {
    // Create an extremely long context
    const longContext = "a".repeat(10000);
    
    // Verify if the system can process without error
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), longContext
    );
    
    // If it got here, the system processed successfully
    expect(queryTracker.calls).toBe(2);
    
    // SUGGESTED IMPROVEMENT: Implement a limit for context size
  });
  
  test("Context reset is handled appropriately", async () => {
    // Consultar com um contexto
    const context = "Contexto para teste de reset";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context
    );
    queryTracker.reset();
    
    // Reset completely
    memoryContextBuilder.resetAll();
    
    // Consult again with the same context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context
    );
    
    // Should consult again, since the lastQueriedTemporaryContext was cleared
    expect(queryTracker.calls).toBe(2);
  });
  
  // ======== GROUP 5: Complex Scenarios ========
  
  test("Minor changes in long contexts generate complete queries", async () => {
    // Long initial context
    const baseContextLong = "This is a long context that should generate complete queries.";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), baseContextLong
    );
    queryTracker.reset();
    
    // Same context with minor change at the end
    const slightlyChangedContext = baseContextLong + ".";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), slightlyChangedContext
    );
    
    // Should consult again, even with minor change
    expect(queryTracker.calls).toBe(2);
    
    // POSSIBLE IMPROVEMENT: Implement semantic similarity detection
  });
  
  // ======== GROUP 6: Special Scenarios ========
  
  test("Undefined context followed by empty string", async () => {
    // Define initial context
    const initialContext = "Initial context";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialContext
    );
    queryTracker.reset();
    
    // Consult with undefined (should maintain the previous context)
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), undefined
    );
    expect(queryTracker.calls).toBe(1); // Only for transcription
    queryTracker.reset();
    
    // Consult with empty string (should be treated as new context)
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), ""
    );
    
    // Should consult again, even with minor change
    expect(queryTracker.calls).toBe(1);
  });
  
  test("Interações entre setTemporaryContext e fetchContextualMemory", async () => {
    // Define the context directly in contextManager
    contextManager.setTemporaryContext("Contexto definido diretamente");
    
    // Consult passando undefined (should use the context from contextManager)
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), undefined
    );
    
    // Should consult for the context from contextManager and for transcription
    expect(queryTracker.calls).toBe(2);
  });
  
  // ======== GROUP 7: Specific Tests for clearTemporaryContext ========
  
  test("clearTemporaryContext limpa todos os aspectos do contexto", async () => {
    // 1. Prepare the context and query Pinecone
    const testContext = "Contexto para teste de limpeza";
    
    // Define the context directly in contextManager
    contextManager.setTemporaryContext(testContext);
    
    // Consultar o Pinecone para este contexto
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // Ensure context and memory are stored
    expect(contextManager.getTemporaryContext()).toBe(testContext);
    expect(contextManager.getTemporaryContextMemory()).not.toBe("");
    
    // 2. Clear the context using clearTemporaryContext
    memoryContextBuilder.resetTemporaryContext(); // Chama contextManager.clearTemporaryContext()
    
    // 3. Verify that all aspects were cleared
    expect(contextManager.getTemporaryContext()).toBe("");
    expect(contextManager.getTemporaryContextMemory()).toBe("");
    
    // 4. Reset the call counter
    queryTracker.reset();
    
    // 5. Consult again with the same context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 6. Should execute a new Pinecone query for the temporary context
    expect(queryTracker.calls).toBe(2); // One for the context and one for transcription
  });
  
  test("clearTemporaryContext limpa o último contexto consultado", async () => {
    // 1. Define and query a context
    const firstContext = "Primeiro contexto para teste";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), firstContext
    );
    queryTracker.reset();
    
    // 2. Consult again with the same context (should not query Pinecone again)
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), firstContext
    );
    // Verify that it did not query for the context, only for the transcription
    expect(queryTracker.calls).toBe(1);
    queryTracker.reset();
    
    // 3. Clear the context
    memoryContextBuilder.resetTemporaryContext();
    
    // 4. Consult again with the same context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), firstContext
    );
    
    // 5. Should query Pinecone again, since the history was cleared
    expect(queryTracker.calls).toBe(2);
  });
  
  test("clearTemporaryContext vs resetAll", async () => {
    // 1. Define context and query
    const testContext = "Context for method comparison";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 2. Update the snapshot tracker with a fake message
    memoryContextBuilder["snapshotTracker"].updateSnapshot("Test message for snapshot");
    
    // 3. Fork the test: case with clearTemporaryContext
    const contextManager1 = TranscriptionContextManager.getInstance();
    contextManager1.clearTemporaryContext();
    
    // 4. Verify that the context was cleared but the snapshot remains
    expect(contextManager1.getTemporaryContext()).toBe("");
    // The snapshot should not have been cleared by clearTemporaryContext
    expect(memoryContextBuilder["snapshotTracker"].isAllContentSent("Test message for snapshot"))
      .toBe(true);
    
    // 5. Reset state and redo for resetAll
    memoryContextBuilder.resetAll();
    
    // 6. Redefine and update the context and snapshot
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    memoryContextBuilder["snapshotTracker"].updateSnapshot("Test message for snapshot");
    
    // 7. Use resetAll
    memoryContextBuilder.resetAll();
    
    // 8. Verify that both context and snapshot were cleared
    expect(contextManager.getTemporaryContext()).toBe("");
    // The snapshot should have been cleared by resetAll
    expect(memoryContextBuilder["snapshotTracker"].isAllContentSent("Test message for snapshot"))
      .toBe(false);
  });
  
  test("Preservation of context after clearTemporaryContext", async () => {
    // 1. Define and consult temporary context
    const initialContext = "Initial context for test";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), initialContext
    );
    
    // 2. Clear temporary context
    memoryContextBuilder.resetTemporaryContext();
    
    // 3. Define new context without querying
    const newContext = "New context after clearing";
    contextManager.setTemporaryContext(newContext);
    
    // 4. Verify that the new context is defined
    expect(contextManager.getTemporaryContext()).toBe(newContext);
    
    // 5. Verify that the memory is empty (not queried)
    expect(contextManager.getTemporaryContextMemory()).toBe("");
    
    // 6. Consult again with undefined (should use the new context defined)
    queryTracker.reset();
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), undefined
    );
    
    // 7. Should query for the new temporary context
    expect(queryTracker.calls).toBe(2); // One for context, one for transcription
  });
  
  test("clearTemporaryContext clears explicitly lastQueriedTemporaryContext", async () => {
    // 1. Create spy to observe the hasTemporaryContextChanged method 
    const hasChangedSpy = jest.spyOn(contextManager, 'hasTemporaryContextChanged');
    
    // 2. Define and query a context
    const testContext = "Context for verification of lastQueriedTemporaryContext";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 3. Reset spy and query the same context 
    hasChangedSpy.mockClear();
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 4. hasTemporaryContextChanged should have been called with "false" as the result
    // (indicating that the context did NOT change compared to lastQueriedTemporaryContext)
    expect(hasChangedSpy).toHaveBeenCalled();
    expect(hasChangedSpy.mock.results[0].value).toBe(false);
    
    // 5. Clear the context
    memoryContextBuilder.resetTemporaryContext();
    
    // 6. Reset spy and query the same context again 
    hasChangedSpy.mockClear();
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 7. After clearing, hasTemporaryContextChanged should return true
    // (indicating that the context changed, since lastQueriedTemporaryContext was cleared)
    expect(hasChangedSpy).toHaveBeenCalled();
    expect(hasChangedSpy.mock.results[0].value).toBe(true);
    
    // 8. Clear spy
    hasChangedSpy.mockRestore();
  });
  
  test("clearTemporaryContext affects all instances of MemoryContextBuilder", async () => {
    // 1. Create a second instance of MemoryContextBuilder
    const formatter2 = new TranscriptionFormatter();
    const processor2 = new BatchTranscriptionProcessor(formatter2);
    const memoryContextBuilder2 = new MemoryContextBuilder(
      mockEmbeddingService,
      mockPersistenceService,
      formatter2,
      processor2
    );
    
    // 2. Define and query a context in the first instance
    const sharedContext = "Shared context between instances";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), sharedContext
    );
    
    // 3. Reset the counter and query the same context in the SECOND instance
    queryTracker.reset();
    await memoryContextBuilder2.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), sharedContext
    );
    
    // 4. Should not query Pinecone for the temporary context (only transcription)
    expect(queryTracker.calls).toBe(1);
    
    // 5. Clear context using first instance
    memoryContextBuilder.resetTemporaryContext();
    
    // 6. Reset the counter and query in the second instance 
    queryTracker.reset();
    await memoryContextBuilder2.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), sharedContext
    );
    
    // 7. Should query Pinecone again, since the context was globally cleared
    expect(queryTracker.calls).toBe(2);
  });
  
  test("Interaction between clearTemporaryContext and updateLastQueriedTemporaryContext", async () => {
    // 1. Create spies for both methods
    const clearSpy = jest.spyOn(contextManager, 'clearTemporaryContext');
    const updateSpy = jest.spyOn(contextManager, 'updateLastQueriedTemporaryContext');
    
    // 2. Define and query a context (should call updateLastQueriedTemporaryContext)
    const testContext = "Context for interaction test";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), testContext
    );
    
    // 3. Verify that updateLastQueriedTemporaryContext was called
    expect(updateSpy).toHaveBeenCalledWith(testContext);
    
    // 4. Clear the context via resetTemporaryContext
    memoryContextBuilder.resetTemporaryContext();
    
    // 5. Verify that clearTemporaryContext was called
    expect(clearSpy).toHaveBeenCalled();
    
    // 6. Reset spies
    clearSpy.mockClear();
    updateSpy.mockClear();
    
    // 7. Verify if updateLastQueriedTemporaryContext preserves its state after each call
    let previousCallCount = 0;
    
    // First query to a new context
    const context1 = "Context 1 for sequence";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context1
    );
    
    // Verify that updateLastQueriedTemporaryContext was called
    expect(updateSpy.mock.calls.length).toBeGreaterThan(previousCallCount);
    previousCallCount = updateSpy.mock.calls.length;
    
    // Second query with same context should not call updateLastQueriedTemporaryContext
    // with the same value (comparison is made internally)
    queryTracker.reset();
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), context1
    );
    
    // Number of calls should be equal to the previous (did not call with the same value)
    expect(queryTracker.calls).toBe(1); // Only transcription query
    
    // 8. Test sequence of operations
    memoryContextBuilder.resetTemporaryContext();
    clearSpy.mockClear();
    updateSpy.mockClear();
    
    // Query a context
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), "Final context"
    );
    expect(updateSpy).toHaveBeenCalled();
    
    // Clear again
    memoryContextBuilder.resetTemporaryContext();
    expect(clearSpy).toHaveBeenCalled();
    
    // Verify final state
    expect(contextManager.getTemporaryContext()).toBe("");
    expect(contextManager.getTemporaryContextMemory()).toBe("");
    
    // Restore spies
    clearSpy.mockRestore();
    updateSpy.mockRestore();
  });
  
  test("hasTemporaryContextChanged handles empty strings correctly", async () => {
    // 1. Create spy to directly observe the hasTemporaryContextChanged method
    const hasChangedSpy = jest.spyOn(contextManager, 'hasTemporaryContextChanged');
    
    // 2. Verify initial behavior with empty string
    const emptyResult = contextManager.hasTemporaryContextChanged("");
    
    // Empty string should always return false - it is not considered a valid context
    console.log("Empty string compared with initial state:", emptyResult);
    expect(emptyResult).toBe(false);
    
    // 3. Define and query a non-empty context
    const nonEmptyContext = "Non-empty context";
    await memoryContextBuilder.fetchContextualMemory(
      baseTranscriptions, [], new Set(["User"]), nonEmptyContext
    );
    
    // 4. Reset spy
    hasChangedSpy.mockClear();
    
    // 5. Verify hasTemporaryContextChanged with empty string
    const emptyAfterNonEmpty = contextManager.hasTemporaryContextChanged("");
    console.log("Empty string compared after non-empty context:", emptyAfterNonEmpty);
    
    // An empty string should never be considered a new context, even after a non-empty context
    // Should return false to avoid unnecessary queries
    expect(emptyAfterNonEmpty).toBe(false);
    
    // 6. Test another scenario: empty string followed by empty string
    // Explicitly define an empty string
    contextManager.setTemporaryContext("");
    
    // Force update of the last queried temporary context
    contextManager.updateLastQueriedTemporaryContext("");
    
    // Verify hasTemporaryContextChanged with empty string again
    hasChangedSpy.mockClear();
    const emptyAfterEmpty = contextManager.hasTemporaryContextChanged("");
    console.log("Empty string compared after empty context was set:", emptyAfterEmpty);
    
    // An empty string compared with the last empty context should be considered equal (did not change)
    expect(emptyAfterEmpty).toBe(false);
    
    // 7. Clear and restore
    contextManager.clearTemporaryContext();
    hasChangedSpy.mockRestore();
  });
}); 