import { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  isLoading,
  emptyTitle = 'No records found',
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  onRowClick?: (row: T) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (rows.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-3 py-2.5 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row._id}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer border-b border-border last:border-0 hover:bg-surface' : 'border-b border-border last:border-0'}
            >
              {columns.map((col) => (
                <td key={col.header} className={`whitespace-nowrap px-3 py-3 ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
