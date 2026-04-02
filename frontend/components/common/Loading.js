import React from 'react';

export default function Loading({ fullScreen = false, text = 'Đang tải...' }) {
  const spinnerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={spinnerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-semibold">{text}</p>
      </div>
    </div>
  );
}
