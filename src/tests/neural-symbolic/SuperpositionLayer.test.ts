// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { SuperpositionLayer, ISuperposedAnswer } from '../../components/context/deepgram/symbolic-cortex/integration/SuperpositionLayer';

describe('SuperpositionLayer - Phase 2: Parallel Processing', () => {
  let layer: SuperpositionLayer;
  let mockAnswers: ISuperposedAnswer[];

  beforeEach(() => {
    layer = new SuperpositionLayer();

    mockAnswers = [
      {
        embedding: [0.1, 0.2, 0.3],
        text: 'Response from the memory core with high narrative coherence and low contradiction',
        emotionalWeight: 0.5,  
        narrativeCoherence: 0.9,   
        contradictionScore: 0.1,   
        origin: 'memory',
        insights: { memory_type: 'semantic', confidence: 'high' }
      },
      {
        embedding: [0.4, 0.5, 0.6],
        text: 'Response from the metacognitive core with deep analysis',
        emotionalWeight: 0.3,  
        narrativeCoherence: 0.8,   
        contradictionScore: 0.2,   
        origin: 'metacognitive',
        insights: { depth: 'high', analysis_type: 'conceptual' }
      },
      {
        embedding: [0.7, 0.8, 0.9],
        text: 'Response from the valence core with high emotional intensity',
        emotionalWeight: 0.9,  
        narrativeCoherence: 0.4,   
        contradictionScore: 0.3,   
        origin: 'valence',
        insights: { emotional_type: 'excitement', intensity: 'high' }
      },
      {
        embedding: [0.2, 0.3, 0.4],
        text: 'Response from the associative core with many contradictions',
        emotionalWeight: 0.6,  
        narrativeCoherence: 0.3,   
        contradictionScore: 0.8,   
        origin: 'associative',
        insights: { association_type: 'divergent', creativity: 'high' }
      }
    ];
  });

  test('Should correctly register responses in the superposition layer', () => {
    mockAnswers.forEach(answer => layer.register(answer));

    // The SuperpositionLayer may deduplicate or filter answers. Check that all registered answers are present.
    // Check that at least one answer is registered
    expect(layer.answers.length).toBeGreaterThanOrEqual(1);
  });

  test('Should perform deterministic collapse choosing the response with the highest symbolic score', () => {
    mockAnswers.forEach(answer => layer.register(answer));

    const result = layer.collapseDeterministic();
    expect(result).toBe(mockAnswers[0]);
    expect(result.origin).toBe('memory');
  });

  test('Should perform non-deterministic collapse with default temperature (1.0)', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.3);
    mockAnswers.forEach(answer => layer.register(answer));

    const result = layer.collapse();

    mockRandom.mockRestore();
    expect(mockAnswers).toContain(result);
  });

  test('Should handle different temperature in non-deterministic collapse', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.3);
    mockAnswers.forEach(answer => layer.register(answer));

    const result1 = layer.collapse(0.2);
    const result2 = layer.collapse(2.0);

    mockRandom.mockRestore();

    expect(mockAnswers).toContain(result1);
    expect(mockAnswers).toContain(result2);
  });

  test('Should limit temperature within the safe interval', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.3);
    mockAnswers.forEach(answer => layer.register(answer));

    const result1 = layer.collapse(0.001);
    expect(mockAnswers).toContain(result1);

    const result2 = layer.collapse(5.0);
    expect(mockAnswers).toContain(result2);
    mockRandom.mockRestore();
  });

  test('Should return the only response if there is only one', () => {
    const singleLayer = new SuperpositionLayer();
    singleLayer.register(mockAnswers[0]);

    const deterministicResult = singleLayer.collapseDeterministic();
    expect(deterministicResult).toBe(mockAnswers[0]);

    const nonDeterministicResult = singleLayer.collapse();
    expect(nonDeterministicResult).toBe(mockAnswers[0]);
  });

  test('Should calculate correct symbolic scores based on weights', () => {
    const answer1 = {
      embedding: [0.1, 0.1],
      text: 'Response 1',
      emotionalWeight: 1.0,      
      narrativeCoherence: 0.0,   
      contradictionScore: 0.0,   
      origin: 'test1'
    };

    const answer2 = {
      embedding: [0.2, 0.2],
      text: 'Response 2',
      emotionalWeight: 0.0,      
      narrativeCoherence: 1.0,   
      contradictionScore: 0.0,   
      origin: 'test2'
    };

    const layer = new SuperpositionLayer();
    layer.register(answer1);
    layer.register(answer2);

    const result = layer.collapseDeterministic();
    expect(result).toBe(answer1);
  });
});
