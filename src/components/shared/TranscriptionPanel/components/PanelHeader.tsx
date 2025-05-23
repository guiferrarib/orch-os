// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';

interface PanelHeaderProps {
  onClose: () => void;
  onToggleDiagnostics: () => void;
  onShowImportModal: () => void;
  onMinimize?: () => void;
}

const PanelHeader: React.FC<PanelHeaderProps> = ({
  onClose,
  onToggleDiagnostics,
  onShowImportModal,
  onMinimize
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-medium text-base">Orch-OS</h3>
      <div className="flex items-center space-x-3">
        <button
          title="Import ChatGPT Conversations"
          onClick={onShowImportModal}
          className="text-white/70 hover:text-white bg-blue-700 px-2 py-1.5 rounded-md font-medium"
        >
          Import ChatGPT Conversations
        </button>
        <button
          title="Toggle Diagnostics"
          onClick={onToggleDiagnostics}
          className="text-white/70 hover:text-white bg-gray-700 p-1.5 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        </button>
        {onMinimize && (
          <button
            title="Minimize"
            onClick={onMinimize}
            className="text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <rect x="3" y="7.5" width="10" height="1" rx="0.5" />
            </svg>
          </button>
        )}
        <button
          title="Close"
          onClick={onClose}
          className="text-white/70 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PanelHeader;
