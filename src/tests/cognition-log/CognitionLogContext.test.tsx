// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { CognitionLogProvider, useCognitionLog } from '../../components/context/CognitionLogContext';
import symbolicCognitionTimelineLogger from '../../components/context/deepgram/services/utils/SymbolicCognitionTimelineLoggerSingleton';
import cognitionLogExporterFactory from '../../components/context/deepgram/services/utils/CognitionLogExporterFactory';
import { CognitionEvent } from '../../components/context/deepgram/types/CognitionEvent';

jest.mock('../../components/context/deepgram/services/utils/SymbolicCognitionTimelineLoggerSingleton', () => ({
  __esModule: true,
  default: {
    getTimeline: jest.fn(),
    clear: jest.fn()
  }
}));

jest.mock('../../components/context/deepgram/services/utils/CognitionLogExporterFactory', () => {
  const mockExporter = {
    label: 'Mock Exporter',
    export: jest.fn()
  };
  
  return {
    __esModule: true,
    default: {
      getExporters: jest.fn().mockReturnValue([mockExporter])
    }
  };
});

describe('CognitionLogContext', () => {
  const mockEvents: CognitionEvent[] = [
    { type: 'raw_prompt', timestamp: '2025-04-29T18:30:00.000Z', content: 'Test prompt' },
    { type: 'temporary_context', timestamp: '2025-04-29T18:30:05.000Z', context: 'Test context' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (symbolicCognitionTimelineLogger.getTimeline as jest.Mock).mockReturnValue(mockEvents);
  });

  test('Provides access to events through the useCognitionLog hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CognitionLogProvider>{children}</CognitionLogProvider>
    );
    const { result } = renderHook(() => useCognitionLog(), { wrapper });
    expect(result.current.events).toEqual(mockEvents);
  });

  test('Provides access to exporters through the useCognitionLog hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CognitionLogProvider>{children}</CognitionLogProvider>
    );
    const { result } = renderHook(() => useCognitionLog(), { wrapper });
    expect(result.current.exporters).toHaveLength(1);
    expect(result.current.exporters[0].label).toBe('Mock Exporter');
  });

  test('Calls the logger clear method when clearEvents is invoked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CognitionLogProvider>{children}</CognitionLogProvider>
    );

    const { result } = renderHook(() => useCognitionLog(), { wrapper });
    act(() => {
      result.current.clearEvents();
    });
    expect(symbolicCognitionTimelineLogger.clear).toHaveBeenCalledTimes(1);
  });

  test('Calls the exporter export method with the correct exporter when exportEvents is invoked', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CognitionLogProvider>{children}</CognitionLogProvider>
    );

    const { result } = renderHook(() => useCognitionLog(), { wrapper });
    act(() => {
      result.current.exportEvents('Mock Exporter');
    });
    const mockExporter = cognitionLogExporterFactory.getExporters()[0];
    expect(mockExporter.export).toHaveBeenCalledTimes(1);
    expect(mockExporter.export).toHaveBeenCalledWith(mockEvents);
  });

  test('Does not call any export method if the exporter is not found', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CognitionLogProvider>{children}</CognitionLogProvider>
    );

    const { result } = renderHook(() => useCognitionLog(), { wrapper });
    act(() => {
      result.current.exportEvents('Exportador Inexistente');
    });
    const mockExporter = cognitionLogExporterFactory.getExporters()[0];
    expect(mockExporter.export).not.toHaveBeenCalled();
  });

  test('Periodically updates events', () => {
    jest.useFakeTimers();
    render(
      <CognitionLogProvider>
        <div>Teste</div>
      </CognitionLogProvider>
    );
    expect(symbolicCognitionTimelineLogger.getTimeline).toHaveBeenCalled();
    jest.clearAllMocks();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(symbolicCognitionTimelineLogger.getTimeline).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('useCognitionLog throws error when used outside of provider', () => {
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => {
      renderHook(() => useCognitionLog());
    }).toThrow('useCognitionLog must be used within a CognitionLogProvider');
    console.error = originalError;
  });
});
