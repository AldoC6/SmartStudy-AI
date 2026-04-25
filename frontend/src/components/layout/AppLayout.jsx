import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BookOpen, ShieldAlert, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/utils';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, testid: 'nav-dashboard' },
  { to: '/tasks', label: 'Tareas', icon: ListChecks, testid: 'nav-tasks' },
  { to: '/study-plans', label: 'Planes de Estudio', icon: BookOpen, testid: 'nav-plans' },
  { to: '/results', label: 'Resultados', icon: ShieldAlert, testid: 'nav-results' },
];

function SidebarContent({ onNavigate }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-7">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-bg">
            <Sparkles size={18} strokeWidth={2.4} />
          </div>
          <div>
            <p className="font-heading text-base font-bold leading-none">SmartStudy</p>
            <p className="text-[10px] tracking-[0.25em] text-accent uppercase mt-1">AI · Beta</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testid}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 relative',
                isActive
                  ? 'text-white bg-accent/[0.07]'
                  : 'text-ink-secondary hover:text-white hover:bg-line/40'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent" />
                )}
                <Icon size={18} strokeWidth={1.8} className={isActive ? 'text-accent' : ''} />
                <span className="font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-line">
        <div className="text-[10px] tracking-[0.25em] uppercase text-ink-muted">v1.0 · NestJS API</div>
      </div>
    </div>
  );
}

function TopNav({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getInitials(user?.name || user?.email || 'Usuario');

  return (
    <header className="glass-nav sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            data-testid="open-sidebar-btn"
            onClick={onMenu}
            className="md:hidden text-ink-secondary hover:text-white"
            aria-label="Menú"
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            Plataforma activa
          </div>
        </div>
        <div className="relative">
          <button
            data-testid="user-menu-btn"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-line/40 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p data-testid="user-name" className="text-sm font-semibold leading-none">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-ink-muted leading-none mt-1">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full border border-line bg-bg-card flex items-center justify-center text-sm font-semibold text-accent">
              {initials}
            </div>
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 surface-card !p-2 z-20 animate-fade-up">
                <div className="px-3 py-2 border-b border-line mb-1">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                </div>
                <button
                  data-testid="logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-bad hover:bg-bad/10 transition-colors"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-bg-sidebar border-r border-line">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-bg-sidebar border-r border-line">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-ink-secondary"
              aria-label="Cerrar menú"
            >
              <X size={22} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
