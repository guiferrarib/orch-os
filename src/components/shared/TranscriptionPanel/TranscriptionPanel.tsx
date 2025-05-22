// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import type { ElectronAPI } from '../../../types/electron';
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

import React, { useRef, useState } from "react";
import { useCognitionLog } from '../../context/CognitionLogContext';
import { TranscriptionPanelProps } from "./types/interfaces";
import { useTranscriptionManager } from "./hooks/useTranscriptionManager";
import PanelHeader from "./components/PanelHeader";
import LanguageSelector from "./components/LanguageSelector";
import AudioControls from "./components/AudioControls";
import TextEditor from "./components/TextEditor";
import CognitionLogSection from "./components/CognitionLogSection";
import RecordingControl from "./components/RecordingControl";
import ConnectionDiagnostics from "./components/ConnectionDiagnostics";
import ImportModal from "./components/ImportModal";
import { useChatGptImport } from "./hooks/useChatGptImport";
import { useToast } from "../../../App";
// Módulo cortical para cards expansíveis/colapsáveis
import CollapsibleCard from "../CollapsibleCard/CollapsibleCard";
import './TranscriptionPanel.css';
// Quantum consciousness visualization import
import { QuantumVisualizationContainer } from '../QuantumVisualization/QuantumVisualizationContainer';


