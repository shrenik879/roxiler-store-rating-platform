import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export function DataTable({ columns, rows, loading, sort, onSort, emptyState, onRowClick, rowKey = (r) => r.id }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <TableSkeleton cols={columns.length} />
      </div>
    );
  }

  if (!rows?.length) {
    return <div className="card">{emptyState || <EmptyState />}</div>;
  }

  const SortIcon = ({ colKey }) => {
    if (sort?.sortBy !== colKey) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sort.sortOrder === 'ASC' ? (
      <ArrowUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-primary" />
    );
  };

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium text-muted">
                  {col.sortable && onSort ? (
                    <button
                      onClick={() => onSort(col.key)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      {col.header}
                      <SortIcon colKey={col.key} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={rowKey(row)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-border/60 last:border-0 hover:bg-white/[0.02] transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 text-foreground/90', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
