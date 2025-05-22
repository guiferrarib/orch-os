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
      <h3 className="font-bold text-xl tracking-wider flex items-center ml-2" style={{ fontFamily: 'Orbitron, Inter, sans-serif', background: 'linear-gradient(90deg, #00F0FF, #8F00FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 15px rgba(0,240,255,0.3)' }}>
        <span className="mr-2" style={{ fontSize: '0.8em' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#00F0FF" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="3" fill="#8F00FF" />
          </svg>
        </span>
        Orch-OS
      </h3>
      <div className="flex items-center space-x-3">
        <button
          title="Import Neural Data"
          onClick={onShowImportModal}
          className="flex items-center gap-2 px-4 py-1.5 mt-2 mr-4 rounded-full font-bold text-base bg-gradient-to-r from-cyan-400 via-blue-700 to-purple-600 shadow-[0_0_24px_4px_rgba(0,240,255,0.25)] hover:shadow-cyan-400/80 hover:scale-105 transition-all duration-200 ring-2 ring-cyan-400/30 backdrop-blur text-white focus:outline-none focus:ring-4 focus:ring-cyan-400/60"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="8" stroke="#00F0FF" strokeWidth="1.5" />
            <path d="M10 6v5m0 0l2.5-2.5M10 11l-2.5-2.5" stroke="#8F00FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Import Neural Data
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
