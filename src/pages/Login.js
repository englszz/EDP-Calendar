import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { requestNotificationPermission } from '../utils/notifications';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      await requestNotificationPermission();
      navigate('/');
    } catch (err) {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/20 border border-primary/30 mb-5 shadow-lg shadow-primary/20">
          <img src="/logo-transparent.png" alt="EDP Calendar" className="w-14 h-14 object-contain brightness-0 invert" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">EDP Calendar</h1>
        <p className="text-slate-500 mt-1 text-sm mb-10">Tu espacio de organización personal</p>

        <div className="card p-6">
          <p className="text-slate-400 text-sm mb-6">Inicia sesión para continuar</p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {/* Google icon SVG */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Entrando...' : 'Continuar con Google'}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">EDP.web © 2025</p>
      </div>
    </div>
  );
}
