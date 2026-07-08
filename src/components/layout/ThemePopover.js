import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { THEMES } from '../../config/themeConfig';
import { CheckIcon } from '../icons/Icons';

export default function ThemePopover() {
  const { themeId, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        title="Cambiar color del tema"
      >
        <i className="bi bi-sun-fill text-lg"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 card p-4 rounded-xl shadow-xl z-50 animate-fade-in border border-[#2a2a2a]">
          <h3 className="text-sm font-medium text-white mb-3">Color de acento</h3>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => {
              const isSelected = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`relative w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-[#111] ring-white/50' : ''
                  }`}
                  style={{ backgroundColor: theme.accent }}
                  title={theme.name}
                >
                  {isSelected && (
                    <CheckIcon className="w-4 h-4" style={{ color: theme.textOnAccent }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
