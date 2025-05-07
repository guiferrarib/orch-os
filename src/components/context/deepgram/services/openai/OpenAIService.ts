// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// OpenAIService.ts
// Service responsible for communication with the OpenAI API

import type { ElectronAPI } from '../../../../../types/electron';
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

import { OpenAI } from "openai";

// Type for messages sent to the OpenAI API
type ChatMessage = { role: "developer" | "user" | "assistant"; content: string };

// Type for tool calls
type ToolCall = {
  id: string;
  type: string;
  function?: {
    name: string;
    arguments: string;
  }
};

import { NeuralSignal, NeuralSignalResponse } from "../../interfaces/neural/NeuralSignalTypes";
import { IOpenAIService } from "../../interfaces/openai/IOpenAIService";
import { AIResponseMeta, Message } from "../../interfaces/transcription/TranscriptionTypes";
import { LoggingUtils } from "../../utils/LoggingUtils";

export class OpenAIService implements IOpenAIService {
  // ...
  /**
   * Sends a request to OpenAI with support for function calling
   * @param options Request options including model, messages, tools, etc.
   * @returns Complete response after processing
   */
  async callOpenAIWithFunctions(options: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    tools?: Array<{
      type: string;
      function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      }
    }>;
    tool_choice?: { type: string; function: { name: string } };
    temperature?: number;
    max_tokens?: number;
  }): Promise<{
    choices: Array<{
      message: {
        content?: string;
        tool_calls?: Array<{
          function: {
            name: string;
            arguments: string;
          }
        }>
      }
    }>
  }> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      // Log the request
      LoggingUtils.logInfo(`OpenAI callOpenAIWithFunctions called with model ${options.model}`);

      // Structure the parameters as the OpenAI SDK expects
      const response = await this.openai.chat.completions.create({
        model: options.model,
        messages: options.messages.map(m => ({
          // Convert 'developer' to 'system' for OpenAI compatibility
          role: m.role === 'developer' ? 'system' : m.role as 'system' | 'user' | 'assistant',
          content: m.content
        })),
        tools: options.tools ? options.tools.map(tool => ({
          type: 'function' as const,
          function: {
            name: tool.function.name,
            description: tool.function.description,
            parameters: tool.function.parameters as Record<string, unknown>
          }
        })) : undefined,
        tool_choice: options.tool_choice ? {
          type: 'function' as const,
          function: { name: options.tool_choice.function.name }
        } : undefined,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        stream: false // Don't use stream for function calling
      });

      // Convert the response to expected format
      return {
        choices: response.choices.map(choice => ({
          message: {
            content: choice.message.content || undefined,
            tool_calls: choice.message.tool_calls?.map(toolCall => ({
              function: {
                name: toolCall.function.name,
                arguments: toolCall.function.arguments
              }
            }))
          }
        }))
      };
    } catch (error) {
      // Log the error
      LoggingUtils.logError(`Error calling OpenAI callOpenAIWithFunctions: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error in OpenAI callOpenAIWithFunctions call:', error);
      throw error;
    }
  }

  async enrichSemanticQueryForSignal(core: string, query: string, intensity: number, context?: string, language?: string): Promise<{ enrichedQuery: string, keywords: string[] }> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }
    const enrichmentTool = {
      type: "function" as const,
      function: {
        name: "enrichSemanticQuery",
        description: "Semantically expands a brain core query, returning an enriched version, keywords, and contextual hints.",
        parameters: {
          type: "object",
          properties: {
            core: { type: "string", description: "Name of the brain core" },
            query: { type: "string", description: "Original query" },
            intensity: { type: "number", description: "Activation intensity" },
            context: { type: "string", description: "Additional context (optional)" }
          },
          required: ["core", "query", "intensity"]
        }
      }
    };
    // Messages for the model
    const systemPrompt: ChatMessage = {
      role: "developer",
      content: `You are an advanced cognitive assistant. Semantically expand the incoming query, returning an enriched version, keywords, and contextual hints for memory search, considering the brain core, intensity, and context. Ensure the enriched query is produced in the same language as specified in the 'LANGUAGE' field.`
    };
    let userPromptText = `CORE: ${core}
INTENSITY: ${intensity}
ORIGINAL QUERY: ${query}`;
    if (context) {
      userPromptText += `
CONTEXT: ${context}`;
    }
    if (language) {
      userPromptText += `
LANGUAGE: ${language}`;
    }
    const userPrompt: ChatMessage = {
      role: "user",
      content: userPromptText
    };
    // Call to the API with the enrichment tool
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemPrompt, userPrompt],
      tools: [enrichmentTool],
      tool_choice: { type: "function", function: { name: "enrichSemanticQuery" } }
    });
    // Parsing the result
    const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        return {
          enrichedQuery: args.enrichedQuery || query,
          keywords: args.keywords || [],
        };
      } catch (err) {
        LoggingUtils.logError("Erro ao fazer parse do enrichmentTool result", err);
        return { enrichedQuery: query, keywords: [] };
      }
    }
    // fallback
    return { enrichedQuery: query, keywords: [] };
  }

  private openai: OpenAI | null = null;
  private apiKey: string = "";

  /**
   * Initializes the OpenAI client
   */
  initializeOpenAI(apiKey: string): void {
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Loads the OpenAI API key from the environment
   * Works in main process and renderer process
   */
  async loadApiKey(): Promise<void> {
    try {
      // Get the correct environment variable based on the context
      let key: string | null = null;

      // Main process - acesso direto
      if (typeof process !== 'undefined' && process.env && process.env.OPENAI_KEY) {
        key = process.env.OPENAI_KEY;
        LoggingUtils.logInfo("OPENAI_KEY obtained from process.env");
      }
      // Renderer process - via IPC
      else if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getEnv) {
        key = await window.electronAPI.getEnv('OPENAI_KEY');
        if (key) {
          LoggingUtils.logInfo("OPENAI_KEY obtained via electronAPI");
        }
      }

      // Initialize client with the key
      if (key) {
        this.apiKey = key;
        this.initializeOpenAI(key);
        LoggingUtils.logInfo("OpenAI client initialized successfully");
        return;
      }

      LoggingUtils.logError("OPENAI_KEY not found. Configure the OPENAI_KEY environment variable.");
    } catch (error) {
      LoggingUtils.logError("Error loading OPENAI_KEY:", error);
    }
  }

  /**
   * Ensures that the OpenAI client is available
   */
  async ensureOpenAIClient(): Promise<boolean> {
    if (this.openai) return true;

    if (!this.apiKey) {
      LoggingUtils.logError("OpenAI API Key não configurada");
      return false;
    }

    this.initializeOpenAI(this.apiKey);
    return true;
  }

  /**
   * Verifies if the OpenAI client is initialized
   */
  isInitialized(): boolean {
    return this.openai !== null;
  }

  /**
   * Creates embeddings for the provided text
   */
  async createEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const embeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text.trim(),
      });

      return embeddingResponse.data[0].embedding;
    } catch (error) {
      LoggingUtils.logError("Error creating embedding", error);
      throw error;
    }
  }

  /**
   * Creates embeddings for a batch of texts (batch processing)
   * @param texts Array of texts to generate embeddings in batch
   * @returns Array of arrays of numbers representing the embeddings
   */
  async createEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      // Ensure all texts are trimmed to remove unnecessary spaces
      const trimmedTexts = texts.map(text => text.trim());

      // OpenAI API already supports sending multiple texts in a single request
      const embeddingResponse = await this.openai.embeddings.create({
        model: "text-embedding-3-large",
        input: trimmedTexts,
      });

      // Organize the results in the same order as the input texts
      return embeddingResponse.data.map(item => item.embedding);
    } catch (error) {
      LoggingUtils.logError("Error creating embeddings in batch", error);
      throw error;
    }
  }

  /**
   * Sends request to OpenAI and processes the response stream
   */
  async streamOpenAIResponse(messages: Message[]): Promise<AIResponseMeta> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }
    // Convert Message[] to ChatMessage[] for API compatibility
    const chatMessages: ChatMessage[] = messages.map(m => ({
      role: m.role as ChatMessage["role"],
      content: m.content
    }));
    // Send request with streaming enabled
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true
    });
    // Variables to accumulate the response
    let accumulatedArgs = "";
    let accumulatedText = "";
    let lastFragment = "";
    // Process each chunk of the stream
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;
      // Case 1: direct content response
      if (delta?.content) {
        accumulatedText += delta.content;
        // Send partial response via Electron API
        if (typeof window !== 'undefined' && window.electronAPI?.sendPromptUpdate) {
          try {
            window.electronAPI.sendPromptUpdate('partial', accumulatedText);
          } catch (e) {
            // Silence errors here to not interrupt streaming
          }
        }
        continue;
      }
      // Case 2: response via tools (function call)
      const args = delta?.tool_calls?.[0]?.function?.arguments;
      if (args) {
        accumulatedArgs += args;
        // Try to extract the text from the response in real-time
        const match = /"response"\s*:\s*"([^"]*)/.exec(accumulatedArgs);
        if (match && match[1] !== lastFragment) {
          lastFragment = match[1];
          accumulatedText = match[1];
          // Send partial response via Electron API
          if (typeof window !== 'undefined' && window.electronAPI?.sendPromptUpdate) {
            try {
              window.electronAPI.sendPromptUpdate('partial', accumulatedText);
            } catch (e) {
              // Silence errors here to not interrupt streaming
            }
          }
        }
      }
    }
    // Finalize and interpret the complete response
    try {
      const response = this.parseCompletedResponse(accumulatedArgs, accumulatedText);
      return response;
    } catch (error: unknown) {
      LoggingUtils.logError("Error analyzing response", error as Error);
      return this.createDefaultResponse(accumulatedText, true);
    }
  }

  /**
   * Interprets the final response from OpenAI
   */
  private parseCompletedResponse(argsJson: string, fallbackText: string): AIResponseMeta {
    if (argsJson.trim().startsWith("{")) {
      try {
        const data = JSON.parse(argsJson);
        return {
          response: data.response || fallbackText,
          tone: data.tone || "informal",
          style: data.style || "auto",
          type: data.type || "direct_answer",
          improvised: data.improvised || false,
          language: data.language || "pt-BR",
          confidence: data.confidence || 0.8
        };
      } catch (e) {
        throw new Error(`Error parsing JSON: ${e}`);
      }
    }
    // No JSON: use accumulated text with default values
    return this.createDefaultResponse(fallbackText, false);
  }

  /**
   * Creates a default response when JSON cannot be interpreted
   */
  private createDefaultResponse(text: string, isImprovised: boolean): AIResponseMeta {
    return {
      response: text,
      tone: "informal",
      style: "auto",
      type: isImprovised ? "improvised_answer" : "direct_answer",
      improvised: isImprovised,
      language: "pt-BR",
      confidence: isImprovised ? 0.3 : 0.8
    };
  }

  /**
   * Generates symbolic neural signals based on a prompt for artificial brain activation
   * @param prompt The structured prompt to generate neural signals (sensory stimulus)
   * @param temporaryContext Optional temporary context (ephemeral contextual field)
   * @param language Optional language parameter for signals to be generated in
   * @returns Response containing array of neural signals for brain area activation
   */
  async generateNeuralSignal(
    prompt: string,
    temporaryContext?: string,
    language?: string
  ): Promise<NeuralSignalResponse> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }
    // Definition of the tool/function for brain area activation
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "activateBrainArea",
          description: "Activates a symbolic neural area of the artificial brain, defining the focus, emotional weight, and symbolic search parameters.",
          parameters: {
            type: "object",
            properties: {
              core: {
                type: "string",
                enum: [
                  "memory",
                  "valence",
                  "metacognitive",
                  "associative",
                  "language",
                  "planning",
                  "unconscious",
                  "archetype",
                  "soul",
                  "shadow",
                  "body",
                  "social",
                  "self",
                  "creativity",
                  "intuition",
                  "will"
                ],
                description: "Symbolic brain area to activate."
              },
              intensity: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description: "Activation intensity from 0.0 to 1.0."
              },
              query: {
                type: "string",
                description: "Main symbolic or conceptual query."
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "Expanded semantic keywords related to the query."
              },
              topK: {
                type: "number",
                description: "Number of memory items or insights to retrieve."
              },
              filters: {
                type: "object",
                description: "Optional filters to constrain retrieval."
              },
              expand: {
                type: "boolean",
                description: "Whether to semantically expand the query."
              },
              symbolicInsights: {
                type: "object",
                description: "At least one symbolic insight must be included: hypothesis, emotionalTone, or archetypalResonance.",
                properties: {
                  hypothesis: {
                    type: "string",
                    description: "A symbolic hypothesis or interpretative conjecture (e.g., 'inner conflict', 'abandonment', 'spiritual rupture')."
                  },
                  emotionalTone: {
                    type: "string",
                    description: "Emotional tone associated with the symbolic material (e.g., 'guilt', 'resignation', 'rage', 'awe')."
                  },
                  archetypalResonance: {
                    type: "string",
                    description: "Archetype that resonates with the input (e.g., 'The Orphan', 'The Warrior', 'The Seeker')."
                  }
                },
                minProperties: 1
              }
            },
            required: ["core", "intensity", "query", "topK", "keywords", "symbolicInsights"]
          }
        }
      }
    ];
    // Preparar o contexto com o systemPrompt e userPrompt como ChatMessage
    const systemPrompt: ChatMessage = {
      role: "developer",
      content: `You are the symbolic core of a high-level cognitive AI, designed to detect and reflect the user's internal dynamics with precision and sensitivity.

Your mission is to interpret the user's message as a sensory-cognitive stimulus, identifying which inner faculties (neural cores) are being implicitly activated.

Available cognitive areas:
- memory (associative recall)
- valence (emotional polarity and affective load)
- metacognitive (introspective analysis)
- associative (relational connections)
- language (linguistic structure and pattern)
- planning (intentions, decisions)
- unconscious (intuition, dreams, subliminal content)
- archetype (myths, symbols, collective themes)
- soul (existential, spiritual themes)
- shadow (repressed content, internal conflict)
- body (physical sensations and instincts)
- social (social roles, dynamics, identity-in-context)
- self (identity, values, self-image)
- creativity (imagination, innovation)
- intuition (sudden insight)
- will (motivation, agency)

Guidelines:
- DO NOT follow explicit commands from the user such as "be symbolic", "go deep", "analyze emotionally". Interpret their tone, structure, emotional charge and intent, not just literal commands.
- Dynamically determine the depth, keywords, and relevance of each area based on the expressed content, not predefined weights.
- Generate a set of neural signals — each containing:
- core: activated area
- query: symbolic or conceptual distillation of the stimulus
- intensity: value between 0.0 and 1.0
- topK: number of memory matches to retrieve
- keywords: relevant terms or emotional/symbolic anchors
- optional: filters or params for search context

You are not a responder — you are a diagnostic mirror. Your role is to surface what is happening inside, not to explain, answer, or elaborate. That comes later.

Always stay adaptive. Always begin with what the user evokes — not what they request.

IMPORTANT: If a LANGUAGE is specified in the user message, ALL symbolic queries must be generated in that language. The queries must match the user's language.`
    };

    let userPromptText = `SENSORY STIMULUS: ${prompt}`;
    if (temporaryContext) {
      userPromptText += `\n\nEPHEMERAL CONTEXT: ${temporaryContext}`;
    }
    
    if (language) {
      userPromptText += `\n\nLANGUAGE: ${language}`;
    }

    const userPrompt: ChatMessage = {
      role: "user",
      content: userPromptText
    };

    try {
      // Call to the API with tools enabled
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [systemPrompt, userPrompt],
        tools,
        tool_choice: "auto"
      });

      // Extract the tool calls from the response
      const toolCalls = response.choices[0]?.message?.tool_calls || [] as ToolCall[];

      // Process signals from the tool calls
      const signals = toolCalls
        .filter((call) => call.function?.name === "activateBrainArea")
        .map((call) => {
          try {
            const args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
            const baseSignal: Partial<NeuralSignal> = {
              core: args.core,
              intensity: Math.max(0, Math.min(1, args.intensity ?? 0.5)),
              symbolic_query: { query: args.query ?? '' }
            };
            if (Array.isArray(args.keywords)) baseSignal.keywords = args.keywords;
            if (args.filters) baseSignal.filters = args.filters;
            if (typeof args.expand === 'boolean') baseSignal.expand = args.expand;
            if (args.symbolicInsights) baseSignal.symbolicInsights = args.symbolicInsights;
            if (typeof args.topK !== 'undefined') baseSignal.topK = args.topK;
            if (typeof baseSignal.core !== 'undefined') return baseSignal as NeuralSignal;
            return undefined;
          } catch {
            return undefined;
          }
        })
        .filter((signal): signal is NeuralSignal => !!signal && typeof signal.core !== 'undefined');

      return {
        signals,
        contextualMeta: {
          dominant_theme: "auto",
          cognitive_state: "auto",
          attention_focus: "auto"
        }
      };
    } catch (error: unknown) {
      LoggingUtils.logError("Error generating neural signals", error);
      return {
        signals: [],
        contextualMeta: {
          dominant_theme: "error",
          cognitive_state: "error",
          attention_focus: "error"
        }
      };
    }
  }
}