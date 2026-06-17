import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';

export function StatCard({ label, value, icon: Icon, tone = 'primary', hint, index = 0 }) {
  const tones = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <div className={cn('rounded-lg p-2', tones[tone])}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </motion.div>
  );
}
