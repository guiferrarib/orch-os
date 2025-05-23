// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { useState, useRef, useEffect } from 'react';
import { CognitionEvent } from './../../../context/deepgram/types/CognitionEvent';
import CognitionLogGroupUI from './Group/CognitionLogGroupUI';
import { VariableSizeList as List } from 'react-window';

/**
 * UI utility: Groups events into cognitive cycles (RawPrompt to GPTResponse).
 * Exclusive accordion: only one cycle open at a time, but allows all collapsed.
 * SOLID: Single Responsibility Principle.
 */
export class CognitionLogGrouper {
  static groupEvents(events: CognitionEvent[]): CognitionEvent[][] {
    const groups: CognitionEvent[][] = [];
    let current: CognitionEvent[] = [];
    for (const event of events) {
      if (event.type === 'raw_prompt' && current.length > 0) {
        groups.push(current);
        current = [];
      }
      current.push(event);
      if (event.type === 'gpt_response') {
        groups.push(current);
        current = [];
      }
    }
    if (current.length > 0) groups.push(current);
    return groups;
  }
}

export interface CognitionTimelineGroupedUIProps {
  events: CognitionEvent[];
  onEventClick?: (event: CognitionEvent) => void;
  getDuration?: (idx: number) => { value: string; color: string };
}

const MAX_CONTAINER_HEIGHT = 600; // px, ajustável conforme layout do app

export const CognitionTimelineGroupedUI: React.FC<CognitionTimelineGroupedUIProps> = ({ events, onEventClick, getDuration }) => {
  // Memoize event grouping to avoid unnecessary recalculations
  const groups = React.useMemo(() => CognitionLogGrouper.groupEvents(events), [events]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0); // null = todos colapsados
  const listRef = useRef<List>(null);

  // Fixed heights for each group
  const COLLAPSED_HEIGHT = 60;
  const EXPANDED_HEIGHT = 380;

  // Calculate item height based on expansion state
  const getItemSize = (index: number) => (expandedIdx === index ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT);

  // When expanding/collapsing, update state and force height recalculation
  // useCallback prevents unnecessary function recreations on each render
  const handleExpand = React.useCallback((idx: number) => {
    setExpandedIdx(current => (current === idx ? null : idx));
    // O efeito abaixo força o recálculo das alturas
    setTimeout(() => {
      if (listRef.current) listRef.current.resetAfterIndex(0);
    }, 0);
  }, []);

  if (!groups.length) return <div className="text-indigo-300 text-sm p-4">No cognitive logs available</div>;

  // If any group is expanded, render ONLY it and navigation controls
  if (expandedIdx !== null) {
    return (
      <div className="h-[450px] w-full overflow-y-auto overflow-scrolling-touch">
        {/* Neural-Symbolic Header - design reflecting cognitive orchestration */}
        <div
          className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-950/80 via-indigo-900/70 to-indigo-950/80 backdrop-blur-md border-b border-cyan-400/30 shadow-sm rounded-t-lg transition-all"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 25%), 
                           radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 25%)`
          }}
        >
          {/* Neural Button (Back) - cognitive return action */}
          <button
            onClick={() => setExpandedIdx(null)}
            className="group flex items-center gap-1 text-cyan-300 hover:text-cyan-100 font-medium text-xs px-2 py-1 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 active:scale-95 border border-transparent hover:border-cyan-500/20 hover:bg-cyan-900/10"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            <span>Back</span>
          </button>

          {/* Cognitive Center - focal point of neural information */}
          <div className="relative flex-1 text-center px-1">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
            <span className="relative inline-flex items-center gap-1.5 px-3 py-0.5 bg-indigo-900/40 rounded-full border border-indigo-700/30 shadow-inner">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400/80"></span>
              <span className="text-cyan-100 font-medium text-sm tracking-wide">
                Cycle #{expandedIdx + 1}
              </span>
              <span className="text-cyan-300/70 text-xs font-normal">of {groups.length}</span>
            </span>
          </div>

          {/* Neural Navigation Controls - directional synapses */}
          <div className="flex gap-1">
            <button
              onClick={() => setExpandedIdx(curr => Math.max(0, (curr || 0) - 1))}
              disabled={expandedIdx <= 0}
              className="w-6 h-6 flex items-center justify-center text-cyan-300 hover:text-cyan-100 disabled:text-cyan-800/50 disabled:hover:bg-transparent font-medium rounded-full transition-all duration-200 hover:bg-cyan-900/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 active:scale-95 border border-transparent hover:border-cyan-500/20"
              aria-label="Previous cycle"
            >
              <span className="text-sm">←</span>
            </button>
            <button
              onClick={() => setExpandedIdx(curr => Math.min(groups.length - 1, (curr || 0) + 1))}
              disabled={expandedIdx >= groups.length - 1}
              className="w-6 h-6 flex items-center justify-center text-cyan-300 hover:text-cyan-100 disabled:text-cyan-800/50 disabled:hover:bg-transparent font-medium rounded-full transition-all duration-200 hover:bg-cyan-900/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 active:scale-95 border border-transparent hover:border-cyan-500/20"
              aria-label="Next cycle"
            >
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>
        <div className="pt-5">
          <CognitionLogGroupUI
            key={expandedIdx}
            events={groups[expandedIdx]}
            groupIdx={expandedIdx}
            onEventClick={onEventClick}
            getDuration={getDuration}
            expanded={true}
            onExpand={() => handleExpand(expandedIdx)}
          />
          {/* Removido div fantasma que criava espaço em branco excessivo */}
        </div>
      </div>
    );
  }

  // If all are collapsed, use virtualization
  return (
    <div style={{ height: 450, width: '100%' }}>
      <List
        ref={listRef}
        height={450}
        width={'100%'}
        itemCount={groups.length}
        itemSize={getItemSize}
        overscanCount={4}
      >
        {({ index, style }) => {
          // Apply mb-4 except on the last card for tighter spacing like in the image
          const isLast = index === groups.length - 1;
          return (
            <div style={{ ...style, marginBottom: isLast ? 0 : 16 }}>
              <CognitionLogGroupUI
                key={index}
                events={groups[index]}
                groupIdx={index}
                onEventClick={onEventClick}
                getDuration={getDuration}
                expanded={expandedIdx === index}
                onExpand={() => handleExpand(index)}
              />
            </div>
          );
        }}
      </List>
    </div>
  );
};

export default CognitionTimelineGroupedUI;
