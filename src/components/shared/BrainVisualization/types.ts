// Core effect types
export interface CoreEffect {
  id: number;
  core: string;
  createdAt: number;
}

// Visualization event types to handle various cognitive events
export type VisualizationEventType = 'neural_signal' | 'symbolic_retrieval' | 'neural_collapse' | 'symbolic_context_synthesized';

// Brain visualization state interface
export interface BrainVisualizationState {
  coreGlows: CoreEffect[];
  corePulses: CoreEffect[];
  coreRipples: CoreEffect[];
  coreHighlights: CoreEffect[];
  activeRegion: string | null;
  collapsePulse: boolean;
  orbiting: boolean;
}
