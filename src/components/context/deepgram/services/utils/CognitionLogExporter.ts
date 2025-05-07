// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// Interface for cognitive log exporters
import { CognitionEvent } from '../../types/CognitionEvent';

export interface CognitionLogExporter {
  label: string;
  export(log: CognitionEvent[], filename?: string): void;
}
