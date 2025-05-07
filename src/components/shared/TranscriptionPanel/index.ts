// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// Re-export components for easier importing
export { default as TranscriptionPanel } from './TranscriptionPanel';
export { default as AudioControls } from './components/AudioControls';
export { default as CognitionLogSection } from './components/CognitionLogSection';
export { default as ConnectionDiagnostics } from './components/ConnectionDiagnostics';
export { default as DeviceSelector } from './components/DeviceSelector';
export { default as DiagnosticsPanel } from './components/DiagnosticsPanel';
export { default as ImportModal } from './components/ImportModal';
export { default as LanguageSelector } from './components/LanguageSelector';
export { default as PanelHeader } from './components/PanelHeader';
export { default as RecordingControl } from './components/RecordingControl';
export { default as TextControls } from './components/TextControls';
export { default as TextEditor } from './components/TextEditor';
export { default as ToggleSwitch } from './components/ToggleSwitch';

// Re-export hooks
export { useTranscriptionManager } from './hooks/useTranscriptionManager';
export { useChatGptImport } from './hooks/useChatGptImport';

// Re-export types
export * from './types/interfaces';
