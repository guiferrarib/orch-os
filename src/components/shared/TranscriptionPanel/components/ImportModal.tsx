// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from "react";
import { ImportModalProps } from "../types/interfaces";
import styles from "../TranscriptionPanel.module.css";

const ImportModal: React.FC<ImportModalProps> = ({
  show,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
  importFile,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setImportFile, 
  importUserName,
  setImportUserName,
  importMode,
  setImportMode,
  importProgress,
  importStage,
  importSummary,
  isImporting,
  handleFileChange,
  handleStartImport,
  handleCloseImportModal
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-white/60 hover:text-white"
          onClick={handleCloseImportModal}
          title="Fechar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
        <h2 className="text-lg font-bold mb-4 text-white">Import ChatGPT Conversations</h2>
        <input
          data-testid="import-user-name"
          type="text"
          className="mb-2 w-full text-white bg-gray-800 rounded p-2"
          placeholder="Main user name"
          disabled={isImporting}
          value={importUserName || ''}
          onChange={e => setImportUserName(e.target.value)}
        />
        <input
          data-testid="import-user-input"
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="mb-4 w-full text-white bg-gray-800 rounded p-2"
          disabled={isImporting}
          title="Select the JSON file exported from ChatGPT"
          placeholder="Select the JSON file"
        />
        <div className="mb-4">
          <label className="text-white/80 mr-4">Import Mode:</label>
          <label className="mr-2">
            <input
              type="radio"
              name="importMode"
              value="overwrite"
              checked={importMode === 'overwrite'}
              onChange={() => setImportMode('overwrite')}
              disabled={isImporting}
            /> Overwrite all
          </label>
          <label>
            <input
              type="radio"
              name="importMode"
              value="increment"
              checked={importMode === 'increment'}
              onChange={() => setImportMode('increment')}
              disabled={isImporting}
            /> Increment (add only new)
          </label>
        </div>
        <button
          className="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800 font-semibold mb-4 disabled:opacity-60"
          onClick={() => {
            console.log('[TranscriptionPanel] Button of import clicked. importMode:', importMode);
            handleStartImport(importUserName);
          }}
          disabled={!importFile || isImporting}
        >
          {isImporting ? 'Importing...' : 'Start Import'}
        </button>
        {isImporting && (
          <div className="w-full mb-4 relative">
            <div className="w-full bg-gray-700 rounded h-6 overflow-hidden relative">
              {/* Background progress bar */}
              <div
                className={styles.progressBar}
                style={{ width: `${importProgress}%` }}
              ></div>
              {/* Centered percentage text (fixed position) */}
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium z-20">
                {importProgress}%
              </div>
            </div>
          </div>
        )}
        {isImporting && (
          <div className="mb-2 text-white/80 flex items-center">
            <span className="mr-2">Current stage:</span>
            <span className="font-semibold">
              {(() => {
                switch (importStage) {
                  case 'parsing': return 'Reading messages';
                  case 'deduplicating': return 'Checking duplicates';
                  case 'generating_embeddings': return 'Generating embeddings';
                  case 'saving': return 'Saving to database';
                  default: return importStage ? importStage : 'Preparing...';
                }
              })()}
            </span>
          </div>
        )}
        {importSummary && (
          <div className="text-green-400 text-sm mt-2" data-testid="import-summary">{importSummary}</div>
        )}

        {importSummary && (
          <div className="text-white/80 text-xs mt-2" data-testid="import-result-details">
            {/* Detailed success case with stats */}
            {importSummary.includes('Imported:') && importSummary.includes('Skipped:') && (
              <>
                Total messages processed: {(() => {
                  const matches = importSummary.match(/Imported: (\d+), Skipped: (\d+)/);
                  if (matches) {
                    return Number(matches[1]) + Number(matches[2]);
                  }
                  return 0;
                })()}<br />
                {importSummary.replace('Import complete! ', '')}
              </>
            )}
            
            {/* Simple success case without stats */}
            {importSummary === 'Import complete!' && (
              <>Import completed successfully with no details available.</>
            )}
            
            {/* Error case */}
            {importSummary.includes('Error:') && (
              <span className="text-red-400">{importSummary}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
