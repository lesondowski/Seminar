import React from 'react';

export default function Table({ 
  columns = [], 
  data = [], 
  onRowClick, 
  actions = [],
  loading = false 
}) {
  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-4 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="border px-4 py-2 text-left font-semibold">
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="border px-4 py-2 text-left font-semibold">Tác vụ</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr 
              key={idx} 
              className="border hover:bg-gray-100 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="border px-4 py-2">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="border px-4 py-2 flex gap-2">
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      className={`px-3 py-1 rounded text-white text-sm ${
                        action.variant === 'danger' ? 'bg-red-600' : 'bg-blue-600'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
