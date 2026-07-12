import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ToastContainer from '../ui/Toast';

import ThemePopover from './ThemePopover';
import 'bootstrap-icons/font/bootstrap-icons.css';

const navLinks = [
  {
    to: '/',
    label: 'Personal',
    exact: true,
    iconClass: 'bi-person',
    iconActiveClass: 'bi-person-fill',
  },
  {
    to: '/projects',
    label: 'Proyectos',
    iconClass: 'bi-folder',
    iconActiveClass: 'bi-folder-fill',
  },
  {
    to: '/stats',
    label: 'Estadísticas',
    iconClass: 'bi-bar-chart',
    iconActiveClass: 'bi-bar-chart-fill',
  },
  {
    to: '/finance',
    label: 'Finanzas',
    iconClass: 'bi-wallet2',
    iconActiveClass: 'bi-wallet-fill',
  },
];

const Layout = () => {
  const { user, signOut } = useAuth();
  const [isFocusMode, setIsFocusMode] = React.useState(false);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <ToastContainer />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-base border-b border-[#1e1e1e]">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/LOGOtransparente.png" alt="EDP" className="w-8 h-8 object-contain" />

              <span className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--accent)' }}>
                EDP <span className="text-slate-400">Calendar</span>
              </span>
            </div>

            {/* NAV DESKTOP */}
            {!isFocusMode && (
              <nav className="hidden sm:flex items-center gap-1">

                {navLinks.map(({ to, label, iconClass, iconActiveClass, exact }) => (

                  <NavLink
                    key={to}
                    to={to}
                    end={exact}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all border rounded-lg ${
                        isActive
                          ? 'border-transparent'
                          : 'text-slate-400 hover:text-white border-transparent hover:border-[#333]'
                      }`
                    }
                    style={({ isActive }) => isActive ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' } : {}}
                  >

                    {({ isActive }) => (
                      <>
                        <i className={`bi ${isActive ? iconActiveClass : iconClass} text-base leading-none`}></i>
                        <span>{label}</span>
                      </>
                    )}

                  </NavLink>

                ))}

              </nav>
            )}
          </div>

          {/* USER & FOCUS MODE */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="text-slate-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
              title="Modo Enfoque"
            >
              <i className={`bi ${isFocusMode ? 'bi-fullscreen-exit' : 'bi-fullscreen'} text-lg leading-none`}></i>
            </button>
            
            {!isFocusMode && (
              <>
                <ThemePopover />
                <span className="text-xs text-slate-600 hidden sm:block truncate max-w-40 ml-2 border-l border-[#222] pl-3">
                  {user.email}
                </span>

                <button
                  onClick={signOut}
                  className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 border border-transparent hover:border-[#333] rounded-lg"
                >
                  Salir
                </button>
              </>
            )}
          </div>

        </div>

        {/* MOBILE NAV */}
        {!isFocusMode && (
          <nav className="sm:hidden flex border-t border-[#1e1e1e]">

          {navLinks.map(({ to, label, iconClass, iconActiveClass, exact }) => (

            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-all ${
                  isActive ? '' : 'text-slate-500'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' } : {}}
            >

              {({ isActive }) => (
                <>
                  <i className={`bi ${isActive ? iconActiveClass : iconClass} text-lg leading-none`}></i>
                  <span>{label}</span>
                </>
              )}

            </NavLink>

          ))}

        </nav>
        )}

      </header>

      {/* MAIN */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 transition-all duration-200 ${isFocusMode ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;
