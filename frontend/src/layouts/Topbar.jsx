import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBadge } from '@/components/ui/Badge';

export function Topbar({ title }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <h2 className="text-sm font-medium text-muted">{title}</h2>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[160px] truncate text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-muted leading-tight">{user?.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 animate-fade-in rounded-xl border border-border bg-card p-1.5 shadow-elevated">
            <div className="flex items-center gap-2 px-3 py-2">
              <UserIcon className="h-4 w-4 text-muted" />
              <RoleBadge role={user?.role} />
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => {
                setOpen(false);
                navigate('/change-password');
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/5 transition-colors"
            >
              <KeyRound className="h-4 w-4" /> Change password
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
