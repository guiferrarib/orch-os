// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { CognitionLogExporterFactory } from '../../components/context/deepgram/services/utils/CognitionLogExporterFactory';
import { CognitionLogExporter } from '../../components/context/deepgram/services/utils/CognitionLogExporter';
import { CognitionLogJsonExporter } from '../../components/context/deepgram/services/utils/CognitionLogJsonExporter';
import { CognitionLogTxtExporter } from '../../components/context/deepgram/services/utils/CognitionLogTxtExporter';
import { CognitionEvent } from '../../components/context/deepgram/types/CognitionEvent';

class MockCustomExporter implements CognitionLogExporter {
  label = 'Test Exporter';
  export(log: CognitionEvent[], filename?: string): void {
    // Mock
  }
}

describe('CognitionLogExporterFactory', () => {
  let factory: CognitionLogExporterFactory;
  
  beforeEach(() => {
    CognitionLogExporterFactory.instance = undefined;
    factory = CognitionLogExporterFactory.getInstance();
  });
  
  test('Implements Singleton pattern', () => {
    const instance1 = CognitionLogExporterFactory.getInstance();
    const instance2 = CognitionLogExporterFactory.getInstance();
    
    expect(instance1).toBe(instance2);
  });
  
  test('Initializes with default exporters', () => {
    const exporters = factory.getExporters();
    
    expect(exporters.length).toBeGreaterThanOrEqual(2);
    
    expect(exporters.some(e => e.label === 'Export cognitive log (JSON)')).toBe(true);
    
    expect(exporters.some(e => e.label === 'Export cognitive log (TXT)')).toBe(true);
  });
  
  test('Permits the registration of new exporters', () => {
    const customExporter = new MockCustomExporter();
    factory.registerExporter(customExporter);
    
    const exporters = factory.getExporters();
    expect(exporters.some(e => e.label === 'Test Exporter')).toBe(true);
    expect(exporters.length).toBeGreaterThan(2);
  });
  
  test('Removes existing exporters', () => {
    const customExporter = new MockCustomExporter();
    factory.registerExporter(customExporter);
    
    let exporters = factory.getExporters();
    expect(exporters.some(e => e.label === 'Test Exporter')).toBe(true);
    
    factory.unregisterExporter('Test Exporter');
    
    exporters = factory.getExporters();
    expect(exporters.some(e => e.label === 'Test Exporter')).toBe(false);
  });
  
  test('Returns a copy of the exporters to prevent direct modification', () => {
    const exporters1 = factory.getExporters();
    const initialCount = exporters1.length;
    
    exporters1.push(new MockCustomExporter());
    
    const exporters2 = factory.getExporters();
    
    expect(exporters2.length).toBe(initialCount);
    
    expect(exporters1).not.toBe(exporters2);
  });
  
  test('Preserves the correct types of exporters', () => {
    const exporters = factory.getExporters();
    
    const jsonExporter = exporters.find(e => e.label === 'Export cognitive log (JSON)');
    expect(jsonExporter).toBeInstanceOf(CognitionLogJsonExporter);
    
    const txtExporter = exporters.find(e => e.label === 'Export cognitive log (TXT)');
    expect(txtExporter).toBeInstanceOf(CognitionLogTxtExporter);
  });
});
