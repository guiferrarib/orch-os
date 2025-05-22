// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { CognitionEvent } from '../../../../context/deepgram/types/CognitionEvent';
import { CognitionEventUI } from '../Event/CognitionEventUI';
import styles from '../../CognitionTimeline.module.css';

/**
 * UI component for a visually grouped cognition cycle (RawPrompt → ... → GPTResponse),
 * accordion-exclusivo: só um ciclo aberto por vez, com scroll interno.
 * SOLID: Single Responsibility Principle.
 */
export interface CognitionLogGroupUIProps {
  events: CognitionEvent[]; // Events in this group, in order
  groupIdx: number;
  onEventClick?: (event: CognitionEvent) => void;
  getDuration?: (idx: number) => { value: string; color: string };
  expanded?: boolean;
  onExpand?: () => void;
}

const MAX_GROUP_HEIGHT = 380; // px, ajustável conforme padrão dos cards do app

export const CognitionLogGroupUI: React.FC<CognitionLogGroupUIProps> = ({ events, groupIdx, onEventClick, getDuration, expanded = false, onExpand }) => {
  if (!events.length) return null;
  return (
    <div className="my-6 border-2 border-indigo-800 rounded-xl shadow-lg bg-gray-950/70">
      <button
        className={
          'w-full px-4 py-2 bg-indigo-900/70 rounded-t-xl flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 ' +
          (expanded ? '' : 'border-b border-indigo-800')
        }
        onClick={onExpand}
        aria-expanded={expanded}
        aria-controls={`cognitive-group-${groupIdx}`}
      >
        <span className="text-indigo-300 font-bold text-sm tracking-wider flex-1 text-left">
          Cognitive Cycle #{groupIdx + 1}
        </span>
        <span className="text-xs text-gray-400">({events.length} events)</span>
        <span className="ml-2 text-indigo-200 text-lg transition-transform duration-200" style={{transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)'}}>▼</span>
      </button>
      <div
        id={`cognitive-group-${groupIdx}`}
        className={expanded ? `${styles.fadeIn}` : ''}
        style={{
          maxHeight: expanded ? MAX_GROUP_HEIGHT : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.2s',
          opacity: expanded ? 1 : 0,
        }}
      >
        {expanded && (
          <div
            className="px-2 py-3 space-y-1"
            style={{
              maxHeight: MAX_GROUP_HEIGHT - 50, // Deixa espaço pro header
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              scrollbarWidth: 'thin',
            }}
          >
            {events.map((event, idx) => (
              <CognitionEventUI
                key={idx}
                event={event}
                idx={idx}
                onClick={onEventClick}
                duration={getDuration ? getDuration(idx) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitionLogGroupUI;
