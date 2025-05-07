// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// SymbolicCognitionTimelineLogger.test.ts
// Tests for the SymbolicCognitionTimelineLogger class

import SymbolicCognitionTimelineLogger from '../../components/context/deepgram/services/utils/SymbolicCognitionTimelineLogger';

// Mock for Date.toISOString to return a fixed timestamp and facilitate tests
const mockTimestamp = '2025-04-29T18:30:00.000Z';
jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => mockTimestamp);

describe('SymbolicCognitionTimelineLogger', () => {
  let logger: SymbolicCognitionTimelineLogger;
  
  beforeEach(() => {
    // Create a new instance for each test
    logger = new SymbolicCognitionTimelineLogger();
  });

  test('Should initialize with an empty timeline', () => {
    expect(logger.getTimeline()).toEqual([]);
  });

  test('Should log raw prompt correctly', () => {
    const promptText = 'How can I implement a neural symbolic system?';
    logger.logRawPrompt(promptText);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'raw_prompt',
      timestamp: mockTimestamp,
      content: promptText
    });
  });

  test('Should log temporary context correctly', () => {
    const context = 'Temporary context for neural processing';
    logger.logTemporaryContext(context);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'temporary_context',
      timestamp: mockTimestamp,
      context
    });
  });

  test('Should log neural signal correctly', () => {
    const core = 'memory';
    const symbolic_query = { query: 'neural system implementation', text: 'neural system implementation', embedding: [0.1, 0.2] };
    const intensity = 0.8;
    const topK = 5;
    const params = { searchType: 'semantic' };

    logger.logNeuralSignal(core, symbolic_query, intensity, topK, params);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'neural_signal',
      timestamp: mockTimestamp,
      core,
      symbolic_query,
      intensity,
      topK,
      params
    });
  });

  test('Should log symbolic retrieval correctly', () => {
    const core = 'memory';
    const insights = [  
      { id: '1', text: 'Insight 1', score: 0.9, type: 'memory' },
      { id: '2', text: 'Insight 2', score: 0.7, type: 'memory' }
    ];
    const matchCount = 2;
    const durationMs = 150;

    logger.logSymbolicRetrieval(core, insights, matchCount, durationMs);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'symbolic_retrieval',
      timestamp: mockTimestamp,
      core,
      insights,
      matchCount,
      durationMs
    });
  });

  test('Should handle empty insights in symbolic retrieval', () => {
    const core = 'memory';
    const insights: { id: string; text: string; score: number; type: string }[] = [];
    const matchCount = 0;
    const durationMs = 100;

    logger.logSymbolicRetrieval(core, insights, matchCount, durationMs);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'symbolic_retrieval',
      timestamp: mockTimestamp,
      core,
      insights: [],
      matchCount,
      durationMs
    });
  });

  test('Should log fusion initiation correctly', () => {
    logger.logFusionInitiated();

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'fusion_initiated',
      timestamp: mockTimestamp
    });
  });

  test('Should log symbolic context synthesis correctly', () => {
    const context = {
      memoryInsights: ['Insight 1', 'Insight 2'],
      metacognitiveInsights: ['Meta Insight'],
      language: 'Insight of language',
      summary: 'Summary of the symbolic context',
      associativeInsights: ['Associative 1'],
      valenceInsights: ['Valence 1'],
      planningInsights: ['Planning 1']
    };

    logger.logSymbolicContextSynthesized(context);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'symbolic_context_synthesized',
      timestamp: mockTimestamp,
      context
    });
  });

  test('Should log GPT response as string correctly', () => {
    const response = 'This is a GPT response';
    logger.logGptResponse(response);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0].type).toBe('gpt_response');
    // The response is stored in the response field of the structure
    const event = timeline[0] as { type: string; timestamp: string; response: string };
    expect(event.response).toBe(response);
    expect(timeline[0].timestamp).toBe(mockTimestamp);
  });

  test('Should log GPT response as object correctly', () => {
    const responseData = {
      response: 'This is a GPT response',
      symbolicTopics: ['Topic 1', 'Topic 2'],
      insights: [
        { id: '1', text: 'Insight 1', score: 0.9, type: 'memory' },
        { id: '2', text: 'Insight 2', score: 0.8, type: 'metacognitive' }
      ]
    };

    logger.logGptResponse(responseData);

    const timeline = logger.getTimeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]).toEqual({
      type: 'gpt_response',
      timestamp: mockTimestamp,
      ...responseData
    });
  });

  test('Should clear timeline correctly', () => {
    // Add some events
    logger.logRawPrompt('Prompt 1');
    logger.logTemporaryContext('Context');
    logger.logRawPrompt('Prompt 2');
    
    // Verify that they were added
    expect(logger.getTimeline()).toHaveLength(3);
    
    // Clear the timeline
    logger.clear();
    
    // Verify that it is empty
    expect(logger.getTimeline()).toHaveLength(0);
  });

  test('Should preserve chronological order of events', () => {
    logger.logRawPrompt('First prompt');
    logger.logTemporaryContext('Temporary context');
    logger.logFusionInitiated();
    
    const timeline = logger.getTimeline();
    
    expect(timeline).toHaveLength(3);
    expect(timeline[0].type).toBe('raw_prompt');
    expect(timeline[1].type).toBe('temporary_context');
    expect(timeline[2].type).toBe('fusion_initiated');
  });
});
