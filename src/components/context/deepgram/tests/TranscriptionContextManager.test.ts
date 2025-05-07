// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// TranscriptionContextManager.test.ts
// Testes para o TranscriptionContextManager

import { TranscriptionContextManager } from "../services/transcription/TranscriptionContextManager";

describe("TranscriptionContextManager", () => {
  beforeEach(() => {
    // Clear the singleton between tests
    const instance = TranscriptionContextManager.getInstance();
    instance.clearTemporaryContext();
  });
  
  test("Should maintain the singleton across the entire application", () => {
    // Get two instances in different locations
    const instance1 = TranscriptionContextManager.getInstance();
    const instance2 = TranscriptionContextManager.getInstance();
    
    // Verify if they are the same instance
    expect(instance1).toBe(instance2);
  });
  
  test("Should persist the context between multiple calls", () => {
    const instance = TranscriptionContextManager.getInstance();
    
    // Set the context
    instance.setTemporaryContext("Test instructions");
    
    // Get a new instance (which should be the same since it's a singleton)
    const anotherInstance = TranscriptionContextManager.getInstance();
    
    // Verify that the context is present in the new instance
    expect(anotherInstance.getTemporaryContext()).toBe("Test instructions");
  });
  
  test("Should not clear the context when undefined is passed", () => {
    const instance = TranscriptionContextManager.getInstance();
    
    // Set the initial context
    instance.setTemporaryContext("Initial context");
    
    // Try to update with undefined
    instance.setTemporaryContext(undefined);
    
    // Verify that the context remains
    expect(instance.getTemporaryContext()).toBe("Initial context");
  });
  
  test("Should replace the previous context when an empty string is passed", () => {
    const instance = TranscriptionContextManager.getInstance();
    
    // Set the initial context
    instance.setTemporaryContext("Initial context");
    
    // Update with empty string (now treated as a valid new context)
    instance.setTemporaryContext("");
    
    // Verify that the context was replaced with an empty string
    expect(instance.getTemporaryContext()).toBe("");
    // hasTemporaryContext should return false for empty string
    expect(instance.hasTemporaryContext()).toBe(false);
  });
  
  test("hasTemporaryContext should return correctly", () => {
    const instance = TranscriptionContextManager.getInstance();
    
    // Initially should not have context
    expect(instance.hasTemporaryContext()).toBe(false);
    
    // Set the context
    instance.setTemporaryContext("Test context");
    
    // Now should have context
    expect(instance.hasTemporaryContext()).toBe(true);
    
    // Clear and verify again
    instance.clearTemporaryContext();
    expect(instance.hasTemporaryContext()).toBe(false);
  });
}); 