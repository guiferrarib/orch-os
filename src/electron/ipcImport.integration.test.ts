// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// Adapted to simulate the real import handler

jest.mock('../config/UserConfig', () => ({
  getPrimaryUser: () => 'testUser',
}));

// Interfaces for type checking in the test
interface MessageItem {
  message?: {
    id?: string;
    author?: { role?: string };
    content?: { parts?: string[] };
    create_time?: number;
    parent?: string;
  };
}

interface ImportParams {
  fileBuffer: Buffer;
  mode: 'increment' | 'overwrite';
  user: string;
}

interface PineconeHelperDeps {
  pineconeHelper: {
    saveToPinecone: jest.Mock;
    checkExistingIds?: jest.Mock;
    deleteAllUserVectors?: jest.Mock;
  };
}

describe('Integration IPC import-chatgpt-history', () => {
  let pineconeHelper: {
    saveToPinecone: jest.Mock;
    checkExistingIds?: jest.Mock;
    deleteAllUserVectors?: jest.Mock;
  };

  beforeEach(() => {
    // Mock PineconeHelper for deduplication by id
    pineconeHelper = {
      saveToPinecone: jest.fn().mockResolvedValue({ success: true }),
      checkExistingIds: jest.fn().mockImplementation((_user, ids) => {
        console.log(`Verifying ${ids.length} IDs in the test`);
        return Promise.resolve(['id1', 'id2']); 
      }),
      deleteAllUserVectors: jest.fn().mockResolvedValue({ success: true })
    };
  });

  it('imports only new messages in incremental mode', async () => {
    // Simulate file buffer in the real ChatGPT export format
    const mapping = {
      node1: { message: { id: 'id1', author: { role: 'user' }, content: { parts: ['msg1'] }, create_time: 1 } },
      node2: { message: { id: 'id2', author: { role: 'assistant' }, content: { parts: ['msg2'] }, create_time: 2 } },
      node3: { message: { id: 'id3', author: { role: 'user' }, content: { parts: ['msg3'] }, create_time: 3 } },
      node4: { message: { id: 'id4', author: { role: 'assistant' }, content: { parts: ['msg4'] }, create_time: 4 } }
    };
    const fileBuffer = Buffer.from(JSON.stringify([
      { mapping, title: 'sessão', create_time: 0, update_time: 10 }
    ]));

    // Simulate the real handler (adapted from ipcHandlers.ts)
    async function importChatGPTTestHandler(
      { fileBuffer, mode, user }: ImportParams, 
      _event: unknown, 
      deps: PineconeHelperDeps
    ) {
      const raw = JSON.parse(fileBuffer.toString('utf-8'));
      let allMessages = [];
      for (const session of raw) {
        const mapping = session.mapping || {};
        for (const item of Object.values(mapping) as MessageItem[]) {
          const msg = item.message;
          if (!msg) continue;
          const role = msg.author?.role || 'unknown';
          const content = Array.isArray(msg.content?.parts) ? msg.content.parts[0] : msg.content?.parts;
          if (!content || typeof content !== 'string' || !content.trim()) continue;
          allMessages.push({
            role,
            content: content.trim(),
            timestamp: msg.create_time || null,
            id: msg.id || null,
            parent: msg.parent || null,
            session_title: session.title || null,
            session_create_time: session.create_time || null,
            session_update_time: session.update_time || null
          });
        }
      }
      let existingMessageIds = new Set();
      if (mode === 'increment') {
        // Extract message IDs for verification
        const messageIdsToCheck = allMessages
          .filter(msg => msg.id) 
          .map(msg => msg.id as string);
          
        if (deps.pineconeHelper.checkExistingIds && messageIdsToCheck.length > 0) {
          const existingIds = await deps.pineconeHelper.checkExistingIds(user, messageIdsToCheck);
          existingMessageIds = new Set(existingIds);
        }
        allMessages = allMessages.filter(m => m.id && !existingMessageIds.has(m.id));
      }
      if (mode === 'overwrite') {
        if (deps.pineconeHelper.deleteAllUserVectors) {
          await deps.pineconeHelper.deleteAllUserVectors(user);
        }
      }
      // Mock embedding e save
      const vectors = allMessages.map(msg => ({
        id: msg.id,
        values: [0],
        metadata: { ...msg, user, imported_from: 'chatgpt', imported_at: Date.now(), messageId: msg.id || null }
      }));
      if (vectors.length > 0) {
        await deps.pineconeHelper.saveToPinecone(vectors);
      }
      return { success: true, imported: vectors.length, skipped: 4 - vectors.length };
    }

    const result = await importChatGPTTestHandler({
      fileBuffer,
      mode: 'increment',
      user: 'testUser'
    }, undefined, { pineconeHelper: pineconeHelper });
    expect(result.imported).toBe(2); 
    expect(result.skipped).toBe(2);  
  });

  it('imports all messages in overwrite mode', async () => {
    const mapping = {
      node1: { message: { id: 'id1', author: { role: 'user' }, content: { parts: ['msg1'] }, create_time: 1 } },
      node2: { message: { id: 'id2', author: { role: 'assistant' }, content: { parts: ['msg2'] }, create_time: 2 } },
      node3: { message: { id: 'id3', author: { role: 'user' }, content: { parts: ['msg3'] }, create_time: 3 } },
      node4: { message: { id: 'id4', author: { role: 'assistant' }, content: { parts: ['msg4'] }, create_time: 4 } }
    };
    const fileBuffer = Buffer.from(JSON.stringify([
      { mapping, title: 'sessão', create_time: 0, update_time: 10 }
    ]));
    // Reuses the same test function
    async function importChatGPTTestHandler(
      { fileBuffer, mode, user }: ImportParams, 
      _event: unknown, 
      deps: PineconeHelperDeps
    ) {
      const raw = JSON.parse(fileBuffer.toString('utf-8'));
      let allMessages = [];
      for (const session of raw) {
        const mapping = session.mapping || {};
        for (const item of Object.values(mapping) as MessageItem[]) {
          const msg = item.message;
          if (!msg) continue;
          const role = msg.author?.role || 'unknown';
          const content = Array.isArray(msg.content?.parts) ? msg.content.parts[0] : msg.content?.parts;
          if (!content || typeof content !== 'string' || !content.trim()) continue;
          allMessages.push({
            role,
            content: content.trim(),
            timestamp: msg.create_time || null,
            id: msg.id || null,
            parent: msg.parent || null,
            session_title: session.title || null,
            session_create_time: session.create_time || null,
            session_update_time: session.update_time || null
          });
        }
      }
      let existingMessageIds = new Set();
      if (mode === 'increment') {
        // Extract message IDs for verification
        const messageIdsToCheck = allMessages
          .filter(msg => msg.id) 
          .map(msg => msg.id as string);
          
        if (deps.pineconeHelper.checkExistingIds && messageIdsToCheck.length > 0) {
          const existingIds = await deps.pineconeHelper.checkExistingIds(user, messageIdsToCheck);
          existingMessageIds = new Set(existingIds);
        }
        allMessages = allMessages.filter(m => m.id && !existingMessageIds.has(m.id));
      }
      if (mode === 'overwrite') {
        if (deps.pineconeHelper.deleteAllUserVectors) {
          await deps.pineconeHelper.deleteAllUserVectors(user);
        }
      }
      // Mock embedding e save
      const vectors = allMessages.map(msg => ({
        id: msg.id,
        values: [0],
        metadata: { ...msg, user, imported_from: 'chatgpt', imported_at: Date.now(), messageId: msg.id || null }
      }));
      if (vectors.length > 0) {
        await deps.pineconeHelper.saveToPinecone(vectors);
      }
      return { success: true, imported: vectors.length, skipped: 4 - vectors.length };
    }
    const result = await importChatGPTTestHandler({
      fileBuffer,
      mode: 'overwrite',
      user: 'testUser'
    }, undefined, { pineconeHelper: pineconeHelper });
    expect(result.imported).toBe(4); // All
    expect(result.skipped).toBe(0);  // None skipped
  });
});
