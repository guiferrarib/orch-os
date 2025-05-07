// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Structure for synthesized symbolic context.
 */
export interface SymbolicContext {
  summary: string;
  [key: string]: string | number | boolean | object | undefined;

}
