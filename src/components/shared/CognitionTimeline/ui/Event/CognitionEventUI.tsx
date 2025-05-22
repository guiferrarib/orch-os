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

const eventTypeIcons: Record<string, React.ReactNode> = {
  raw_prompt: <span className="text-blue-400">🟦</span>,
  temporary_context: <span className="text-purple-400">🟪</span>,
  neural_signal: <span className="text-amber-400">🟧</span>,
  neural_collapse: <span className="text-pink-400">🟪</span>,
  symbolic_retrieval: <span className="text-green-400">🟩</span>,
  fusion_initiated: <span className="text-orange-400">🟧</span>,
  symbolic_context_synthesized: <span className="text-indigo-400">🟦</span>,
  gpt_response: <span className="text-red-400">🟥</span>,
  emergent_patterns: <span className="text-teal-400">🟦</span>,
};

export const CognitionEventUI: React.FC<CognitionEventUIProps> = ({ event, idx, onClick, duration }) => {
  const icon = eventTypeIcons[event.type] || <span className="text-gray-400">⬛</span>;

  return (
    <div
      className="group flex items-stretch bg-gray-900/60 hover:bg-gray-800/80 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => onClick?.(event)}
      tabIndex={0}
      role="button"
      aria-label={event.type}
    >
      {/* Icon bar */}
      <div className="w-7 flex items-center justify-center text-lg select-none">
        {icon}
      </div>
      {/* Content section */}
      <div className="flex-1 px-2 py-2">
        <div className="flex items-center justify-between">
          {/* Event number and timestamp */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-400 text-xs font-mono w-6 text-right">{idx + 1}</span>
            <span className="whitespace-nowrap font-mono text-xs text-gray-400">
              {event.timestamp && new Date(event.timestamp).toLocaleTimeString()}
            </span>
            {duration && (
              <span className={`whitespace-nowrap font-mono text-xs ${duration.color}`}>{duration.value}</span>
            )}
          </div>
        </div>
        {/* Event type and summary (delegated to parent for full flexibility) */}
        <div className="mt-1 flex flex-wrap items-center">
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 bg-gray-800 text-gray-300">
            {event.type.replace(/_/g, ' ')}
          </span>
          <span className="text-sm text-gray-300">
            {/* Summary handled by parent for maximum composability */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CognitionEventUI;
