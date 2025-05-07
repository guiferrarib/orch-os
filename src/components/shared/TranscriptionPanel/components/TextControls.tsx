// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';

interface TextControlsProps {
  label: string;
  onClear: () => void;
  onFontSize?: () => void;
  onExpand?: () => void;
  isExpanded?: boolean;
}

const TextControls: React.FC<TextControlsProps> = ({ label, onClear, onFontSize, onExpand, isExpanded }) => (
  <div className="flex justify-between items-center py-2 mb-2">
    <h4 className="text-sm font-medium">{label}</h4>
    <div className="flex gap-3">
      {onFontSize && (
        <button
          className="text-xs bg-black/40 px-2.5 py-1.5 rounded hover:bg-black/60 transition-colors"
          onClick={onFontSize}
          title="Change font size"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      )}
      {onExpand && (
        <button
          className="text-xs bg-black/40 px-2.5 py-1.5 rounded hover:bg-black/60 transition-colors"
          onClick={onExpand}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M4 4v7h7V4H4z M4 13v7h7v-7H4z M13 4v7h7V4h-7z M13 13v7h7v-7h-7z" : "M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
          </svg>
        </button>
      )}
      <button
        className="text-xs bg-black/40 px-2.5 py-1.5 rounded hover:bg-black/60 transition-colors"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  </div>
);

export default TextControls;
