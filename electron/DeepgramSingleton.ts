// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// DeepgramSingleton.ts
import { createClient, DeepgramClient } from "@deepgram/sdk";

export class DeepgramSingleton {
  private static instance: DeepgramClient | null = null;
  private static apiKey: string | null = null;

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(apiKey: string): DeepgramClient {
    if (!DeepgramSingleton.instance || DeepgramSingleton.apiKey !== apiKey) {
      console.log("🔧 Creating Deepgram singleton instance");
      DeepgramSingleton.apiKey = apiKey;
      DeepgramSingleton.instance = createClient(apiKey);
    }
    return DeepgramSingleton.instance;
  }

  public static reset(): void {
    DeepgramSingleton.instance = null;
    DeepgramSingleton.apiKey = null;
  }
}