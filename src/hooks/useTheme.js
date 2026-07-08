import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getThemeById, DEFAULT_THEME_ID } from '../config/themeConfig';

const STORAGE_KEY = 'edp-theme-color';
const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

/**
 * Aplica las CSS custom properties al documento.
 */
const applyThemeToDOM = (theme) => {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-hover', theme.accentHover);
  root.style.setProperty('--accent-muted', theme.accentMuted);
  root.style.setProperty('--text-on-accent', theme.textOnAccent);
  root.style.setProperty('--bg-base', theme.bgBase);
  root.style.setProperty('--bg-card', theme.bgCard);
};

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const hasChosenTheme = themeId !== null;
  const currentTheme = getThemeById(themeId || DEFAULT_THEME_ID);

  // Aplicar tema al DOM cuando cambie
  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  const setTheme = useCallback((id) => {
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
    const theme = getThemeById(id);
    applyThemeToDOM(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeId, setTheme, hasChosenTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
