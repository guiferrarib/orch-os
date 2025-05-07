// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

/// <reference types="jest" />

import { TranscriptionSnapshotTracker } from "../services/transcription/TranscriptionSnapshotTracker";

describe("TranscriptionSnapshotTracker Basic Functionality", () => {
  let snapshotTracker: TranscriptionSnapshotTracker;

  beforeEach(() => {
    snapshotTracker = new TranscriptionSnapshotTracker();
  });

  test("filterTranscription removes existing content", () => {
    // First, add some content to the tracker
    const initialContent = "First line\nSecond line";
    snapshotTracker.updateSnapshot(initialContent);

    // Now try to filter a message containing both old and new content
    const newContent = "First line\nSecond line\nThird line";
    const filtered = snapshotTracker.filterTranscription(newContent);

    // Should only contain the new line
    expect(filtered).toBe("Third line");
  });

  test("filtering twice returns empty string", () => {
    const content = "Test message";
    
    // First filter should return the content
    const firstFilter = snapshotTracker.filterTranscription(content);
    expect(firstFilter).toBe("Test message");

    // Update the snapshot
    snapshotTracker.updateSnapshot(content);

    // Second filter should return empty
    const secondFilter = snapshotTracker.filterTranscription(content);
    expect(secondFilter).toBe("");
  });

  test("reset clears the snapshot", () => {
    const content = "Test message";
    
    // Add content to the tracker
    snapshotTracker.updateSnapshot(content);
    
    // Filtering should return empty string
    expect(snapshotTracker.filterTranscription(content)).toBe("");
    
    // Reset the tracker
    snapshotTracker.reset();
    
    // Now filtering should return the content again
    expect(snapshotTracker.filterTranscription(content)).toBe("Test message");
  });

  test("normalization handles whitespace and empty lines", () => {
    // Add some content with extra whitespace
    snapshotTracker.updateSnapshot("  Line  with    spaces  \n\n");
    
    // Filter should normalize both strings before comparison
    const filtered = snapshotTracker.filterTranscription("Line with spaces");
    expect(filtered).toBe("");
  });
}); 