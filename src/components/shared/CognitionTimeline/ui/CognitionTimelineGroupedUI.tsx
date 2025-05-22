// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { useState } from 'react';
import { CognitionEvent } from './../../../context/deepgram/types/CognitionEvent';
import CognitionLogGroupUI from './Group/CognitionLogGroupUI';

/**
 * UI utility: Agrupa eventos em ciclos cognitivos (RawPrompt até GPTResponse).
 * Accordion exclusivo: só um ciclo aberto por vez, mas permite todos colapsados.
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
  const groups = CognitionLogGrouper.groupEvents(events);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0); // null = todos colapsados

  const handleExpand = (idx: number) => {
    setExpandedIdx((current) => (current === idx ? null : idx));
  };

  return (
    <div
      className="space-y-8"
      style={{
        maxHeight: MAX_CONTAINER_HEIGHT,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
      }}
    >
      {groups.map((group, idx) => (
        <CognitionLogGroupUI
          key={idx}
          events={group}
          groupIdx={idx}
          onEventClick={onEventClick}
          getDuration={getDuration}
          expanded={expandedIdx === idx}
          onExpand={() => handleExpand(idx)}
        />
      ))}
    </div>
  );
};

export default CognitionTimelineGroupedUI;
