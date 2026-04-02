import React from 'react';

export default function Select({ 
  label, 
  value, 
  onChange, 
  options = [], 
  error = '', 
  required = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 text-gray-700 font-semibold">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
          error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">-- Chọn --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
}
