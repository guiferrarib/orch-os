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
// Brain visualization import
import { BrainVisualizationContainer } from '../BrainVisualization';


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
      className={`pr-4 pb-4 pl-4 min-h-screen bg-gradient-to-br from-white to-[#DCE0E5] backdrop-blur-lg border border-white/10 text-[#222] ${width || 'w-full min-w-[384px] max-w-xl'}`}
      style={{ boxSizing: 'border-box', position: 'relative' }}
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
        >
          <span className="material-symbols-outlined text-[#222] text-2xl">settings</span>
        </button>
        {showSettings && (
          <div className="absolute z-50 right-8 top-12 bg-white/90 rounded-lg shadow-xl p-4 backdrop-blur-md border border-gray-200 flex flex-col gap-2 min-w-[220px]">
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

      {/* Brain Visualization Container */}
      <div className="w-full h-64 mt-4 rounded-lg overflow-hidden">
        <BrainVisualizationContainer 
          cognitionEvents={cognitionEvents}
          height="256px" 
        />
      </div>

      {/* --- Main Panel Cards --- */}
      <div className="bg-white/70 rounded-2xl shadow-xl p-4 mb-4 backdrop-blur-xl border border-white/20">
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
          forwardedRef={transcriptionRef}
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