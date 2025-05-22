// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { CognitionEvent } from '../../../../context/deepgram/types/CognitionEvent';

/**
 * Pure UI component for rendering a single cognition event in the timeline.
 * No logic, no mutation, only visual representation.
 * SOLID: Single Responsibility Principle.
 */
export interface CognitionEventUIProps {
  event: CognitionEvent;
  idx: number;
  onClick?: (event: CognitionEvent) => void;
  duration?: { value: string; color: string };
}

// Define the background colors for each event type to match modal colors
const eventColors: Record<string, string> = {
  raw_prompt: 'bg-blue-700',
  temporary_context: 'bg-purple-700',
  neural_signal: 'bg-amber-700',
  neural_collapse: 'bg-pink-700',
  symbolic_retrieval: 'bg-green-700',
  fusion_initiated: 'bg-orange-700',
  symbolic_context_synthesized: 'bg-indigo-700',
  gpt_response: 'bg-red-700',
  emergent_patterns: 'bg-teal-700',
};

// Use the colors to create the icons
const eventTypeIcons: Record<string, React.ReactNode> = {
  raw_prompt: <div className={`w-9 h-9 rounded-full ${eventColors.raw_prompt} flex items-center justify-center text-white overflow-hidden text-xl`}>🧠</div>,
  temporary_context: <div className={`w-8 h-8 rounded-full ${eventColors.temporary_context} flex items-center justify-center text-white overflow-hidden text-xl`}>🧠</div>,
  neural_signal: <div className={`w-8 h-8 rounded-full ${eventColors.neural_signal} flex items-center justify-center text-white overflow-hidden text-xl`}>⚡</div>,
  neural_collapse: <div className={`w-8 h-8 rounded-full ${eventColors.neural_collapse} flex items-center justify-center text-white overflow-hidden text-xl`}>💥</div>,
  symbolic_retrieval: <div className={`w-8 h-8 rounded-full ${eventColors.symbolic_retrieval} flex items-center justify-center text-white overflow-hidden text-xl`}>🔍</div>,
  fusion_initiated: <div className={`w-8 h-8 rounded-full ${eventColors.fusion_initiated} flex items-center justify-center text-white overflow-hidden text-xl`}>🔥</div>,
  symbolic_context_synthesized: <div className={`w-8 h-8 rounded-full ${eventColors.symbolic_context_synthesized} flex items-center justify-center text-white overflow-hidden text-xl`}>🔗</div>,
  gpt_response: <div className={`w-8 h-8 rounded-full ${eventColors.gpt_response} flex items-center justify-center text-white overflow-hidden text-xl`}>💬</div>,
  emergent_patterns: <div className={`w-8 h-8 rounded-full ${eventColors.emergent_patterns} flex items-center justify-center text-white overflow-hidden text-xl`}>🌊</div>,
};

// Format event type for display with Title Case
const formatEventType = (type: string): string => {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const CognitionEventUI: React.FC<CognitionEventUIProps> = ({ event, idx, onClick, duration }) => {
  const icon = eventTypeIcons[event.type] || <span className="text-gray-400">⬛</span>;
  
  // Extract information based on event type
  const isNeuralSignal = event.type === 'neural_signal';
  const isRawPrompt = event.type === 'raw_prompt';
  
  // For neural signals, extract core and intensity
  const neuralCore = isNeuralSignal ? event.core : null;
  const neuralValue = isNeuralSignal ? `${event.intensity}%` : null;
  
  // Use specific colors and emojis for different neural types (like in the image)
  const getNeuralTypeColor = (type: string | null) => {
    if (type === 'valence') return 'text-amber-400';
    if (type === 'social') return 'text-blue-400';
    if (type === 'self') return 'text-green-400';
    if (type === 'unconscious') return 'text-purple-400';
    return 'text-amber-400'; // Default color
  };
  
  // Get neural type emoji
  const getNeuralTypeEmoji = (type: string | null) => {
    if (type === 'valence') return '🔥';
    if (type === 'social') return '👥';
    if (type === 'self') return '🧠';
    if (type === 'unconscious') return '🌌';
    return '✨'; // Default emoji
  };
  
  // Format time as HH:MM:SS.mmm manually to include milliseconds
  const formattedTime = event.timestamp ? (() => {
    const date = new Date(event.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  })() : '';

  return (
    <div className="relative">
      {/* Vertical timeline line - visible between consecutive events */}
      {idx > 0 && (
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-indigo-900/60 -translate-y-3 h-4" />
      )}
      <div 
        className="group flex items-stretch bg-gray-900/80 hover:bg-gray-800/90 rounded-lg border border-gray-800/80 hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-pointer"
        onClick={() => onClick?.(event)}
        tabIndex={0}
        role="button"
        aria-label={event.type}
      >
        {/* Left column with icon */}
        <div className="w-14 flex-shrink-0 flex items-center justify-center text-2xl select-none border-r border-gray-800/30">
          {icon}
        </div>
        
        {/* Content section */}
        <div className="flex-1 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            {/* Event type label */}
            <div className="flex items-center">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${eventColors[event.type] || 'bg-gray-800'}`}>
                {formatEventType(event.type)}
              </span>
            </div>
            
            {/* Timestamp and duration */}
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap font-mono text-xs text-gray-400">
                {formattedTime}
              </span>
              {duration && (
                <span className={`whitespace-nowrap font-mono text-xs ${duration.color}`}>{duration.value}</span>
              )}
            </div>
          </div>
          
          {/* Content based on event type */}
          {isNeuralSignal && neuralValue ? (
            <div className="text-base font-medium">
              <span className={getNeuralTypeColor(neuralCore)}>{neuralCore}</span> <span className="text-gray-300">{neuralValue}</span>
            </div>
          ) : isRawPrompt ? (
            <div className="text-base text-gray-300 font-medium">
              {event.content}
            </div>
          ) : event.type === 'gpt_response' ? (
            <div className="text-base text-gray-300 font-medium">
              {event.response ? event.response.substring(0, 50) + (event.response.length > 50 ? '...' : '') : ''}
            </div>
          ) : (
            <div className="text-base text-gray-300 font-medium">
              {/* Display summary based on event type */}
              {event.type === 'symbolic_retrieval' ? `${event.insights?.length || 0} insights retrieved` :
               event.type === 'neural_collapse' ? `Collapse: ${event.selectedCore}` :
               event.type === 'emergent_patterns' ? `${event.patterns?.length || 0} patterns` :
               ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CognitionEventUI;
