// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React, { useState } from 'react';
import { CognitionEvent } from '../../context/deepgram/types/CognitionEvent';
import CognitionDetailModal from './CognitionDetailModal';

/**
 * CognitionTimeline Component
 * 
 * A neural-symbolic visual representation of cognitive events in a timeline format.
 * Provides a clean, modern interface for monitoring the orchestration of symbolic processes.
 */
interface CognitionTimelineProps {
  events: CognitionEvent[];
}

export const CognitionTimeline: React.FC<CognitionTimelineProps> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<CognitionEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open modal with event details
  const openEventDetails = (event: CognitionEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-900/40 rounded-lg border border-gray-800 text-gray-400 italic">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>No cognitive events recorded</span>
        </div>
      </div>
    );
  }

  // Format timestamp for readability
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return `${date.toLocaleTimeString()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    } catch (e) {
      return timestamp;
    }
  };

  // Calculate duration between consecutive events
  const calcDuration = (idx: number): { value: string; color: string } => {
    if (idx === 0) return { value: '-', color: 'text-gray-500' };
    
    try {
      const current = new Date(events[idx].timestamp).getTime();
      const previous = new Date(events[idx - 1].timestamp).getTime();
      const diff = current - previous;
      
      // Color coding based on duration
      let color = 'text-green-400';
      if (diff > 1000) color = 'text-amber-400';
      if (diff > 3000) color = 'text-red-400';
      
      // Format value
      if (diff < 1000) return { value: `+${diff}ms`, color };
      return { value: `+${(diff/1000).toFixed(2)}s`, color };
    } catch (e) {
      return { value: '-', color: 'text-gray-500' };
    }
  };

  // Format event type for display
  const formatEventType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get event color for display
  const getEventTypeStyles = (type: string): { bgColor: string; textColor: string; borderColor: string } => {
    switch (type) {
      case 'raw_prompt':
        return { bgColor: 'bg-blue-700', textColor: 'text-blue-100', borderColor: 'border-blue-500' };
      case 'temporary_context':
        return { bgColor: 'bg-purple-700', textColor: 'text-purple-100', borderColor: 'border-purple-500' };
      case 'neural_signal':
        return { bgColor: 'bg-amber-700', textColor: 'text-amber-100', borderColor: 'border-amber-500' };
      case 'neural_collapse':
        return { bgColor: 'bg-pink-700', textColor: 'text-pink-100', borderColor: 'border-pink-500' };
      case 'symbolic_retrieval':
        return { bgColor: 'bg-green-700', textColor: 'text-green-100', borderColor: 'border-green-500' };
      case 'fusion_initiated':
        return { bgColor: 'bg-orange-700', textColor: 'text-orange-100', borderColor: 'border-orange-500' };
      case 'symbolic_context_synthesized':
        return { bgColor: 'bg-indigo-700', textColor: 'text-indigo-100', borderColor: 'border-indigo-500' };
      case 'gpt_response':
        return { bgColor: 'bg-red-700', textColor: 'text-red-100', borderColor: 'border-red-500' };
      case 'emergent_patterns':
        return { bgColor: 'bg-teal-700', textColor: 'text-teal-100', borderColor: 'border-teal-500' };
      default:
        return { bgColor: 'bg-gray-700', textColor: 'text-gray-100', borderColor: 'border-gray-600' };
    }
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Get summary for each event type
  const getEventSummary = (event: CognitionEvent): string => {
    switch (event.type) {
      case 'raw_prompt':
        return truncateText(event.content, 30);
      case 'temporary_context':
        return `Context: ${truncateText(event.context, 30)}`;
      case 'neural_signal':
        return `${event.core} ${Math.round(event.intensity * 100)}%`;
      case 'symbolic_retrieval':
        return `${event.core}: ${event.matchCount} matches`;
      case 'neural_collapse':
        return `Selected: ${event.selectedCore}`;
      case 'symbolic_context_synthesized':
        return `${Object.keys(event.context).length} attributes`;
      case 'fusion_initiated':
        return 'Process initiated';
      case 'gpt_response':
        return truncateText(event.response, 30);
      case 'emergent_patterns':
        return `${event.patterns.length} patterns detected`;
      default:
        return 'Unknown event';
    }
  };

  return (
    <div className="relative">
      {/* Modern, animated timeline */}
      <div className="overflow-y-auto max-h-96 pr-1 space-y-0.5">
        {events.map((event, idx) => {
          const duration = calcDuration(idx);
          const styles = getEventTypeStyles(event.type);
          
          return (
            <div 
              key={idx}
              className="group flex items-stretch bg-gray-900/50 hover:bg-gray-800/70 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-pointer"
              onClick={() => openEventDetails(event)}
            >
              {/* Left color bar indicating event type */}
              <div className={`w-1 ${styles.borderColor} rounded-l`}></div>
              
              {/* Content section */}
              <div className="flex-1 px-2 py-2">
                <div className="flex items-center justify-between">
                  {/* Event number and timestamp */}
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-xs font-mono w-6 text-right">{idx + 1}</span>
                    <span className="whitespace-nowrap font-mono text-xs text-gray-400">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className={`whitespace-nowrap font-mono text-xs ${duration.color}`}>
                      {duration.value}
                    </span>
                  </div>
                  
                  {/* View details button (visible on hover) */}
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-indigo-700/70 hover:bg-indigo-600 text-white px-2 py-0.5 rounded"
                  >
                    Details
                  </button>
                </div>
                
                {/* Event type and summary */}
                <div className="mt-1 flex flex-wrap items-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${styles.bgColor} ${styles.textColor}`}>
                    {formatEventType(event.type)}
                  </span>
                  <span className="text-sm text-gray-300">
                    {getEventSummary(event)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for event details */}
      <CognitionDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default CognitionTimeline;
