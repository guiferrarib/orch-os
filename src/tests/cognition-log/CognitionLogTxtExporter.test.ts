// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// CognitionLogTxtExporter.test.ts
// Tests for the CognitionLogTxtExporter class

import { CognitionLogTxtExporter } from '../../components/context/deepgram/services/utils/CognitionLogTxtExporter';
import { CognitionEvent } from '../../components/context/deepgram/types/CognitionEvent';

describe('CognitionLogTxtExporter', () => {
  let exporter: CognitionLogTxtExporter;
  
  // Mock for simulating the element click
  const mockClickFn = jest.fn();
  
  // Example cognitive events for testing
  const sampleEvents: CognitionEvent[] = [
    {
      type: 'raw_prompt',
      timestamp: '2025-04-29T18:30:00.000Z',
      content: 'How to implement a neural system?'
    },
    {
      type: 'temporary_context',
      timestamp: '2025-04-29T18:30:05.000Z',
      context: 'Context for processing'
    },
    {
      type: 'neural_signal',
      timestamp: '2025-04-29T18:30:10.000Z',
      core: 'memory',
      symbolic_query: {
        text: 'neural system',
        embedding: [0.1, 0.2],
        query: 'neural system'
      },
      intensity: 0.8,
      topK: 5,
      params: {
        type: 'memory'
      }
    }
  ];
  
  // Mocks for the DOM and browser APIs
  const mockCreateElement = jest.fn();
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();
  
  beforeEach(() => {
    exporter = new CognitionLogTxtExporter();
    
    // Reset mocks
    mockClickFn.mockReset();
    mockCreateElement.mockReset();
    mockCreateObjectURL.mockReset();
    mockRevokeObjectURL.mockReset();
    
    // Mock for the <a> element
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClickFn
    });
    
    // Setup global mocks with safe typecasting
    document.createElement = mockCreateElement;
    
    global.URL = {
      createObjectURL: mockCreateObjectURL.mockReturnValue('mock-url'),
      revokeObjectURL: mockRevokeObjectURL
    };
  
    global.Blob = jest.fn();
    
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  test('Has a descriptive label', () => {
    expect(exporter.label).toBe('Export cognitive log (TXT)');
  });
  
  test('Exports cognitive events to TXT format', () => {
    // Execute the export function
    exporter.export(sampleEvents);
    
    // Verify that the Blob was created with the expected content
    expect(global.Blob).toHaveBeenCalled();
    
    // Verify that URL.createObjectURL was called
    expect(mockCreateObjectURL).toHaveBeenCalled();
    
    // Verify that document.createElement was called with 'a'
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    
    // Verify that the link was clicked
    expect(mockClickFn).toHaveBeenCalled();
    
    // Advance the timer to verify if URL.revokeObjectURL is called
    jest.advanceTimersByTime(1000);
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
  
  test('Uses custom filename when provided', () => {
    const customFilename = 'custom_session_log.txt';
    
    // Clear previous calls
    jest.clearAllMocks();
    
    // Execute the export with custom filename
    exporter.export(sampleEvents, customFilename);
    
    // Verify that the <a> element was created
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    
    // Verify that the filename was set correctly
    const anchorElement = mockCreateElement.mock.results[0].value;
    expect(anchorElement.download).toBe(customFilename);
  });
  
  test('Separates events with delimiter in the TXT content', () => {
    exporter.export(sampleEvents);
    
    // Get the parameters passed to the Blob
    const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
    
    // Verify that it contains the delimiter and basic data
    expect(blobContent).toContain('---');
    expect(blobContent).toContain('raw_prompt');
    expect(blobContent).toContain('temporary_context');
    expect(blobContent).toContain('neural_signal');
  });
});
