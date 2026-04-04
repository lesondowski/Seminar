import React from 'react';
import { WORLD_LANGUAGES } from '../../utils/narration/languages';

export default function LanguageSelector({ value, onChange, disabled = false, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg border border-[#d1d5db] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#111827]/20 ${className}`}
    >
      {WORLD_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
