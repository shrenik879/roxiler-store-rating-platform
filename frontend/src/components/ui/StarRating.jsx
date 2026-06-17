import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export function StarRating({ value = 0, onChange, readOnly = false, size = 'md', disabled = false }) {
  const [hover, setHover] = useState(0);
  const dims = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };
  const active = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly || disabled}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(star)}
          className={cn(
            'transition-transform',
            !readOnly && 'hover:scale-110 cursor-pointer',
            (readOnly || disabled) && 'cursor-default'
          )}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              dims[size],
              star <= active ? 'fill-warning text-warning' : 'text-border'
            )}
          />
        </button>
      ))}
    </div>
  );
}
