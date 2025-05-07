// SPDX-License-Identifier: MIT OR Apache-2.0
// Copyright (c) 2025 Guilherme Ferrari Brescia

import React from 'react';

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onChange: () => void;
  title: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, isOn, onChange, title }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <div className="flex items-center space-x-2">
      <label className="relative inline-block w-10 h-5">
        <input
          title={title}
          type="checkbox"
          className="hidden"
          checked={isOn}
          onChange={onChange}
        />
        <span className={`block w-10 h-5 rounded-full transition-all duration-300 ${isOn ? "bg-green-500" : "bg-gray-600"}`}></span>
        <span className={`absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ${isOn ? "translate-x-5" : "translate-x-0"}`}></span>
      </label>
    </div>
  </div>
);

export default ToggleSwitch;
