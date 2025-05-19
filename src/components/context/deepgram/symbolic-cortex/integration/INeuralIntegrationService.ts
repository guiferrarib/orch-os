// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

export interface INeuralIntegrationService {
  integrate(
    neuralResults: Array<{
      core: string;
      intensity: number;
      output: string;
      insights: Record<string, unknown>;
    }>,
    originalInput: string,
    contextualMeta: Record<string, unknown>,
    language?: string
  ): Promise<string>;
}
