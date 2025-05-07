// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

export interface BatchItem {
  id: string;
  text: string;
  role: string;
  order: number;
  part?: string;
  hash: string;
  metadata: Record<string, string | number | boolean | string[]>;
}
