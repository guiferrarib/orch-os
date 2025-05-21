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
    toggleFontSize,
    toggleExpand,
    fontSize,
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

      {/* Settings button near import conversations */}
      <div className="relative flex items-center justify-end mb-2">
        <button
          ref={settingsBtnRef}
          className="orchos-btn-circle mr-2"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Settings"
          title="Settings"
        >
          {/* Modern glassy gear icon with glowing effect */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="orchos-btn-icon orchos-icon-glow">
            <circle cx="11" cy="11" r="10" fill="rgba(0,255,255,0.10)" stroke="#00faff" strokeWidth="1.5" />
            <g filter="url(#glow)">
              <path d="M16.24 13.12c.12-.41.19-.85.19-1.3s-.07-.89-.19-1.3l1.57-1.23a.5.5 0 00.12-.65l-1.5-2.6a.5.5 0 00-.61-.23l-1.85.74a5.06 5.06 0 00-1.12-.65l-.28-1.98A.5.5 0 0011 3.5h-3a.5.5 0 00-.5.42l-.28 1.98a5.06 5.06 0 00-1.12.65l-1.85-.74a.5.5 0 00-.61.23l-1.5 2.6a.5.5 0 00.12.65l1.57 1.23c-.12.41-.19.85-.19 1.3s.07.89.19 1.3l-1.57 1.23a.5.5 0 00-.12.65l1.5 2.6c.13.23.4.32.61.23l1.85-.74c.34.26.71.48 1.12.65l.28 1.98c.04.26.25.42.5.42h3c.25 0 .46-.16.5-.42l.28-1.98c.41-.17.78-.39 1.12-.65l1.85.74c.21.09.48 0 .61-.23l1.5-2.6a.5.5 0 00-.12-.65l-1.57-1.23zM11 14a3 3 0 110-6 3 3 0 010 6z" stroke="#00faff" strokeWidth="1.3" fill="none"/>
              <circle cx="11" cy="11" r="2" fill="#00faff" fillOpacity="0.5"/>
            </g>
            <defs>
              <filter id="glow" x="-2" y="-2" width="26" height="26" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </button>
        {showSettings && (
          <div className="absolute z-50 right-0 top-full mt-2 bg-white/90 rounded-lg shadow-xl p-4 backdrop-blur-md border border-gray-200 flex flex-col gap-2 min-w-[220px] orchos-min-width-220">
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
            fontSize={fontSize}
            toggleFontSize={toggleFontSize}
            rows={3}
            placeholder="Add situational context (e.g., 'I'm in a neural session' or 'Help me stay focused')"
          />
        </CollapsibleCard>
        <CollapsibleCard title="Transcription" defaultOpen={true} type="transcription" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10h16" stroke="#00faff" strokeWidth="2"/><path d="M6 6c2-2 6-2 8 0" stroke="#00faff" strokeWidth="2"/><path d="M6 14c2 2 6 2 8 0" stroke="#00faff" strokeWidth="2"/></svg>}>
          <TextEditor
            label=""
            value={texts.transcription}
            onChange={(value) => {
              setTexts(prev => ({ ...prev, transcription: value }));
            }}
            onClear={clearTranscription}
            fontSize={fontSize}
            toggleFontSize={toggleFontSize}
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
               connectionState={connectionState}
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
            fontSize={fontSize}
            toggleFontSize={toggleFontSize}
            toggleExpand={toggleExpand}
            isExpanded={isExpanded}
            useAutosize={true}
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