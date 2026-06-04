import React, { ReactNode } from 'react';

interface Column<T> {
  header: ReactNode;
  accessorKey: keyof T | string;
  cell?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
}

export function Table<T>({ 
  data, 
  columns, 
  isLoading = false, 
  emptyStateMessage = "No records found.",
  className = '' 
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-surface-variant bg-surface-container-low/50">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="px-md py-sm text-label-caps text-on-surface-variant font-bold uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-md py-lg text-center">
                <span className="material-symbols-outlined animate-loader text-primary text-xl">
                  progress_activity
                </span>
                <span className="block mt-sm text-body-sm text-on-surface-variant">Loading data...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-md py-lg text-center text-body-sm text-on-surface-variant">
                {emptyStateMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="border-b border-surface-variant hover:bg-surface-container-low transition-colors"
                style={{ height: '48px' }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-md py-sm text-table-data text-on-surface">
                    {col.cell ? col.cell(row) : (row as Record<string, React.ReactNode>)[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
