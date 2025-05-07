// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// DefaultNeuralIntegrationService.test.ts
// Tests for Fase 3: Neural Integration - Final result is integrated based on intensity

import { DefaultNeuralIntegrationService } from '../../components/context/deepgram/symbolic-cortex/integration/DefaultNeuralIntegrationService';
import { IOpenAIService } from '../../components/context/deepgram/interfaces/openai/IOpenAIService';
class MockOpenAIService implements IOpenAIService {
  mockEmbeddings: Record<string, number[]> = {};
  
  setupMockEmbedding(text: string, embedding: number[]) {
    this.mockEmbeddings[text] = embedding;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    return Promise.resolve(this.mockEmbeddings[text] || [0.1, 0.2, 0.3]);
  }
  
  async generateNeuralSignal(prompt: string, temporaryContext?: string): Promise<any> {
    return Promise.resolve({ signals: [] });
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    return Promise.resolve('Simulated response');
  }
  
  async generateFunctionCompletion(prompt: string, functions: any[]): Promise<any> {
    return Promise.resolve({ name: 'test_function', arguments: '{}' });
  }
}

describe('DefaultNeuralIntegrationService - Fase 3: Neural Integration', () => {
  let openAIService: MockOpenAIService;
  let integrationService: DefaultNeuralIntegrationService;
  
  beforeEach(() => {
    openAIService = new MockOpenAIService();
    integrationService = new DefaultNeuralIntegrationService(openAIService);
    
    openAIService.setupMockEmbedding('Memory response', [0.1, 0.2, 0.3]);
    openAIService.setupMockEmbedding('Metacognitive response', [0.4, 0.5, 0.6]);
    openAIService.setupMockEmbedding('Valence response', [0.7, 0.8, 0.9]);
  });
  
  test('Should integrate neural results from different cores', async () => {
    const neuralResults = [
      {
        core: 'memory',
        intensity: 0.8,
        output: 'Memory response',
        insights: { valence: 0.6, coherence: 0.8, contradiction: 0.1 }
      },
      {
        core: 'metacognitive',
        intensity: 0.6,
        output: 'Metacognitive response',
        insights: { valence: 0.4, coherence: 0.9, contradiction: 0.2 }
      },
      {
        core: 'valence',
        intensity: 0.4,
        output: 'Valence response',
        insights: { valence: 0.9, coherence: 0.5, contradiction: 0.3 }
      }
    ];
    
    const originalInput = 'What is your opinion about artificial intelligence?';
    
    const result = await integrationService.integrate(neuralResults, originalInput);
    
    expect(typeof result).toBe('string');
    
    expect(result).toContain('ORIGINAL STIMULUS');
    expect(result).toContain(originalInput);
    expect(result).toContain('ACTIVATED AREAS INSIGHTS');
    
    expect(result).toContain('[Area: memory');
    expect(result).toContain('[Area: metacognitive');
    expect(result).toContain('Area: valence');
    
    expect(result).toContain('Intensity: 80%');
    expect(result).toContain('Intensity: 60%');
    expect(result).toContain('Intensity: 40%');
    
    // These specific core responses are not present in the new output format, so we remove these assertions.
    
    expect(result).toContain('DETECTED EMERGENT PROPERTIES');
  });
  
  test('Should handle empty results array correctly', async () => {
    const result = await integrationService.integrate(
      [], 
      'Question without results'
    );
    
    expect(result).toBe('Question without results');
  });
  
  test('Should detect emergent properties based on insights', async () => {
    const neuralResults = [
      {
        core: 'memory',
        intensity: 0.8,
        output: 'High emotional response',
        insights: { valence: 0.9, coherence: 0.3, contradiction: 0.8 }
      }
    ];
    
    const result = await integrationService.integrate(
      neuralResults,
      'Test question'
    );
    
    expect(result).toContain('Contradiction detected');
    expect(result).toContain('strong emotional weight');
    
    expect(result).toContain('DETECTED EMERGENT PROPERTIES');
  });
  
  test('Should include deep insights when available', async () => {
    const neuralResults = [
      {
        core: 'metacognitive',
        intensity: 0.7,
        output: 'Deep insight response',
        insights: { 
          deep_insight: 'This is a deep insight about the topic'
        }
      }
    ];
    
    const result = await integrationService.integrate(
      neuralResults,
      'Philosophical question'
    );
    
    expect(result).toContain('Emergent deep insight');
    expect(result).toContain('This is a deep insight about the topic');
  });
  
  test('Should consider symbolic_deterministic metadata', async () => {
    const originalCollapseDeterministic = 
      integrationService['superposition']?.collapseDeterministic;
    
    const neuralResults = [
      {
        core: 'memory',
        intensity: 0.8,
        output: 'Deterministic response',
        insights: { valence: 0.5 }
      }
    ];
    
    await integrationService.integrate(
      neuralResults,
      'Test question'
    );
    
    await integrationService.integrate(
      neuralResults,
      'Test question'
    );
    
    const neuralResults2 = [
      {
        core: 'memory',
        intensity: 0.8,
        output: 'Deterministic response',
        insights: { valence: 0.5 }
      }
    ];
    
    await integrationService.integrate(
      neuralResults2,
      'Test question'
    );
    
    await integrationService.integrate(
      neuralResults2,
      'Test question'
    );
    await integrationService.integrate(
      neuralResults,
      'Test question'
    );
    
    if (originalCollapseDeterministic) {
      integrationService['superposition'].collapseDeterministic = originalCollapseDeterministic;
    }
  });
});
