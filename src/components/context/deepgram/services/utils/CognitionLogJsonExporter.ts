// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// JSON exporter for cognitive log
import { CognitionEvent } from '../../types/CognitionEvent';
import { CognitionLogExporter } from './CognitionLogExporter';

export class CognitionLogJsonExporter implements CognitionLogExporter {
  label = 'Export cognitive log (JSON)';
  export(log: CognitionEvent[], filename = 'symbolic_cognition_session.json') {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
