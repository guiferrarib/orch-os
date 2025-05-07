// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';
import TextControls from './TextControls';
import styles from '../TranscriptionPanel.module.css';

interface TextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  fontSize: string;
  toggleFontSize: () => void;
  rows?: number;
  placeholder?: string;
  isExpanded?: boolean;
  toggleExpand?: () => void;
  forwardedRef?: React.RefObject<HTMLTextAreaElement>;
  useAutosize?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  label,
  value,
  onChange,
  onClear,
  fontSize,
  toggleFontSize,
  rows = 5,
  placeholder = '',
  isExpanded,
  toggleExpand,
  forwardedRef,
  useAutosize = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const commonClasses = `w-full p-3 rounded bg-black/40 text-white ${fontSize} leading-relaxed font-medium shadow-inner ${styles.letterSpacing}`;

  return (
    <div className="mb-4">
      <TextControls
        label={label}
        onClear={onClear}
        onFontSize={toggleFontSize}
        onExpand={toggleExpand}
      />
      
      {useAutosize ? (
        <textarea
          className={`${commonClasses} resize-none ${isExpanded ? 'max-h-96' : 'max-h-60'} overflow-y-auto`}
          value={value}
          onChange={handleChange}
          rows={isExpanded ? 10 : rows}
          placeholder={placeholder}
          ref={forwardedRef}
        />
      ) : (
        <textarea
          className={`${commonClasses} resize-none`}
          value={value}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          ref={forwardedRef}
        />
      )}
    </div>
  );
};

export default TextEditor;
