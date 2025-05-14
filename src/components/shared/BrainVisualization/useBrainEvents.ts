import { useEffect } from 'react';
import { CognitionEvent } from '../../context/deepgram/types/CognitionEvent';
import { useBrainVisualization } from './BrainVisualizationContext';
import { coreActivationPoints } from './CorePositions';

// Helper to normalize intensity values to a scale of 0.2-1.0
function normalizeIntensity(value: number, min: number, max: number, defaultValue: number = 0.7): number {
  if (value === undefined || value === null) return defaultValue;
  // Clamp value between min and max
  const clampedValue = Math.max(min, Math.min(max, value));
  // Normalize to 0-1 range
  const normalized = (clampedValue - min) / (max - min);
  // Scale to 0.2-1.0 range (minimum intensity of 0.2, maximum of 1.0)
  return 0.2 + (normalized * 0.8);
}

/**
 * Hook to handle cognitive events and update brain visualization effects
 * @param cognitionEvents An array of cognitive events from the log
 */
export function useBrainEvents(cognitionEvents: CognitionEvent[] | null) {
  const {
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
  } = useBrainVisualization();

  useEffect(() => {
    if (!cognitionEvents?.length) return;
    
    const last = cognitionEvents[cognitionEvents.length - 1];
    
    if (last.type === 'neural_signal') {
      // Handle neural signal events - activate the core and add glow
      const core = last.core?.toLowerCase() || last.core?.toLowerCase();
      if (core) {
        setActiveRegion(core);
        setOrbiting(true);
        setTimeout(() => setOrbiting(false), 1200);
  
        // Add core glow
        if (coreActivationPoints[core]) {
          // Extract neural signal strength from event data
          // Use event's intensity property or fallback
          const signalIntensity = (last as any).intensity || 0.7;
          const intensity = normalizeIntensity(
            signalIntensity, 
            0, 1, 0.7
          );
          
          const id = coreGlowId.current++;
          setCoreGlows((prev) => [...prev, { 
            id, 
            core, 
            createdAt: Date.now(),
            intensity // Add intensity to affect visual properties
          }]);
          setTimeout(() => {
            setCoreGlows((prev) => prev.filter((g) => g.id !== id));
          }, 2000);
        }
      }
    }
    
    if (last.type === 'symbolic_retrieval') {
      // Handle symbolic retrieval events - activate core pulse
      const core = last.core?.toLowerCase() || last.core?.toLowerCase();
      if (core && coreActivationPoints[core]) {
        // Extract significance of symbolic retrieval
        // We'll use matchCount as a proxy for confidence
        const matchCount = (last as any).matchCount || 3;
        const intensity = normalizeIntensity(
          // Higher match count = stronger visual effect
          matchCount / 10, 
          0, 1, 0.7
        );
        
        const id = corePulseId.current++;
        setCorePulses((prev) => [...prev, { 
          id, 
          core, 
          createdAt: Date.now(),
          intensity 
        }]);
        setTimeout(() => {
          setCorePulses((prev) => prev.filter((g) => g.id !== id));
        }, 2000);
      }
    }
    
    if (last.type === 'neural_collapse') {
      // Handle neural collapse events - activate collapse pulse and ripple
      setCollapsePulse(true);
      if (collapseTimeout.current) clearTimeout(collapseTimeout.current);
      collapseTimeout.current = setTimeout(() => setCollapsePulse(false), 800);
      
      // Add core ripple
      const core = last.selectedCore?.toLowerCase();
      if (core && coreActivationPoints[core]) {
        // Neural collapse events intensity based on available properties
        // Safely extract these values with fallbacks
        const numCandidates = (last as any).numCandidates || 3;
        const contradictionScore = (last as any).contradictionScore || 0.5;
        
        // Higher scores = stronger visual effect
        const baseIntensity = (numCandidates / 5) * 0.5 + (contradictionScore * 0.5);
        const intensity = normalizeIntensity(baseIntensity, 0, 1, 0.7);
        
        const id = coreRippleId.current++;
        setCoreRipples((prev) => [...prev, { 
          id, 
          core, 
          createdAt: Date.now(),
          intensity 
        }]);
        setTimeout(() => {
          setCoreRipples((prev) => prev.filter((g) => g.id !== id));
        }, 2000);
      }
    }
    
    if (last.type === 'symbolic_context_synthesized' && last.context?.modules) {
      // Handle symbolic context synthesized events - highlight all involved cores
      if (Array.isArray(last.context.modules)) {
        last.context.modules.forEach((mod: { core?: string }) => {
          const core = mod.core?.toLowerCase();
          if (core && coreActivationPoints[core]) {
            // For highlights, we can use the relative importance of this module
            // within the context synthesis
            const intensity = normalizeIntensity(0.7, 0, 1, 0.7); // Default for now
            
            const id = coreHighlightId.current++;
            setCoreHighlights((prev) => [...prev, { 
              id, 
              core, 
              createdAt: Date.now(),
              intensity 
            }]);
            setTimeout(() => {
              setCoreHighlights((prev) => prev.filter((h) => h.id !== id));
            }, 1400);
          }
        });
      }
    }
  }, [
    cognitionEvents, 
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
    collapseTimeout
  ]);
}
