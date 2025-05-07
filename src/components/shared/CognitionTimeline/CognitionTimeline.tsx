// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import { CognitionEvent } from '../../context/deepgram/types/CognitionEvent';

interface CognitionTimelineProps {
  events: CognitionEvent[];
}

// Component to visualize cognitive timeline in a more friendly format
export const CognitionTimeline: React.FC<CognitionTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <div className="text-gray-400 italic">No cognitive events recorded</div>;
  }

  // Format timestamp for readability
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return `${date.toLocaleTimeString()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    } catch (e) {
      return timestamp;
    }
  };

  // Calculate duration between consecutive events
  const calcDuration = (idx: number): string => {
    if (idx === 0) return '-';
    
    try {
      const current = new Date(events[idx].timestamp).getTime();
      const previous = new Date(events[idx - 1].timestamp).getTime();
      const diff = current - previous;
      
      if (diff < 1000) return `+${diff}ms`;
      return `+${(diff/1000).toFixed(2)}s`;
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="overflow-y-auto max-h-96 text-sm">
      <table className="w-full border-collapse">
        <thead className="bg-gray-800 text-white sticky top-0">
          <tr>
            <th className="px-2 py-1 text-left">#</th>
            <th className="px-2 py-1 text-left">Time</th>
            <th className="px-2 py-1 text-left">∆t</th>
            <th className="px-2 py-1 text-left">Event</th>
            <th className="px-2 py-1 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, idx) => (
            <tr 
              key={idx} 
              className={`border-t border-gray-700 ${
                idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
              } hover:bg-gray-800`}
            >
              <td className="px-2 py-1 text-gray-400">{idx + 1}</td>
              <td className="px-2 py-1 whitespace-nowrap font-mono text-xs text-gray-300">
                {formatTimestamp(event.timestamp)}
              </td>
              <td className="px-2 py-1 whitespace-nowrap font-mono text-xs text-green-400">
                {calcDuration(idx)}
              </td>
              <td className="px-2 py-1">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getEventColor(event.type)}`}>
                  {formatEventType(event.type)}
                </span>
              </td>
              <td className="px-2 py-1 text-gray-200 truncate max-w-md">
                {renderEventDetails(event)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
const getEventColor = (type: string): string => {
  switch (type) {
    case 'raw_prompt':
      return 'bg-blue-900 text-blue-100';
    case 'temporary_context':
      return 'bg-purple-900 text-purple-100';
    case 'neural_signal':
      return 'bg-yellow-900 text-yellow-100';
    case 'neural_collapse':
      return 'bg-pink-900 text-pink-100';
    case 'symbolic_retrieval':
      return 'bg-green-900 text-green-100';
    case 'fusion_initiated':
      return 'bg-orange-900 text-orange-100';
    case 'symbolic_context_synthesized':
      return 'bg-indigo-900 text-indigo-100';
    case 'gpt_response':
      return 'bg-red-900 text-red-100';
    default:
      return 'bg-gray-700 text-gray-100';
  }
};

// Render event details
const renderEventDetails = (event: CognitionEvent): React.ReactNode => {
  switch (event.type) {
    case 'raw_prompt':
      return <span title={event.content}>{truncateText(event.content, 100)}</span>;
    
    case 'temporary_context':
      return <span title={event.context}>{truncateText(event.context, 100)}</span>;
    
    case 'neural_signal':
      return  (
        <span title={`Query: ${event.symbolic_query}`}>
          <span className="font-semibold">{event.core}</span>
          {' '}<span className="text-yellow-400">{Math.round(event.intensity * 100)}%</span>
          {' | '}<span className="text-gray-400">K={event.topK}</span>
        </span>
      );
    
    case 'symbolic_retrieval': {
      return (
        <div>
          <div>
            <span className="font-semibold">{event.core}</span>
            {' | '}<span className="text-gray-400">Matches: {event.matchCount}</span>
            {' | '}<span className="text-green-400">{event.durationMs}ms</span>
          </div>
          {event.insights && Array.isArray(event.insights) && event.insights.length > 0 && (
            <div className="mt-1">
              <span className="text-xs text-blue-400 font-medium">Insights:</span>
              <ul className="list-disc list-inside pl-1">
                {event.insights.map((insight, i) => {
                  // Handle string insights
                  if (typeof insight === 'string') {
                    return (
                      <li key={i} className="text-xs text-gray-300" title={insight}>
                        {truncateText(insight, 60)}
                      </li>
                    );
                  }
                  // Handle SymbolicInsight objects
                  else if (insight && typeof insight === 'object' && 'type' in insight) {
                    return (
                      <li key={i} className="text-xs text-gray-300" title={String(insight.content || '')}>
                        <span className="text-teal-400">{insight.type}</span>: 
                        {truncateText(String(insight.content || ''), 40)}
                      </li>
                    );
                  }
                  // Fallback for other structures
                  return (
                    <li key={i} className="text-xs text-gray-300">
                      {truncateText(JSON.stringify(insight), 60)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      );
    }
    
    case 'fusion_initiated':
      return <span className="italic">Initiating neural integration...</span>;  
    
    case 'neural_collapse':
      return (
        <div>
          <div className="font-semibold">
            <span className={event.isDeterministic ? 'text-blue-400' : 'text-purple-400'}>
              {event.isDeterministic ? 'Deterministic' : 'Probabilistic'} Collapse
            </span>
            {' | '}<span className="text-yellow-400">Core: {event.selectedCore}</span>
          </div>
          <div className="text-xs text-gray-400 grid grid-cols-2 gap-x-2 mt-1">
            <span>Candidates: {event.numCandidates}</span>
            <span>Emotional: {(event.emotionalWeight * 100).toFixed(0)}%</span>
            <span>Contradiction: {(event.contradictionScore * 100).toFixed(0)}%</span>
            {event.temperature !== undefined && <span>Temp: {event.temperature.toFixed(2)}</span>}
            {event.justification && (
              <span className="col-span-2" title={event.justification}>Reason: {truncateText(event.justification, 60)}</span>
            )}
            {event.userIntent && (
              <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                {Object.entries(event.userIntent)
                  .filter(([, value]) => value > 0.3) // Only show significant intents
                  .sort(([, a], [, b]) => b - a) // Sort by value descending
                  .map(([key, value], i) => (
                    <span key={i} className="inline-flex items-center bg-gray-700 px-1.5 py-0.5 rounded-full">
                      <span className="text-xs">{key}</span>
                      <span className="ml-1 text-xs text-green-400">{(value * 100).toFixed(0)}%</span>
                    </span>
                  ))}
              </div>
            )}
            {event.emergentProperties && event.emergentProperties.length > 0 && (
              <div className="col-span-2 mt-1">
                <span className="text-xs text-emerald-400 font-medium">Emergent Properties:</span>
                <ul className="list-disc list-inside pl-1">
                  {event.emergentProperties.map((prop, i) => (
                    <li key={i} className="text-xs text-gray-300">{truncateText(prop, 60)}</li>
                  ))}
                </ul>
              </div>
            )}
            {event.insights && event.insights.length > 0 && (
              <div className="col-span-2 mt-1">
                <span className="text-xs text-blue-400 font-medium">Insights:</span>
                <ul className="list-disc list-inside pl-1">
                  {event.insights.map((insight, i) => (
                    <li key={i} className="text-xs text-gray-300">
                      {insight.type}: {truncateText(String(insight.content), 40)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      );
    
    case 'symbolic_context_synthesized': {
      // Count the actual neural modules from the modules array
      const moduleCount = event.context && 
        typeof event.context === 'object' && 
        Array.isArray(event.context.modules) ? 
          event.context.modules.length : 0;
      
      // Get the module names from the modules array
      const moduleNames = event.context && 
        typeof event.context === 'object' && 
        Array.isArray(event.context.modules) ? 
          event.context.modules.map(m => m.core || String(m)) : [];
      
      return (
        <div>
          <div 
            title={
              typeof event.context === 'object' && event.context !== null
                ? JSON.stringify(event.context)
                : event.context !== undefined
                  ? String(event.context)
                  : ''
            }
          >
            <span className="font-semibold">Synthesized symbolic context</span>
            {' '}<span className="text-gray-400">({moduleCount} modules)</span>
          </div>
          
          {moduleNames.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {moduleNames.map((moduleName, i) => (
                <span 
                  key={i} 
                  className="px-1.5 py-0.5 bg-indigo-800 rounded text-xs font-medium"
                  title={event.context[moduleName] ? String(event.context[moduleName]) : ''}
                >
                  {moduleName}
                </span>
              ))}
            </div>
          )}
          
          {event.context && event.context.summary && (
            <div className="mt-1 text-xs text-gray-400 italic">
              {truncateText(String(event.context.summary), 80)}
            </div>
          )}
        </div>
      );
    }
    
    case 'gpt_response':
      return (
        <div title={event.response}>
          <span>{truncateText(event.response, 80)}</span>
          {event.symbolicTopics && (
            <div className="mt-1 flex flex-wrap gap-1">
              {event.symbolicTopics.map((topic: string, i: number) => (
                <span 
                  key={i} 
                  className="px-1.5 py-0.5 bg-gray-700 rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    
    default:
      return <span className="text-gray-400">Unknown event type</span>;
  }
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default CognitionTimeline;
