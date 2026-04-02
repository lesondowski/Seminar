import React from 'react';
import Button from './Button';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  actions = [],
  children 
}) {
  if (!isOpen) return null;

  const typeStyles = {
    success: 'border-l-4 border-[#28A745] bg-[#F5F5F5]',
    error: 'border-l-4 border-[#DC3545] bg-[#F5F5F5]',
    warning: 'border-l-4 border-[#FFC107] bg-[#F5F5F5]',
    info: 'border-l-4 border-[#212121] bg-[#F5F5F5]',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ⓘ',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-[#FFFFFF] rounded-lg shadow-lg p-6 max-w-md w-full mx-4 border border-[#DDDDDD] ${typeStyles[type]}`}>
        <div className="flex items-start gap-4">
          <div className={`text-3xl font-bold ${
            type === 'success' ? 'text-[#28A745]' :
            type === 'error' ? 'text-[#DC3545]' :
            type === 'warning' ? 'text-[#FFC107]' :
            'text-[#212121]'
          }`}>
            {typeIcons[type]}
          </div>
          <div className="flex-1">
            {title && <h2 className="text-xl font-bold text-[#212121] mb-2">{title}</h2>}
            {message && <p className="text-[#212121] mb-4">{message}</p>}
            {children && <div className="mb-4">{children}</div>}
          </div>
          <button 
            onClick={onClose} 
            className="text-[#757575] hover:text-[#212121] text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {actions.length > 0 ? (
          <div className="flex gap-2 justify-end mt-6">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || 'primary'}
                onClick={() => {
                  action.onClick?.();
                  onClose();
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        )}
      </div>
    </div>
  );
}
