// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Guilherme Ferrari Brescia

/* eslint-disable no-undef */
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  if (console.error.mockRestore) console.error.mockRestore();
  if (console.warn.mockRestore) console.warn.mockRestore();
}); 