// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

// Helper and logic functions extracted from TranscriptionPanel
// Add types and exports as needed

import type { ToastVariant } from "../../../ui/toast";

export const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setImportFile: (file: File | null) => void,
  setImportSummary: (summary: string) => void
) => {
  if (e.target.files && e.target.files.length > 0) {
    setImportFile(e.target.files[0]);
    setImportSummary("");
  }
};

export const handleStartImport = async (
  importFile: File | null,
  importMode: 'overwrite' | 'increment',
  importUserName: string,
  setIsImporting: (b: boolean) => void,
  setImportProgress: (n: number) => void,
  setImportStage: (s: string) => void,
  setImportSummary: (s: string) => void,
  showToast: (title: string, description: string, variant: ToastVariant) => void
) => {
  if (!importFile) return;
  setIsImporting(true);
  setImportProgress(0);
  setImportStage("");
  setImportSummary("");
  try {
    // Read file as buffer
    // ...
    // Simulate import logic
    setTimeout(() => {
      setImportProgress(100);
      setImportStage('done');
      setIsImporting(false);
      setImportSummary('Imported: 10, Ignored: 2');
      showToast('Import', 'Importation completed', 'success');
    }, 1000);
  } catch (err) {
    setIsImporting(false);
    setImportSummary('Error importing');
    showToast('Import', 'Error importing', 'error');
  }
};

export const handleCloseImportModal = (
  setShowImportModal: (b: boolean) => void,
  setImportFile: (file: File | null) => void,
  setImportProgress: (n: number) => void,
  setImportSummary: (s: string) => void,
  setIsImporting: (b: boolean) => void
) => {
  setShowImportModal(false);
  setImportFile(null);
  setImportProgress(0);
  setImportSummary("");
  setIsImporting(false);
};

export const toggleRecording = (
  isMicrophoneOn: boolean,
  setIsMicrophoneOn: (b: boolean) => void
) => {
  setIsMicrophoneOn(!isMicrophoneOn);
};

export const handleSendPrompt = (
  sendTranscriptionPrompt: () => void
) => {
  sendTranscriptionPrompt();
};

export const clearTranscription = (setTexts: (texts: string[]) => void) => {
  setTexts([]);
};

export const clearAiResponse = (setTemporaryContext: (c: string) => void) => {
  setTemporaryContext("");
};

export const toggleFontSize = (
  fontSize: string,
  setFontSize: (s: string) => void
) => {
  setFontSize(fontSize === 'text-sm' ? 'text-lg' : 'text-sm');
};

export const toggleExpand = (
  isExpanded: boolean,
  setIsExpanded: (b: boolean) => void
) => {
  setIsExpanded(!isExpanded);
};
