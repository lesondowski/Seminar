import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  className = '' 
}) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-colors duration-300 focus:outline-none';
  
  const variants = {
    primary: 'bg-[#333333] text-white hover:bg-[#444444] disabled:bg-[#DDDDDD] disabled:text-[#757575]',
    secondary: 'bg-[#EAEAEA] text-[#212121] hover:bg-[#DDDDDD] disabled:bg-[#F5F5F5]',
    danger: 'bg-[#DC3545] text-white hover:bg-[#C82333] disabled:bg-[#E9A7B0]',
    success: 'bg-[#28A745] text-white hover:bg-[#218838] disabled:bg-[#9ECF9A]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
