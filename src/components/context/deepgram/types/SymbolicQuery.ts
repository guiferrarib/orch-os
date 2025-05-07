// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/**
 * Structure for symbolic queries associated with neural signals.
 * Adjust as needed.
 */
export interface SymbolicQuery {
  query: string;
  [key: string]: string | number | boolean | object | undefined;

}