// Brain visualization is now handled in a separate module

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ onClose, width }) => {
  const transcriptionManager = useTranscriptionManager();
  const { showToast } = useToast();

  if (!transcriptionManager) return null;

  const {
    language,
    setLanguage,
    microphoneState,
    connectionState,
    toggleRecording,
    handleSendPrompt,
    clearTranscription,
    clearAiResponse,
    toggleExpand,
    isExpanded,
    temporaryContext,
    setTemporaryContext,
    texts,
    setTexts,
    audioDevices,
    selectedDevices,
    handleDeviceChange,
    isMicrophoneOn,
    isSystemAudioOn,
    setIsMicrophoneOn,
    setIsSystemAudioOn,
    showDetailedDiagnostics,
    setShowDetailedDiagnostics,
    connectionDetails,
    setConnectionDetails,
    transcriptionRef,
    getConnectionStatus,
    disconnectFromDeepgram,
    connectToDeepgram,
    waitForConnectionState,
    hasActiveConnection,
    ConnectionState
  } = transcriptionManager;

  const { events: cognitionEvents, exporters, clearEvents, exportEvents } = useCognitionLog();

  const {
    importFile,
    setImportFile,
    importUserName,
    setImportUserName,
    importMode,
    setImportMode,
    importProgress,
    importStage,
    importSummary,
    isImporting,
    showImportModal,
    setShowImportModal,
    handleFileChange,
    handleStartImport,
    handleCloseImportModal
  } = useChatGptImport(showToast);

  // Brain state and logic has been moved to BrainVisualization module

  // Brain visualization components have been moved to BrainVisualization module

  // --- Settings Popover for Audio/Language Controls ---
  const [showSettings, setShowSettings] = useState(false);
  const settingsBtnRef = useRef(null);

  // --- Render ---
  return (
    <div className="transcription-panel-root">
      <div className="orchos-anim-bg" />
      <div className="orchos-quantum-bg" />
      <PanelHeader
        connectionState={connectionState}
        microphoneState={microphoneState}
        hasActiveConnection={hasActiveConnection}
        onClose={() => {
          if (window?.electronAPI?.closeWindow) {
            window.electronAPI.closeWindow();
          } else if (onClose) {
            onClose();
          }
        }}
        onToggleDiagnostics={() => setShowDetailedDiagnostics(!showDetailedDiagnostics)}
        onShowImportModal={() => setShowImportModal(true)}
        onMinimize={() => {
          if (window?.electronAPI?.minimizeWindow) {
            window.electronAPI.minimizeWindow();
          } else if (window?.require) {
            const { remote } = window.require('electron');
            remote.getCurrentWindow().minimize();
          }
        }}
      />



      {showDetailedDiagnostics && (
        <ConnectionDiagnostics
          connectionDetails={connectionDetails}
          setConnectionDetails={setConnectionDetails}
          getConnectionStatus={getConnectionStatus}
          showToast={showToast}
          disconnectFromDeepgram={disconnectFromDeepgram}
          connectToDeepgram={connectToDeepgram}
          waitForConnectionState={waitForConnectionState}
          hasActiveConnection={hasActiveConnection}
          ConnectionState={ConnectionState}
        />
      )}

      {/* Visualização Quântica - Centralizada e responsiva */}
      <div className="quantum-visualization-homogeneous orchos-full-width orchos-overflow-visible quantum-visualization-center">
        <QuantumVisualizationContainer 
          cognitionEvents={cognitionEvents}
          height="320px"
          width="100%"
          lowPerformanceMode={false}
          showLegend={true}
        />
      </div>

      {/* Grid responsivo de cards */}
      <div className="transcription-panel-grid">
        <CollapsibleCard title="Temporary Context" defaultOpen={true} type="context" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#ffe066" strokeWidth="2"/><path d="M10 5v5l3 3" stroke="#ffe066" strokeWidth="2" strokeLinecap="round"/></svg>}>
          <TextEditor
            label=""
            value={temporaryContext}
            onChange={setTemporaryContext}
            onClear={() => setTemporaryContext("")}
            rows={3}
            placeholder="Add situational context (e.g., 'I'm in a neural session' or 'Help me stay focused')"
          />
        </CollapsibleCard>
        <CollapsibleCard
          title="Transcription"
          defaultOpen={true}
          type="transcription"
          icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10h16" stroke="#00faff" strokeWidth="2"/><path d="M6 6c2-2 6-2 8 0" stroke="#00faff" strokeWidth="2"/><path d="M6 14c2 2 6 2 8 0" stroke="#00faff" strokeWidth="2"/></svg>}
          headerActions={
            <div className="relative">
              <button
                ref={settingsBtnRef}
                className="orchos-btn-circle mr-2"
                onClick={() => setShowSettings((v) => !v)}
                aria-label="Settings"
                title="Settings"
                type="button"
              >
                {/* Modern glassy gear icon with glowing effect */}
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="orchos-btn-icon orchos-icon-glow">
  <circle cx="14" cy="14" r="12" fill="rgba(0,255,255,0.10)" stroke="#00faff" strokeWidth="2.2" />
  <circle cx="14" cy="14" r="5.2" stroke="#00faff" strokeWidth="1.5" fill="rgba(0,255,255,0.14)" />
  <g filter="url(#settings-glow)">
    <g>
      <line x1="14" y1="3.5" x2="14" y2="7.5" stroke="#00faff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="20.5" x2="14" y2="24.5" stroke="#00faff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.5" y1="14" x2="7.5" y2="14" stroke="#00faff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20.5" y1="14" x2="24.5" y2="14" stroke="#00faff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7.8" y1="7.8" x2="10.5" y2="10.5" stroke="#00faff" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="17.5" y1="17.5" x2="20.2" y2="20.2" stroke="#00faff" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="17.5" y1="10.5" x2="20.2" y2="7.8" stroke="#00faff" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="7.8" y1="20.2" x2="10.5" y2="17.5" stroke="#00faff" strokeWidth="1.1" strokeLinecap="round" />
    </g>
    <circle cx="14" cy="14" r="2.8" fill="#00faff" fillOpacity="0.6" />
  </g>
  <defs>
    <filter id="settings-glow" x="-2" y="-2" width="32" height="32" filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>
              </button>
              {showSettings && (
                <div className="absolute z-50 right-0 top-full mt-3 orchos-settings-popup flex flex-col gap-5 orchos-min-width-220">

                  <div className="mb-2 border-b pb-2">
                    <h3 className="orchos-title">Settings</h3>
                  </div>
                  <LanguageSelector
                    language={language}
                    setLanguage={setLanguage}
                  />
                  <AudioControls
                    isMicrophoneOn={isMicrophoneOn}
                    setIsMicrophoneOn={setIsMicrophoneOn}
                    isSystemAudioOn={isSystemAudioOn}
                    setIsSystemAudioOn={setIsSystemAudioOn}
                    audioDevices={audioDevices}
                    selectedDevices={selectedDevices}
                    handleDeviceChange={handleDeviceChange}
                  />
                </div>
              )}
            </div>
          }
        >
          <TextEditor
            label=""
            value={texts.transcription}
            onChange={(value) => {
              setTexts(prev => ({ ...prev, transcription: value }));
            }}
            onClear={clearTranscription}
            forwardedRef={transcriptionRef as React.RefObject<HTMLTextAreaElement>}
            readOnly={true}
          />
          <button
              className="orchos-btn-circular orchos-btn-fab orchos-btn-glass orchos-btn-ripple w-full mt-4 flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg transition-all duration-200 hover:scale-105 focus:scale-105 focus:ring-4 focus:ring-cyan-400/60 animate-pulse"
              onClick={e => {
                const btn = e.currentTarget;
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = `${e.nativeEvent.offsetX}px`;
                ripple.style.top = `${e.nativeEvent.offsetY}px`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
                handleSendPrompt();
              }}
              aria-label="Send Neural Signal"
              type="button"
              style={{
                background: "rgba(24,24,40,0.82)",
                border: "3px solid #00faff",
                boxShadow: "0 0 24px 8px #00faff33, 0 0 0 0 #fff0"
              }}
            >
              <span className="mr-2 flex items-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <ellipse cx="14" cy="14" rx="10" ry="7" stroke="#00faff" strokeWidth="2"/>
                  <circle cx="11" cy="14" r="2" fill="#00faff"/>
                  <circle cx="17" cy="14" r="2" fill="#00faff"/>
                  <path d="M13 14 Q14 17 15 14" stroke="#00faff" strokeWidth="1.3" fill="none"/>
                  <path d="M14 7 L14 2" stroke="#00faff" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="2" r="1" fill="#00faff"/>
                </svg>
              </span>
              <span>Send Neural Signal</span>
            </button>
           {/* Botão de gravação centralizado na base do painel */}
           <div className="flex w-full justify-center mt-8 mb-2">
             <RecordingControl
               microphoneState={microphoneState}
               toggleRecording={toggleRecording}
             />
           </div>
        </CollapsibleCard>
        <CollapsibleCard title="Cognition Log" defaultOpen={true} type="cognition" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><ellipse cx="10" cy="10" rx="8" ry="6" stroke="#7c4dff" strokeWidth="2"/><circle cx="10" cy="10" r="3" fill="#7c4dff"/></svg>}>
          <CognitionLogSection
            cognitionEvents={cognitionEvents}
            exporters={exporters}
            exportEvents={exportEvents}
            clearEvents={clearEvents}
          />
        </CollapsibleCard>
        <CollapsibleCard title="AI Suggested Response" defaultOpen={true} type="ai" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="12" height="12" rx="4" stroke="#ff80ab" strokeWidth="2"/><circle cx="10" cy="10" r="2" fill="#ff80ab"/></svg>}>
          <TextEditor
            label={""}
            value={texts.aiResponse}
            onChange={(value) => {
              setTexts(prev => ({ ...prev, aiResponse: value }));
            }}
            onClear={clearAiResponse}
            toggleExpand={toggleExpand}
            isExpanded={isExpanded}
            useAutosize={true}
            readOnly={true}
          />
        </CollapsibleCard>
      </div>
      {showImportModal && (
        <ImportModal
          show={showImportModal}
          onClose={handleCloseImportModal}
          importFile={importFile}
          setImportFile={setImportFile}
          importUserName={importUserName}
          setImportUserName={setImportUserName}
          importMode={importMode}
          setImportMode={setImportMode}
          importProgress={importProgress}
          importStage={importStage}
          importSummary={importSummary}
          isImporting={isImporting}
          handleFileChange={handleFileChange}
          handleStartImport={handleStartImport}
          handleCloseImportModal={handleCloseImportModal}
        />
      )}
    </div>
  );
};

export default TranscriptionPanel;