// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TXT exporter for cognitive log
import { CognitionEvent } from '../../types/CognitionEvent';
import { CognitionLogExporter } from './CognitionLogExporter';

export class CognitionLogTxtExporter implements CognitionLogExporter {
  label = 'Export cognitive log (TXT)';
  export(log: CognitionEvent[], filename = 'symbolic_cognition_session.txt') {
    const txt = log.map(e => JSON.stringify(e, null, 2)).join('\n---\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
