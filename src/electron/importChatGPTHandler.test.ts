// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { importChatGPTHistoryHandler } from './chatgpt-import';

describe('importChatGPTHistoryHandler', () => {
  // Interfaces for the test that are compatible with the real types
  interface IPineconeHelperTest {
    saveToPinecone: jest.Mock;
    checkExistingIds?: jest.Mock;
    deleteAllUserVectors?: jest.Mock;
    namespace?: string;
    initialize?: jest.Mock;
    queryPinecone?: jest.Mock;
    [key: string]: unknown;
  }

  interface IOpenAIServiceTest {
    createEmbedding: jest.Mock;
    isInitialized: jest.Mock;
    initializeOpenAI: jest.Mock;
    loadApiKey: jest.Mock;
    ensureOpenAIClient: jest.Mock;
    streamOpenAIResponse: jest.Mock;
    generateNeuralSignal: jest.Mock;
    [key: string]: unknown;
  }



  let pineconeHelper: IPineconeHelperTest;
  let openAIService: IOpenAIServiceTest;

  beforeEach(() => {
    pineconeHelper = {
      saveToPinecone: jest.fn().mockResolvedValue({ success: true }),
      checkExistingIds: jest.fn().mockImplementation((_user, ids) => {
        // Simulate that IDs id1 and id2 already exist
        console.log(`Verifying ${ids.length} IDs`);
        return Promise.resolve(['id1', 'id2']);
      }),
      deleteAllUserVectors: jest.fn().mockResolvedValue({ success: true }),
      initialize: jest.fn().mockResolvedValue(true),
      queryPinecone: jest.fn().mockResolvedValue({ matches: [] }),
      namespace: 'test-namespace'
    };
    openAIService = {
      createEmbedding: jest.fn().mockResolvedValue([1, 2, 3]),
      isInitialized: jest.fn().mockReturnValue(true),
      initializeOpenAI: jest.fn(),
      loadApiKey: jest.fn().mockResolvedValue(undefined),
      ensureOpenAIClient: jest.fn().mockResolvedValue(true),
      streamOpenAIResponse: jest.fn().mockResolvedValue({}),
      generateNeuralSignal: jest.fn().mockResolvedValue({})
    };
  });

  interface MessageMapping {
    [key: string]: {
      message: {
        id: string;
        author: { role: string };
        content: { parts: string[] };
        create_time?: number;
      };
    };
  }

  function makeBuffer(ids: string[]) {
    const mapping: MessageMapping = {};
    ids.forEach((id, idx) => {
      mapping['node' + idx] = {
        message: {
          id,
          author: { role: idx % 2 === 0 ? 'user' : 'assistant' },
          content: { parts: ['msg' + (idx + 1)] },
          create_time: idx + 1
        }
      };
    });
    return Buffer.from(JSON.stringify([
      { mapping, title: 'sessão', create_time: 0, update_time: 10 }
    ]));
  }

  it('imports only new messages in incremental mode', async () => {
    const fileBuffer = makeBuffer(['id1', 'id2', 'id3', 'id4']);
    const result = await importChatGPTHistoryHandler({
      fileBuffer,
      mode: 'increment',
      user: 'testUser',
      // Type assertion only for test context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pineconeHelper: pineconeHelper as any,
      openAIService,
      onProgress: jest.fn()
    });
    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(2);
    expect(pineconeHelper.saveToPinecone).toHaveBeenCalled();
    expect(openAIService.createEmbedding).toHaveBeenCalledTimes(2);
  });

  it('imports all messages in overwrite mode', async () => {
    const fileBuffer = makeBuffer(['id1', 'id2', 'id3', 'id4']);
    const result = await importChatGPTHistoryHandler({
      fileBuffer,
      mode: 'overwrite',
      user: 'testUser',
      // Type assertion only for test context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pineconeHelper: pineconeHelper as any,
      openAIService,
      onProgress: jest.fn()
    });
    expect(result.imported).toBe(4);
    expect(result.skipped).toBe(0);
    expect(pineconeHelper.saveToPinecone).toHaveBeenCalled();
    expect(openAIService.createEmbedding).toHaveBeenCalledTimes(4);
    expect(pineconeHelper.deleteAllUserVectors).toHaveBeenCalled();
  });
});
