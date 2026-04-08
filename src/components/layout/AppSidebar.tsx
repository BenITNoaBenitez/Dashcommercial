import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Settings,
  FileBarChart,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

const navItems = [
  { icon: Upload,          label: 'Import',      path: '/',          requiresData: false },
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard', requiresData: true  },
  { icon: FileBarChart,    label: 'Données',     path: '/data',      requiresData: true  },
  { icon: TrendingUp,      label: 'Évolution',   path: '/evolution', requiresData: false },
  { icon: Settings,        label: 'Paramètres',  path: '/settings',  requiresData: false },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasData } = useData();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar flex flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground leading-tight">Dashboard</p>
          <p className="text-xs text-sidebar-muted leading-tight">Commercial</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = item.requiresData && !hasData;

          if (isDisabled) {
            return (
              <div
                key={item.path}
                className="sidebar-nav-item cursor-not-allowed opacity-35"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn('sidebar-nav-item', isActive && 'active')}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent/50 p-3 text-center">
          <p className="text-xs text-sidebar-muted leading-relaxed">
            {hasData ? (
              <span className="text-sidebar-primary font-medium">● Données chargées</span>
            ) : (
              'Importez des données ou lancez la démo pour commencer'
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}
