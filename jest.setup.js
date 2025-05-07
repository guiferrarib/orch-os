// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Guilherme Ferrari Brescia

/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('jest');
require('openai/shims/node');

// Add TextDecoder and TextEncoder for gpt-tokenizer
const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Mock import.meta.env for Vite compatibility in Jest
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { DEV: true, PROD: false, BASE_URL: '/' } } },
  writable: true,
});
