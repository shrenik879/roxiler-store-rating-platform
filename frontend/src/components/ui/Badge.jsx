import { cn } from '@/utils/cn';
import { ROLE_LABELS } from '@/constants';

const tones = {
  default: 'border-border text-muted bg-white/5',
  primary: 'border-primary/30 text-primary bg-primary/10',
  success: 'border-success/30 text-success bg-success/10',
  warning: 'border-warning/30 text-warning bg-warning/10',
  danger: 'border-danger/30 text-danger bg-danger/10',
};

export function Badge({ tone = 'default', className, children }) {
  return <span className={cn('badge', tones[tone], className)}>{children}</span>;
}

const roleTone = { ADMIN: 'primary', STORE_OWNER: 'warning', USER: 'success' };

export function RoleBadge({ role }) {
  return <Badge tone={roleTone[role] || 'default'}>{ROLE_LABELS[role] || role}</Badge>;
}
