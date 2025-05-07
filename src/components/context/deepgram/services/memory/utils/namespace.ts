// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// utils/namespace.ts
// Utility to normalize namespaces from speaker names

/**
 * Normalizes a namespace for consistent usage throughout the application.
 * Example: "João da Silva" -> "joao-da-silva"
 */
export function normalizeNamespace(speaker: string): string {
  return speaker
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // remove hyphens at the ends
    .replace(/-{2,}/g, '-') // double hyphens
    || 'default';
}
