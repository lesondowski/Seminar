import React from 'react';

export default function TranslateToggle({ showTranslated, onChange, disabled = false }) {
  return (
    <div className="inline-flex rounded-lg border border-[#d1d5db] overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`px-3 py-1.5 text-xs font-semibold transition ${
          !showTranslated ? 'bg-[#111827] text-white' : 'bg-white text-[#4b5563] hover:bg-[#f3f4f6]'
        }`}
      >
        Bản gốc
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`px-3 py-1.5 text-xs font-semibold transition ${
          showTranslated ? 'bg-[#111827] text-white' : 'bg-white text-[#4b5563] hover:bg-[#f3f4f6]'
        }`}
      >
        Bản dịch
      </button>
    </div>
  );
}
