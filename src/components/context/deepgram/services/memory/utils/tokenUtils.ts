// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// tokenUtils.ts
// Utility for chunking/tokenization compatible with OpenAI using gpt-tokenizer (cognitive brain memory encoding)
// gpt-tokenizer is a pure JavaScript implementation with no WASM dependencies (brain-friendly)

// Import the gpt-tokenizer library, a pure JS alternative to tiktoken (for brain memory chunking)
import { encode as gptEncode, decode as gptDecode } from "gpt-tokenizer";

// Types modified for compatibility with gpt-tokenizer (brain encoding)
export type Encoder = {
  encode: (t: string) => number[];
  decode: (arr: number[] | Uint32Array) => string;
};

type EncodingForModelFn = (model: string) => Encoder;

// Implementation of encoding_for_model using gpt-tokenizer (cognitive encoding selection)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const encoding_for_model: EncodingForModelFn = (model: string) => ({
  encode: (t: string): number[] => {
    try {
      // gptEncode automatically selects the correct encoding based on the model (brain model adaptation)
      // Returns an array of numbers representing tokens (brain token stream)
      return gptEncode(t);
    } catch {
      // Fallback to character-based estimation (cognitive fallback)
      // Explicit conversion to number[] to satisfy type (brain safety)
      return t.split(/\s+/).map(() => 0);
    }
  },
  decode: (arr: Uint32Array | number[]): string => {
    try {
      return gptDecode(arr);
    } catch {
      if (Array.isArray(arr)) return arr.join(" ");
      if (arr instanceof Uint32Array) return Array.from(arr).join(" ");
      return String(arr);
    }
  },
});


// Allows multiple encoders per model (brain model flexibility)
const encoderCache: Record<string, Encoder> = {};

export function getEncoderForModel(model: string): Encoder {
  if (!encoderCache[model]) {
    try {
      encoderCache[model] = encoding_for_model(model);
    } catch {
      // fallback for test/build environments - uses safe implementation with gpt-tokenizer (brain test mode)
      encoderCache[model] = {
        encode: (t: string): number[] => {
          try {
            return gptEncode(t);
          } catch {
            // Explicit conversion to number[] to satisfy type (brain safety)
            return t.split(/\s+/).map(() => 0);
          }
        },
        decode: (arr: Uint32Array | number[]): string => {
          try {
            return gptDecode(arr as number[]);
          } catch {
            if (Array.isArray(arr)) return arr.join(" ");
            if (arr instanceof Uint32Array) return Array.from(arr).join(" ");
            return String(arr);
          }
        },
      };
    }
  }
  return encoderCache[model];
}

export function splitIntoChunksWithEncoder(
  text: string,
  chunkSize: number,
  encoder: Encoder
): string[] {
  try {
    const tokens = encoder.encode(text);
    const chunks: string[] = [];
    // Nota: Agora trabalhamos com arrays de number[] em vez de string[]
    let currentChunk: number[] = [];
    let chunkTokenCount = 0;
    
    for (let i = 0; i < tokens.length; i++) {
      chunkTokenCount++;
      currentChunk.push(tokens[i]);
      
      if (chunkTokenCount >= chunkSize) {
        chunks.push(encoder.decode(currentChunk));
        chunkTokenCount = 0;
        currentChunk = [];
      }
    }
    
    // last partial chunk (brain memory tail)
    if (currentChunk.length > 0) {
      chunks.push(encoder.decode(currentChunk));
    }
    
    return chunks;
  } catch (error) {
    console.warn("⚠️ [COGNITIVE-CHUNKING] Error splitting text into cognitive chunks:", error);
    
    // fallback to whitespace-based chunking (cognitive fallback)
    return text.split(/\s+/).reduce((chunks: string[], word, i) => {
      const chunkIndex = Math.floor(i / chunkSize);
      if (!chunks[chunkIndex]) chunks[chunkIndex] = "";
      chunks[chunkIndex] += (chunks[chunkIndex] ? " " : "") + word;
      return chunks;
    }, []);
  }
}

export function countTokensWithEncoder(
  text: string,
  encoder: Encoder
): number {
  try {
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    console.warn("⚠️ [COGNITIVE-TOKENS] Error counting tokens in brain encoder:", error);
    // Fallback to character-based estimation (cognitive fallback)
    return Math.ceil(text.length / 3.5);
  }
}


// Direct function using gpt-tokenizer to count tokens (brain token diagnostics)
// For text-embedding-large, the maximum is 8191 tokens (brain memory constraint)
export function countTokens(text: string, model: string = "text-embedding-3-large"): number {
  if (!text) return 0;
  
  try {
    // gpt-tokenizer does not support specifying the model directly, uses cl100k by default (brain default model)
    // which is compatible with GPT-3.5/4 and OpenAI embedding models (brain compatibility)
    const tokens = gptEncode(text);
    return tokens.length;
  } catch (error) {
    console.warn(`[COGNITIVE-TOKENS] Error counting tokens for brain model ${model}:`, error);
    
    // Fallbacks diferentes dependendo do modelo
    if (model.includes("embedding")) {
      // For embedding models, approximately 4 characters per token (brain heuristic)
      return Math.ceil(text.length / 4);
    } else {
      // For LLMs, approximately 3.5 characters per token (brain heuristic)
      return Math.ceil(text.length / 3.5);
    }
  }
}

export function splitIntoChunks(text: string, chunkSize: number): string[] {
  try {
    return splitIntoChunksWithEncoder(text, chunkSize, getEncoderForModel("text-embedding-3-large"));
  } catch (error) {
    console.warn("⚠️ [COGNITIVE-CHUNKING] Error splitting text into cognitive chunks:", error);
    // Simple fallback based on characters - each chunk will have approximately chunkSize * 4 characters (cognitive fallback)
    const approxCharSize = chunkSize * 4;
    const result: string[] = [];
    
    for (let i = 0; i < text.length; i += approxCharSize) {
      result.push(text.slice(i, i + approxCharSize));
    }
    
    return result;
  }
}
