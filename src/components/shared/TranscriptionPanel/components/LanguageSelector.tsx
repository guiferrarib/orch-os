// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';

interface LanguageSelectorProps {
  language: string;
  setLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  setLanguage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <label className="text-sm block mb-1">Transcription Language:</label>
      <select
        title="Transcription Language"
        className="w-full p-2 rounded bg-black/40 text-white/90 text-sm"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="pt_BR">Auto</option>
        <option value="en-US">English (en-US)</option>
        <option value="pt-BR">Portuguese (pt-BR)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
