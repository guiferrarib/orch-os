// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { MemoryContextBuilder } from './MemoryContextBuilder';
import { IPersistenceService } from '../../interfaces/memory/IPersistenceService';
import { IEmbeddingService } from '../../interfaces/openai/IEmbeddingService';
import { SpeakerTranscription } from '../../interfaces/transcription/TranscriptionTypes';
import { TranscriptionFormatter } from '../transcription/TranscriptionFormatter';
import { BatchTranscriptionProcessor } from '../transcription/BatchTranscriptionProcessor';

describe('MemoryContextBuilder (unit)', () => {
  const mockEmbeddingService: IEmbeddingService = {
    isInitialized: () => true,
    createEmbedding: async () => [1, 2, 3],
    initialize: async () => true
  };
  const mockPersistenceService: IPersistenceService = {
    isAvailable: () => true,
    queryMemory: jest.fn().mockResolvedValue('contexto-mock'),
    saveInteraction: jest.fn().mockResolvedValue(undefined),
    createVectorEntry: jest.fn().mockImplementation((id, embedding, metadata) => ({ id, values: embedding, metadata })),
    saveToPinecone: jest.fn().mockResolvedValue({ success: true })
  };
  const formatter = new TranscriptionFormatter();
  const processor = new BatchTranscriptionProcessor(formatter);
  const builder = new MemoryContextBuilder(
    mockEmbeddingService,
    mockPersistenceService,
    formatter,
    processor
  );

  it('should return empty SpeakerMemoryResults if embedding is not initialized', async () => {
    const builder2 = new MemoryContextBuilder(
      { ...mockEmbeddingService, isInitialized: () => false },
      mockPersistenceService,
      formatter,
      processor
    );
    const result = await builder2.fetchContextualMemory([], [], new Set());
    expect(result.userContext).toBe("");
    expect(result.speakerContexts.size).toBe(0);
    expect(result.temporaryContext).toBe("");
  });

  it('should call persistenceService.queryMemory for external speakers', async () => {
    const userTranscriptions: SpeakerTranscription[] = [
      { speaker: 'user', text: 'Oi', timestamp: new Date().toISOString() }
    ];
    const externalTranscriptions: SpeakerTranscription[] = [
      { speaker: 'external', text: 'Olá', timestamp: new Date().toISOString() }
    ];
    const detectedSpeakers = new Set(['user', 'external']);
    const result = await builder.fetchContextualMemory(
      userTranscriptions,
      externalTranscriptions,
      detectedSpeakers
    );
    expect(result.userContext).toBe('contexto-mock');
    expect(result.speakerContexts.get('external')).toBe('contexto-mock');
  });
});
