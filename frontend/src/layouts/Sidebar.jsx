import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { ROLES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/admin/stores', label: 'Stores', icon: Store, roles: [ROLES.ADMIN] },
  { to: '/stores', label: 'Browse Stores', icon: Store, roles: [ROLES.USER] },
  { to: '/owner/dashboard', label: 'My Store', icon: Star, roles: [ROLES.STORE_OWNER] },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const items = NAV.filter((i) => i.roles.includes(user?.role));

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 248 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card md:flex"
    >
      <div className="flex h-16 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Star className="h-4 w-4 fill-white text-white" />
        </div>
        {!collapsed && <span className="text-sm font-semibold tracking-tight">StoreRating</span>}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-white/5 hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground transition-colors"
      >
        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </motion.aside>
  );
}
