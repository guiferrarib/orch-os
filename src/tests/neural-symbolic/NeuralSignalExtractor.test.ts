// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// NeuralSignalExtractor.test.ts

import { NeuralSignalExtractor } from '../../components/context/deepgram/symbolic-cortex/activation/NeuralSignalExtractor';
import { IOpenAIService } from '../../components/context/deepgram/interfaces/openai/IOpenAIService';
import { NeuralExtractionConfig } from '../../components/context/deepgram/symbolic-cortex/interfaces/INeuralSignalExtractor';
import { NeuralSignal, NeuralSignalResponse } from '../../components/context/deepgram/interfaces/neural/NeuralSignalTypes';

class MockOpenAIService implements IOpenAIService {
  mockNeuralResponse: NeuralSignalResponse = {
    signals: [],
    contextualMeta: {}
  };

  constructor(mockSignals: NeuralSignal[] = []) {
    this.mockNeuralResponse.signals = mockSignals;
  }

  async generateNeuralSignal(prompt: string, temporaryContext?: string): Promise<NeuralSignalResponse> {
    return Promise.resolve(this.mockNeuralResponse);
  }
  async generateEmbedding(text: string): Promise<number[]> {
    return Promise.resolve([0.1, 0.2, 0.3]);
  }

  async generateResponse(prompt: string, options?: any): Promise<string> {
    return Promise.resolve('Resposta simulada');
  }

  async generateFunctionCompletion(prompt: string, functions: any[]): Promise<any> {
    return Promise.resolve({ name: 'test_function', arguments: '{}' });
  }
}

describe('NeuralSignalExtractor - Phase 1: Neural Identification', () => {
  let openAIService: MockOpenAIService;
  let extractor: NeuralSignalExtractor;
  let defaultConfig: NeuralExtractionConfig;

  beforeEach(() => {
    const mockSignals: NeuralSignal[] = [
      {
        core: 'memory',
        intensity: 0.8,
        symbolic_query: {
          query: 'memories related to artificial intelligence'
        },
        symbolicInsights: {
          recall_type: 'semantic',
          temporal: 'recent',
          importance: 'high'
        },
        topK: 5
      },
      {
        core: 'metacognitive',
        intensity: 0.7,
        symbolic_query: {
          query: 'reflection on neural systems'
        },
        symbolicInsights: {
          thought: 'Analysis of concepts',
          state: 'conscious'
        },
        topK: 3
      }
    ];

    openAIService = new MockOpenAIService(mockSignals);
    extractor = new NeuralSignalExtractor(openAIService);

    defaultConfig = {
      transcription: 'How can we implement an efficient neural symbolic system?',
      temporaryContext: 'We are discussing artificial intelligence and natural language processing.',
      userContextData: {
        memories: []
      }
    };

    jest.spyOn(openAIService, 'generateNeuralSignal');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Should extract neural signals correctly using OpenAI', async () => {
    const result = await extractor.extractNeuralSignals(defaultConfig);

    // Allow for a style instruction prefix as long as the transcription is included
    const callArgs = (openAIService.generateNeuralSignal as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toEqual(expect.stringContaining(defaultConfig.transcription));
    expect(callArgs[1]).toBe(defaultConfig.temporaryContext);

    expect(result.signals).toHaveLength(2);
    expect(result.signals[0].core).toBe('memory');
    expect(result.signals[1].core).toBe('metacognitive');
  });

  test('Should provide default signals when OpenAI response is empty', async () => {
    openAIService.mockNeuralResponse.signals = [];

    const result = await extractor.extractNeuralSignals(defaultConfig);
    expect(openAIService.generateNeuralSignal).toHaveBeenCalled();

    expect(result.signals.length).toBeGreaterThan(0);
    
    const cores = result.signals.map(s => s.core);
    expect(cores).toContain('memory');
    expect(cores).toContain('metacognitive');
    expect(cores).toContain('valence');
  });

  test('Should extract signals with appropriate intensities', async () => {
    const result = await extractor.extractNeuralSignals(defaultConfig);

    for (const signal of result.signals) {
      expect(signal.intensity).toBeGreaterThanOrEqual(0);
      expect(signal.intensity).toBeLessThanOrEqual(1);
    }
  });

  test('Should include contextual metadata in the response', async () => {
    openAIService.mockNeuralResponse.contextualMeta = {
      dominant_theme: 'artificial_intelligence',
      cognitive_state: 'analytical',
      attention_focus: 'technical_details'
    };

    const result = await extractor.extractNeuralSignals(defaultConfig);

    expect(result.contextualMeta).toBeDefined();
    expect(result.contextualMeta.dominant_theme).toBe('artificial_intelligence');
    expect(result.contextualMeta.cognitive_state).toBe('analytical');
    expect(result.contextualMeta.attention_focus).toBe('technical_details');
  });

  test('Should handle empty or invalid transcriptions', async () => {
    const emptyConfig = { ...defaultConfig, transcription: '' };
    
    const result = await extractor.extractNeuralSignals(emptyConfig);
    
    expect(result).toBeDefined();
    expect(result).toBeDefined();
    expect(result.signals).toBeDefined();
  });

  test('Should preserve topK of each signal if already defined', async () => {
    const result = await extractor.extractNeuralSignals(defaultConfig);
    
    expect(result.signals[0].topK).toBe(5);
    expect(result.signals[1].topK).toBe(3);
  });
});
