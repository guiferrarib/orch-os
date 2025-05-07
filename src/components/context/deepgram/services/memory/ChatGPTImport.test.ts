// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { createHash } from 'crypto';

// Defining mocks for the test context
const mockSend = jest.fn();
const mockSaveToPinecone = jest.fn().mockResolvedValue({ success: true });
const mockIsDestroyed = jest.fn().mockReturnValue(false);

// Type to simulate the Electron event
interface MockElectronEvent {
  sender: {
    send: jest.Mock;
    isDestroyed: jest.Mock;
  };
}

// Mock of dependencies for the IPC handler
const mockDeps = {
  pineconeHelper: {
    saveToPinecone: mockSaveToPinecone
  },
  openAIService: {
    createEmbeddings: jest.fn().mockResolvedValue([])
  }
};

// Interface for a Pinecone vector
interface PineconeVector {
  id: string;
  values: number[];
  metadata: Record<string, string | number | boolean>;
}

// Note: The parseChatGPTExport function previously imported from ConversationImportService
// was removed as this functionality is now implemented directly in importChatGPTHandler.ts

// Helper functions to be tested
const normalizeVector = (vector: number[]): number[] => {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vector.map(() => 0);
  return vector.map(val => val / magnitude);
};

const splitIntoChunks = (text: string, chunkSize: number): string[] => {
  const chunks: string[] = [];
  const avgCharsPerToken = 4; // Estimativa para português/inglês
  const charChunkSize = chunkSize * avgCharsPerToken;
  
  for (let i = 0; i < text.length; i += charChunkSize) {
    chunks.push(text.substring(i, i + charChunkSize));
  }
  
  return chunks;
};

// Function to process a batch of vectors
const processBatch = async (
  batchToProcess: PineconeVector[], 
  deps: typeof mockDeps,
  event: MockElectronEvent,
  processedMessageIndices: Set<number>,
  processedChunks: number,
  total: number
): Promise<{ processedMessages: number, processedChunks: number }> => {
  if (batchToProcess.length === 0) return { processedMessages: processedMessageIndices.size, processedChunks };
  
  try {
    if (deps.pineconeHelper) {
      await deps.pineconeHelper.saveToPinecone(batchToProcess);
      processedChunks += batchToProcess.length;
      
      // Register processed message indices
      batchToProcess.forEach(item => {
        if (typeof item.metadata.messageIndex === 'number') {
          processedMessageIndices.add(item.metadata.messageIndex as number);
        }
      });
      
      const processedMessages = processedMessageIndices.size;
      const progressPercent = Math.round((processedMessages / total) * 100);
      
      // Report progress via event
      if (!event.sender.isDestroyed()) {
        event.sender.send('import-progress', { 
          processed: processedMessages, 
          total: total,
          chunks: processedChunks,
          percent: progressPercent
        });
      }
      
      return { processedMessages, processedChunks };
    } else {
      throw new Error("Pinecone helper não está disponível");
    }
  } catch (error) {
    console.error("Erro ao salvar lote no Pinecone:", error);
    throw error;
  }
};

