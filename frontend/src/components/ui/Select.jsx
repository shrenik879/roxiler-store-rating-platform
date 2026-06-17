import { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Select = forwardRef(function Select(
  { label, error, className, id, children, ...props },
  ref
) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={cn('input cursor-pointer', error && 'border-danger', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
