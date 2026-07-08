import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '../config/themeConfig';
import { CheckIcon } from '../components/icons/Icons';

export default function ColorPicker() {
  const { user } = useAuth();
  const { themeId, setTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(themeId || THEMES[0].id);

  if (!user) return <Navigate to="/login" />;
  
  // Si ya había elegido tema y entramos por error (aunque permitimos re-elegir por ahora)
  // Dejemos que pueda usar esta pantalla si quiere, pero principalmente es para el primer login.

  const handleContinue = () => {
    setTheme(selectedId);
    navigate('/');
  };

  const selectedTheme = THEMES.find((t) => t.id === selectedId);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full animate-fade-in space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
            Elige tu color
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Personaliza tu experiencia. Selecciona el color de acento que prefieras para tu espacio de organización.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Opciones de colores */}
          <div className="card p-6 order-2 lg:order-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-4">
              {THEMES.map((theme) => {
                const isSelected = selectedId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedId(theme.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                      isSelected ? 'bg-white/5 border border-white/20' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform"
                      style={{ backgroundColor: theme.accent, transform: isSelected ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      {isSelected && (
                        <CheckIcon className="w-5 h-5" style={{ color: theme.textOnAccent }} />
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-300">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vista previa */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            <div className="w-full max-w-sm card rounded-2xl overflow-hidden border border-[#222] shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none opacity-50" />
              
              <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="h-4 w-24 bg-[#222] rounded-full" />
              </div>

              <div className="p-6 space-y-4 bg-base relative min-h-[250px]">
                {selectedTheme.previewImage ? (
                  <img 
                    src={selectedTheme.previewImage} 
                    alt={`Vista previa ${selectedTheme.name}`} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  // Mini mockup en vivo
                  <div className="space-y-4 animate-fade-in relative z-20">
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: selectedTheme.accent }} />
                      <div className="h-8 w-20 rounded-lg border border-[#333]" />
                    </div>
                    <div className="card p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedTheme.accent }} />
                        <div className="h-3 w-32 bg-[#222] rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-[#444]" />
                        <div className="h-3 w-40 bg-[#222] rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">Vista previa de la interfaz</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-xl font-medium transition-all active:scale-95 text-sm"
            style={{ backgroundColor: selectedTheme.accent, color: selectedTheme.textOnAccent }}
          >
            Continuar al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
