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
    <div
      className={`transcription-panel ${width ? '' : 'panel-width'}`}
    >
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
      <div className="flex items-center justify-end mb-2">
        <button
          ref={settingsBtnRef}
          className="relative rounded-full bg-white/70 hover:shadow-gold transition-all p-1 mr-2"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Settings"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#222">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
        {showSettings && (
          <div className="absolute z-50 right-0 top-12 bg-white/90 rounded-lg shadow-xl p-4 backdrop-blur-md border border-gray-200 flex flex-col gap-2 min-w-[220px]">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h3 className="text-sm font-medium">Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
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

      {/* Visualização Quântica - Design minimalista com foco na experiência */}
      <div className="my-4 hover-elevate">
        {/* Container com bordas sutis e sombra elegante */}
        <div className="rounded-lg overflow-hidden bg-quantum-dark">
          <div className="quantum-visualization-wrapper">
            <QuantumVisualizationContainer 
              cognitionEvents={cognitionEvents}
              height="100%"
              width="100%"
              lowPerformanceMode={false}
              showLegend={true}
            />
          </div>
        </div>
      </div>

      {/* Contexto Temporário com design minimalista */}
      <div className="mb-4">
        <div className="rounded-lg bg-white/70 border border-white/10 shadow-sm overflow-hidden hover-elevate">
          <TextEditor
            label="Temporary Context:"
            value={temporaryContext}
            onChange={setTemporaryContext}
            onClear={() => setTemporaryContext("")}
            fontSize={fontSize}
            toggleFontSize={toggleFontSize}
            rows={3}
            placeholder="Add situational context (e.g., 'I'm in a neural session' or 'Help me stay focused')"
          />
        </div>
      </div>
      <div className="bg-white/70 rounded-2xl shadow-xl p-4 mb-4 backdrop-blur-xl border border-white/20">
        <TextEditor
          label="Transcription:"
          value={texts.transcription}
          onChange={(value) => {
            setTexts(prev => ({ ...prev, transcription: value }));
          }}
          onClear={clearTranscription}
          fontSize={fontSize}
          toggleFontSize={toggleFontSize}
          forwardedRef={transcriptionRef as React.RefObject<HTMLTextAreaElement>}
        />
        <button
          className="w-full py-2.5 text-center mt-4 bg-white/60 text-[#222] rounded-lg hover:shadow-gold transition-all font-medium backdrop-blur-md border border-yellow-300/30"
          onClick={handleSendPrompt}
        >
          Send Prompt
        </button>
      </div>
      <div className="bg-white/70 rounded-2xl shadow-xl p-4 mb-4 backdrop-blur-xl border border-white/20">
        <CognitionLogSection
          cognitionEvents={cognitionEvents}
          exporters={exporters}
          exportEvents={exportEvents}
          clearEvents={clearEvents}
        />
      </div>
      <div className="bg-white/70 rounded-2xl shadow-xl p-4 mb-4 backdrop-blur-xl border border-white/20">
        <TextEditor
          label="AI Suggested Response:"
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
      </div>
      <RecordingControl
        connectionState={connectionState}
        microphoneState={microphoneState}
        toggleRecording={toggleRecording}
      />

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