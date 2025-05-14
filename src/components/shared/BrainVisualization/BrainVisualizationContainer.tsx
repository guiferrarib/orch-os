import React from 'react';
import { BrainVisualizationProvider } from './BrainVisualizationContext';
import { useBrainEvents } from './useBrainEvents';
import { CognitionEvent } from '../../context/deepgram/types/CognitionEvent.ts';
import BrainModel from './BrainModel';

interface BrainVisualizationContainerProps {
  cognitionEvents: CognitionEvent[] | null;
  width?: string;
  height?: string;
}

/**
 * Container component for the 3D brain visualization
 * This component sets up all the necessary context and event handling
 */
export const BrainVisualizationContainer: React.FC<BrainVisualizationContainerProps> = ({
  cognitionEvents,
  width = '100%',
  height = '280px'
}) => {
  return (
    <BrainVisualizationProvider>
      <BrainVisualizationContent 
        cognitionEvents={cognitionEvents} 
        width={width} 
        height={height} 
      />
    </BrainVisualizationProvider>
  );
};

// Inner component to use hooks with context
const BrainVisualizationContent: React.FC<BrainVisualizationContainerProps> = ({
  cognitionEvents,
  width,
  height
}) => {
  // Process cognitive events
  useBrainEvents(cognitionEvents);

  // Render the brain model
  return (
    <div style={{ 
      width, 
      height, 
      position: 'relative', 
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <BrainModel />
    </div>
  );
};

export default BrainVisualizationContainer;
