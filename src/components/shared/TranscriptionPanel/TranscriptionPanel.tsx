// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import type { ElectronAPI } from '../../../types/electron';
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

import React from "react";
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

  return (
    <div
      className={`pr-4 pb-4 pl-4 bg-black/80 backdrop-blur-md border border-white/10 text-white/90 ${width || 'w-full min-w-[384px] max-w-xl'}`}
      style={{ minHeight: '100vh', boxSizing: 'border-box' }}
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
        className="w-full py-2.5 text-center bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mb-4 font-medium"
        onClick={handleSendPrompt}
      >
        Send Prompt
      </button>

      <CognitionLogSection 
        cognitionEvents={cognitionEvents}
        exporters={exporters}
        exportEvents={exportEvents}
        clearEvents={clearEvents}
      />

      <div className="mb-4">
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