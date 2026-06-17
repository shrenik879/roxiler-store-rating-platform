import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Input = forwardRef(function Input(
  { label, error, className, id, hint, ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn('input', error && 'border-danger focus:border-danger focus:ring-danger', className)}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