describe('ChatGPT Import with Chunking', () => {
  beforeEach(() => {
    // Clear mocks before each test
    mockSend.mockClear();
    mockSaveToPinecone.mockClear();
    mockIsDestroyed.mockClear();
  });
  
  it('should correctly split a long message into chunks', () => {
    // Mensagem que excede o tamanho de chunk
    const longText = 'A'.repeat(10000); // 10.000 caracteres (aprox. 2500 tokens)
    const CHUNK_SIZE = 1000; // 1000 tokens por chunk
    
    const chunks = splitIntoChunks(longText, CHUNK_SIZE);
    
    // Deve criar 3 chunks (considerando estimativa de 4 chars/token)
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(CHUNK_SIZE * 4);
  });
  
  it('should track progress correctly while processing chunks', async () => {
    // Create mock of Electron event
    const mockEvent: MockElectronEvent = {
      sender: {
        send: mockSend,
        isDestroyed: mockIsDestroyed
      }
    };
    
    // Prepare test data
    const processedMessageIndices = new Set<number>();
    let processedChunks = 0;
    const total = 5; // Total of messages
    
    // Create multiple batches of vectors simulating message chunks
    const batches = [
      // Batch 1: Chunks of messages 0 and 1
      [
        {
          id: `msg-0-chunk-1`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 0, part: "1/2", content: "Parte 1" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-0-chunk-2`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 0, part: "2/2", content: "Parte 2" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-1-chunk-1`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 1, part: "1/1", content: "Mensagem única" } as Record<string, string | number | boolean>
        }
      ],
      
      // Batch 2: Message 2
      [
        {
          id: `msg-2-chunk-1`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 2, part: "1/1", content: "Outra mensagem" } as Record<string, string | number | boolean>
        }
      ],
      
      // Batch 3: Messages 3 and 4 (with multiple chunks)
      [
        {
          id: `msg-3-chunk-1`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 3, part: "1/3", content: "Chunk 1" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-3-chunk-2`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 3, part: "2/3", content: "Chunk 2" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-3-chunk-3`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 3, part: "3/3", content: "Chunk 3" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-4-chunk-1`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 4, part: "1/2", content: "Último chunk 1" } as Record<string, string | number | boolean>
        },
        {
          id: `msg-4-chunk-2`,
          values: Array(1536).fill(0.1),
          metadata: { messageIndex: 4, part: "2/2", content: "Último chunk 2" } as Record<string, string | number | boolean>
        }
      ]
    ];
    
    // Process each batch and verify progress
    const results = [];
    for (const batch of batches) {
      const result = await processBatch(
        batch, 
        mockDeps, 
        mockEvent, 
        processedMessageIndices, 
        processedChunks, 
        total
      );
      
      processedChunks = result.processedChunks;
      results.push({
        messagesProcessed: result.processedMessages,
        chunksProcessed: result.processedChunks,
        expectedProgress: Math.round((result.processedMessages / total) * 100)
      });
    }
    
    // Verifications
    expect(results.length).toBe(3); // Processed 3 batches
    
    // After processing, verify the final state
    expect(mockSaveToPinecone).toHaveBeenCalledTimes(3); // One per batch
    expect(processedMessageIndices.size).toBe(5); // Processed all 5 messages
    expect(processedChunks).toBe(9); // Total of chunks in all batches
    
    // Verify if progress was reported correctly
    expect(mockSend).toHaveBeenCalledTimes(3); // One per batch
    
    // Verify the last progress event
    const lastProgressCall = mockSend.mock.calls[2][1];
    expect(lastProgressCall.processed).toBe(5);
    expect(lastProgressCall.total).toBe(5);
    expect(lastProgressCall.chunks).toBe(9);
    expect(lastProgressCall.percent).toBe(100);
  });
  
  it('should calculate correct metadata for chunks', () => {
    // Message simulation
    const messages = [
      { role: 'user', content: 'A'.repeat(8000), timestamp: new Date().toISOString() },
      { role: 'assistant', content: 'B'.repeat(2000), timestamp: new Date().toISOString() }
    ];
    
    const CHUNK_SIZE = 1000;
    const MAX_CONTENT_LENGTH = 40000;
    const vectorBatch: PineconeVector[] = [];
    
    // Process messages similar to the main handler
    messages.forEach((message, i) => {
      // Generate hash for deduplication
      const hash = createHash('sha256').update(message.content).digest('hex');
      
      // Split content into chunks if it's large
      const contentChunks = splitIntoChunks(message.content, CHUNK_SIZE);
      
      // Create a vector for each chunk
      for (let chunkIndex = 0; chunkIndex < contentChunks.length; chunkIndex++) {
        const chunkContent = contentChunks[chunkIndex];
        // Use empty string instead of null for Pinecone compatibility
        const partInfo = contentChunks.length > 1 ? `${chunkIndex + 1}/${contentChunks.length}` : "";
        
        // Generate unique ID for the vector
        const vectorId = `chatgpt-${Date.now()}-${i}-${chunkIndex}-${hash.substring(0, 8)}`;
        
        // Create dummy vector for testing
        const dummyVector = Array(1536).fill(0.1);
        const normalizedVector = normalizeVector(dummyVector);
        
        // Garantir que o conteúdo não exceda o limite do Pinecone
        const truncatedContent = chunkContent.length > MAX_CONTENT_LENGTH
          ? chunkContent.substring(0, MAX_CONTENT_LENGTH - 3) + '...'
          : chunkContent;
        
        // Adicionar ao lote
        vectorBatch.push({
          id: vectorId,
          values: normalizedVector,
          metadata: {
            role: message.role,
            content: truncatedContent,
            timestamp: message.timestamp,
            source: "chatgpt_import",
            user: "test_user",
            hash: hash,
            messageIndex: i,
            part: partInfo,
            order: i * 1000 + chunkIndex // Preserva a ordem original
          }
        });
      }
    });
    
    // Verifications
    expect(vectorBatch.length).toBeGreaterThan(2); // Should have more chunks than original messages
    
    // Verify specific metadata
    const firstMessageChunks = vectorBatch.filter(v => v.metadata.messageIndex === 0);
    
    // The first message should have been split into multiple chunks
    expect(firstMessageChunks.length).toBeGreaterThan(1);
    expect(firstMessageChunks[0].metadata.part).toBe("1/" + firstMessageChunks.length);
    
    // Verify ordering
    expect(firstMessageChunks[0].metadata.order).toBe(0); // 0 * 1000 + 0
    if (firstMessageChunks.length > 1) {
      expect(firstMessageChunks[1].metadata.order).toBe(1); // 0 * 1000 + 1
    }
    
    // Verify truncated content if necessary
    firstMessageChunks.forEach(chunk => {
      expect((chunk.metadata.content as string).length).toBeLessThanOrEqual(MAX_CONTENT_LENGTH);
    });
  });
});
