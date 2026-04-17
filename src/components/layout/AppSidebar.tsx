import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  Settings,
  FileBarChart,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

const navItems = [
  { icon: Upload, label: 'Import', path: '/', requiresData: false },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', requiresData: true },
  { icon: FileBarChart, label: 'Données', path: '/data', requiresData: true },
  { icon: TrendingUp, label: 'Évolution', path: '/evolution', requiresData: false },
  { icon: Settings, label: 'Paramètres', path: '/settings', requiresData: false },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasData } = useData();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-hidden border-r border-sidebar-border bg-[linear-gradient(180deg,#182B16,#0d1a0c)] text-sidebar-foreground shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-1 bg-[length:200%_auto] animate-gradient-x" style={{ backgroundImage: 'var(--top-accent-gradient)' }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.12),transparent_40%)]" />

      <div className="relative flex h-20 items-center gap-3 border-b border-sidebar-border px-5 backdrop-blur-xl">
        <img src="/Dashcommercial/noa-logo.png" alt="Logo Noa" className="h-9 w-auto object-contain" />
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-sidebar-foreground">Dashboard</p>
          <p className="text-xs leading-tight text-sidebar-muted">Commercial</p>
        </div>
      </div>

      <nav className="relative flex-1 space-y-1 p-3">
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

      <div className="relative border-t border-sidebar-border p-4">
        <a
          href="https://cal.com/noa-benitez-yvd7t0/rdv-sans-engagement?overlayCalendar=true"
          target="_blank"
          rel="noreferrer"
          className="mb-3 block rounded-2xl border border-sidebar-primary/40 bg-white/10 px-4 py-3 text-center text-sm font-bold text-[#4ade80] shadow-sm transition-all duration-300 hover:bg-white/15 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
        >
          Demander mon outil sur mesure
        </a>
        <div className="glass-panel rounded-2xl border border-white/5 bg-white/5 p-3 text-center">
          <p className="text-xs leading-relaxed text-sidebar-muted">
            {hasData ? (
              <span className="font-medium text-[#4ade80]">● Données chargées</span>
            ) : (
              'Importez des données ou lancez la démo pour commencer'
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}
