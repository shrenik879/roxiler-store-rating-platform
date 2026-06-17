import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ meta, onPageChange }) {
  if (!meta) return null;
  const { page, totalPages, total } = meta;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
      <p className="text-xs text-muted">
        Page <span className="text-foreground font-medium">{page}</span> of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="px-2.5 py-1.5"
          disabled={!meta.hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          className="px-2.5 py-1.5"
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
