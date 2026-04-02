import React from 'react';

export default function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  error = '', 
  required = false,
  disabled = false,
  className = ''
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 text-[#212121] font-semibold">
          {label}
          {required && <span className="text-[#DC3545]">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors bg-[#FFFFFF] text-[#212121] ${
          error ? 'border-[#DC3545]' : 'border-[#DDDDDD] focus:border-[#212121]'
        } ${disabled ? 'bg-[#F5F5F5] cursor-not-allowed' : ''}`}
      />
      {error && <span className="text-[#DC3545] text-sm mt-1">{error}</span>}
    </div>
  );
}
