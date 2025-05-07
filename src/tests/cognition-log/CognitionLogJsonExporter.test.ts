// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// CognitionLogJsonExporter.test.ts
// Tests for the CognitionLogJsonExporter class

import { CognitionLogJsonExporter } from '../../components/context/deepgram/services/utils/CognitionLogJsonExporter';
import { CognitionEvent } from '../../components/context/deepgram/types/CognitionEvent';

describe('CognitionLogJsonExporter', () => {
  let exporter: CognitionLogJsonExporter;
  
  // Mocks for browser environment
  const mockClickFn = jest.fn();

  // Mocks for DOM and browser APIs
  const mockCreateElement = jest.fn();
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();
  
  // Example cognitive events for testing
  const sampleEvents: CognitionEvent[] = [
    { type: 'raw_prompt', timestamp: '2025-04-29T18:30:00.000Z', content: 'Como implementar um sistema neural?' },
    { type: 'temporary_context', timestamp: '2025-04-29T18:30:05.000Z', context: 'Contexto para processamento' },
    { 
      type: 'neural_signal', 
      timestamp: '2025-04-29T18:30:10.000Z', 
      core: 'memory', 
      symbolic_query: { query: 'sistema neural', text: 'sistema neural', embedding: [0.1, 0.2] },
      intensity: 0.8,
      topK: 5,
      params: { type: 'memory' }
    }
  ];
  
  beforeEach(() => {
    exporter = new CognitionLogJsonExporter();
    
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
    
    // Setup global mocks for testing
    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    });
    
    // Setup global mocks for testing
    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL.mockReturnValue('mock-url'),
        revokeObjectURL: mockRevokeObjectURL
      },
      writable: true
    });
    
    // Setup global mocks for testing
    Object.defineProperty(global, 'Blob', {
      value: jest.fn(),
      writable: true
    });
    
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });
  
  test('Has a descriptive label', () => {
    expect(exporter.label).toBe('Export cognitive log (JSON)');
  });
  
  test('Exports cognitive events to JSON format', () => {
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
    const customFilename = 'custom_session_log.json';
    
    jest.clearAllMocks();
    
    // Prepare a new mock with a different value for download
    mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClickFn
    });
    
    // Execute the export function with a custom filename
    exporter.export(sampleEvents, customFilename);
    
    // Verify that the <a> element was created
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    
    // Verify that the filename was set correctly
    const anchorElement = mockCreateElement.mock.results[0].value;
    expect(anchorElement.download).toBe(customFilename);
  });
  
  test('Exports valid and formatted JSON', () => {
    exporter.export(sampleEvents);
    
    // Get the parameters passed to the Blob
    const blobContent = (global.Blob as jest.Mock).mock.calls[0][0][0];
    
    // Try to parse to ensure it's a valid JSON
    expect(() => JSON.parse(blobContent)).not.toThrow();
    
    // Verify that the JSON was formatted with indentation (using null, 2)
    const expectedJson = JSON.stringify(sampleEvents, null, 2);
    expect(blobContent).toBe(expectedJson);
    
    // Verify that the Blob MIME type is correct
    const blobOptions = (global.Blob as jest.Mock).mock.calls[0][1];
    expect(blobOptions.type).toBe('application/json');
  });
});
