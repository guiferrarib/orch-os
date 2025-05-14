import React, { createContext, useContext, useState, useRef } from 'react';
import { BrainVisualizationState, CoreEffect } from './types';

// Initial state for brain visualization
const initialBrainState: BrainVisualizationState = {
  coreGlows: [],
  corePulses: [],
  coreRipples: [],
  coreHighlights: [],
  activeRegion: null,
  collapsePulse: false,
  orbiting: false,
};

// Create context
interface BrainVisualizationContextValue extends BrainVisualizationState {
  setCoreGlows: React.Dispatch<React.SetStateAction<CoreEffect[]>>;
  setCorePulses: React.Dispatch<React.SetStateAction<CoreEffect[]>>;
  setCoreRipples: React.Dispatch<React.SetStateAction<CoreEffect[]>>;
  setCoreHighlights: React.Dispatch<React.SetStateAction<CoreEffect[]>>;
  setActiveRegion: React.Dispatch<React.SetStateAction<string | null>>;
  setCollapsePulse: React.Dispatch<React.SetStateAction<boolean>>;
  setOrbiting: React.Dispatch<React.SetStateAction<boolean>>;
  coreGlowId: React.MutableRefObject<number>;
  corePulseId: React.MutableRefObject<number>;
  coreRippleId: React.MutableRefObject<number>;
  coreHighlightId: React.MutableRefObject<number>;
  collapseTimeout: React.MutableRefObject<NodeJS.Timeout | null>;
}

const BrainVisualizationContext = createContext<BrainVisualizationContextValue | undefined>(undefined);

// Provider component
export const BrainVisualizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for visualizations
  const [coreGlows, setCoreGlows] = useState<CoreEffect[]>([]);
  const [corePulses, setCorePulses] = useState<CoreEffect[]>([]);
  const [coreRipples, setCoreRipples] = useState<CoreEffect[]>([]);
  const [coreHighlights, setCoreHighlights] = useState<CoreEffect[]>([]);
  
  // State for 3D region highlights and collapse pulse
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [collapsePulse, setCollapsePulse] = useState(false);
  const [orbiting, setOrbiting] = useState(false);
  
  // ID refs for animations
  const coreGlowId = useRef(0);
  const corePulseId = useRef(0);
  const coreRippleId = useRef(0);
  const coreHighlightId = useRef(0);
  const collapseTimeout = useRef<NodeJS.Timeout | null>(null);

  // Combine everything for the context value
  const contextValue = {
    coreGlows,
    corePulses,
    coreRipples,
    coreHighlights,
    activeRegion,
    collapsePulse,
    orbiting,
    setCoreGlows,
    setCorePulses,
    setCoreRipples,
    setCoreHighlights,
    setActiveRegion,
    setCollapsePulse, 
    setOrbiting,
    coreGlowId,
    corePulseId,
    coreRippleId,
    coreHighlightId,
    collapseTimeout,
  };

  return (
    <BrainVisualizationContext.Provider value={contextValue}>
      {children}
    </BrainVisualizationContext.Provider>
  );
};

// Hook for using the brain visualization context
export const useBrainVisualization = () => {
  const context = useContext(BrainVisualizationContext);
  if (context === undefined) {
    throw new Error('useBrainVisualization must be used within a BrainVisualizationProvider');
  }
  return context;
};
