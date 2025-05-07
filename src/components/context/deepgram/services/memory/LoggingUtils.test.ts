// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { LoggingUtils } from '../../utils/LoggingUtils';

describe('LoggingUtils', () => {
  it('should log info and error with correct prefix', () => {
    const infoSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    LoggingUtils.logInfo('Info Message');
    LoggingUtils.logError('Error Message');
    LoggingUtils.logError('Error Message with Object', { foo: 1 });
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('[Transcription] Info Message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[Transcription] Error Message'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[Transcription] Error Message with Object'), { foo: 1 });
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
