// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import { SymbolicInsight } from './SymbolicInsight';
import { SymbolicQuery } from './SymbolicQuery';
import { SymbolicContext } from './SymbolicContext';
import { UserIntentWeights } from '../symbolic-cortex/integration/ICollapseStrategyService';

export type CognitionEvent =
  | { type: 'raw_prompt'; timestamp: string; content: string }
  | { type: 'temporary_context'; timestamp: string; context: string }
  | { type: 'neural_signal'; timestamp: string; core: string; symbolic_query: SymbolicQuery; intensity: number; topK: number; params: Record<string, unknown> }
  | { type: 'symbolic_retrieval'; timestamp: string; core: string; insights: SymbolicInsight[]; matchCount: number; durationMs: number }
  | { type: 'fusion_initiated'; timestamp: string }
  | { type: 'neural_collapse'; timestamp: string; isDeterministic: boolean; selectedCore: string; numCandidates: number; temperature?: number; emotionalWeight: number; contradictionScore: number; justification?: string; userIntent?: UserIntentWeights; insights?: SymbolicInsight[]; emergentProperties?: string[] }
  | { type: 'symbolic_context_synthesized'; timestamp: string; context: SymbolicContext }
  | { type: 'gpt_response'; timestamp: string; response: string; symbolicTopics?: string[]; insights?: SymbolicInsight[] }
  | { type: 'emergent_patterns'; timestamp: string; patterns: string[]; metrics?: { archetypalStability?: number; cycleEntropy?: number; insightDepth?: number } };
