import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

import personal from '../../components/icons/personal.png';
import personalWhite from '../../components/icons/personalwhite.png';

import proyectos from '../../components/icons/proyectos.png';
import proyectosWhite from '../../components/icons/proyectoswhite.png';

import estadisticas from '../../components/icons/estadisticas.png';
import estadisticasWhite from '../../components/icons/estadisticaswhite.png';

import finanzas from '../../components/icons/Finanzas1.png';
import finanzasWhite from '../../components/icons/Finanzas2.png';

const navLinks = [
  {
    to: '/',
    label: 'Personal',
    exact: true,
    icon: personal,
    iconActive: personalWhite,
  },
  {
    to: '/projects',
    label: 'Proyectos',
    icon: proyectos,
    iconActive: proyectosWhite,
  },
  {
    to: '/stats',
    label: 'Estadísticas',
    icon: estadisticas,
    iconActive: estadisticasWhite,
  },
  {
  to: '/finance',
  label: 'Finanzas',
  icon: finanzas,
  iconActive: finanzasWhite
  },
];

const Layout = () => {
  const { user, signOut } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#1e1e1e]">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/LOGOtransparente.png" alt="EDP" className="w-8 h-8 object-contain" />

              <span className="font-display font-bold text-base text-white tracking-tight">
                EDP <span className="text-slate-400">Calendar</span>
              </span>
            </div>

            {/* NAV DESKTOP */}
            <nav className="hidden sm:flex items-center gap-1">

              {navLinks.map(({ to, label, icon, iconActive, exact }) => (

                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all border rounded-lg ${
                      isActive
                        ? 'bg-white text-black border-white'
                        : 'text-slate-400 hover:text-white border-transparent hover:border-[#333]'
                    }`
                  }
                >

                  {({ isActive }) => (
                    <>
                      <img
                        src={isActive ? icon : iconActive}
                        alt={label}
                        className="w-4 h-4"
                      />
                      <span>{label}</span>
                    </>
                  )}

                </NavLink>

              ))}

            </nav>
          </div>

          {/* USER */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 hidden sm:block truncate max-w-40">
              {user.email}
            </span>

            <button
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5 border border-transparent hover:border-[#333]"
            >
              Salir
            </button>
          </div>

        </div>

        {/* MOBILE NAV */}
        <nav className="sm:hidden flex border-t border-[#1e1e1e]">

          {navLinks.map(({ to, label, icon, iconActive, exact }) => (

            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-all ${
                  isActive ? 'text-black bg-white' : 'text-slate-500'
                }`
              }
            >

              {({ isActive }) => (
                <>
                  <img
                  src={isActive ? icon : iconActive}
                  alt={label}
                  className="w-4 h-4"
                  />
                  <span>{label}</span>
                </>
              )}

            </NavLink>

          ))}

        </nav>

      </header>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;