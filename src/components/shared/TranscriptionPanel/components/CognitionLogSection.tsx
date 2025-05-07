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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">Cognition Log:</h3>
        <div className="flex flex-wrap gap-2 justify-end">
          {exporters.map(exporter => (
            <button
              key={exporter.label}
              className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-sm rounded font-semibold shadow"
              onClick={() => exportEvents(exporter.label)}
              title={exporter.label}
            >
              {exporter.label}
            </button>
          ))}
          <button
            className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white text-sm rounded font-semibold shadow"
            onClick={clearEvents}
            title="Clear logs"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="bg-gray-900 rounded overflow-hidden shadow-inner border border-gray-700">
        <CognitionTimeline events={cognitionEvents} />
      </div>
    </div>
  );
};

export default CognitionLogSection;
