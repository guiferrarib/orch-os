// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { MemoryService } from './MemoryService';
import { IOpenAIService } from '../../interfaces/openai/IOpenAIService';
import { SpeakerTranscription } from '../../interfaces/transcription/TranscriptionTypes';

// Mock the OpenAIEmbeddingService module
jest.mock('../openai/OpenAIEmbeddingService', () => ({
  OpenAIEmbeddingService: jest.fn().mockImplementation(() => ({
    createEmbedding: jest.fn().mockResolvedValue([1, 2, 3]),
    isInitialized: jest.fn().mockReturnValue(true)
  }))
}));

// Mock PineconeMemoryService
jest.mock('./PineconeMemoryService', () => ({
  PineconeMemoryService: jest.fn().mockImplementation(() => ({
    queryMemory: jest.fn().mockResolvedValue('Mocked memory content'),
    isAvailable: jest.fn().mockReturnValue(true),
    embeddingService: {
      openAIService: {}
    }
  }))
}));

// Mock de OpenAIService com todos os métodos necessários
const mockOpenAIService: IOpenAIService = {
  isInitialized: () => true,
  createEmbedding: jest.fn().mockResolvedValue([1, 2, 3]),
  initializeOpenAI: jest.fn(),
  loadApiKey: jest.fn().mockResolvedValue(undefined),
  ensureOpenAIClient: jest.fn().mockResolvedValue(true),
  streamOpenAIResponse: jest.fn().mockResolvedValue({ id: 'test', content: 'resposta', status: 'done' }),
  generateNeuralSignal: jest.fn().mockResolvedValue({ signals: [] })
};

describe('MemoryService', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });
  
  let memoryService: MemoryService;
  beforeEach(() => {
    jest.clearAllMocks();
    memoryService = new MemoryService(mockOpenAIService);
  });

  it('fetchContextualMemory should not throw and return valid SpeakerMemoryResults', async () => {
    const userTranscriptions: SpeakerTranscription[] = [
      { speaker: 'user', text: 'Olá, tudo bem?', timestamp: new Date().toISOString() }
    ];
    const externalTranscriptions: SpeakerTranscription[] = [
      { speaker: 'external', text: 'Bem-vindo!', timestamp: new Date().toISOString() }
    ];
    const detectedSpeakers = new Set<string>(['user', 'external']);
    const result = await memoryService.fetchContextualMemory(
      userTranscriptions,
      externalTranscriptions,
      detectedSpeakers,
      'temporary context',
      undefined,  // topK
      undefined   // keywords
    );
    expect(result).toHaveProperty('userContext');
    expect(result).toHaveProperty('speakerContexts');
    expect(result).toHaveProperty('temporaryContext');
  });
});
