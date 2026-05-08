import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Personal', emoji: '🏠', exact: true },
  { to: '/projects', label: 'Proyectos', emoji: '💼' },
  { to: '/stats', label: 'Estadísticas', emoji: '📊' },
];

const Layout = () => {
  const { user, signOut } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-50 bg-surface border-b border-surface-border" style={{backdropFilter:'blur(16px)'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo + name */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <img src="/logo-transparent.png" alt="EDP" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                EDP <span className="text-primary">Calendar</span>
              </span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ to, label, emoji, exact }) => (
                <NavLink key={to} to={to} end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}>
                  <span>{emoji}</span><span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block truncate max-w-40">{user.email}</span>
            <button onClick={signOut} className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10">
              Salir
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="sm:hidden flex border-t border-surface-border">
          {navLinks.map(({ to, label, emoji, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-all ${
                  isActive ? 'text-primary' : 'text-slate-500'
                }`}>
              <span className="text-base">{emoji}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
