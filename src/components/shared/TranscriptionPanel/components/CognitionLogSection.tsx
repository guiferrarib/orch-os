// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import CognitionTimeline from '../../CognitionTimeline/CognitionTimeline';
import { CognitionEvent } from '../../../context/deepgram/types/CognitionEvent';

interface CognitionLogSectionProps {
  cognitionEvents: CognitionEvent[];
  exporters: { label: string }[];
  exportEvents: (label: string) => void;
  clearEvents: () => void;
}

const CognitionLogSection: React.FC<CognitionLogSectionProps> = ({
  cognitionEvents,
  exporters,
  exportEvents,
  clearEvents
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-white font-semibold tracking-wide">Cognition Log</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {exporters.map(exporter => (
            <button
              key={exporter.label}
              className="px-3 py-1 bg-indigo-700/80 hover:bg-indigo-700 text-white text-sm rounded-md font-medium transition-colors shadow-sm flex items-center"
              onClick={() => exportEvents(exporter.label)}
              title={`Export as ${exporter.label}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {exporter.label}
            </button>
          ))}
          <button
            className="px-3 py-1 bg-red-700/80 hover:bg-red-700 text-white text-sm rounded-md font-medium transition-colors shadow-sm flex items-center"
            onClick={clearEvents}
            title="Clear all logs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-inner border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
        <CognitionTimeline events={cognitionEvents} />
      </div>
    </div>
  );
};

export default CognitionLogSection;
