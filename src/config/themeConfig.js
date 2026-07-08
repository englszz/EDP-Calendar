/**
 * Configuración de temas de colores para EDP Calendar.
 * Cada tema define el color de acento y sus variantes.
 * El fondo oscuro (#0a0a0a) siempre se mantiene.
 */

export const THEMES = [
  {
    id: 'white',
    name: 'Blanco',
    accent: '#ffffff',
    accentHover: '#e5e5e5',
    accentMuted: 'rgba(255, 255, 255, 0.15)',
    textOnAccent: '#000000',
    bgBase: '#050505',
    bgCard: '#111111',
    previewImage: null,
  },
  {
    id: 'purple',
    name: 'Morado',
    accent: '#a855f7',
    accentHover: '#9333ea',
    accentMuted: 'rgba(168, 85, 247, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#10051a',
    bgCard: '#1d0f2b',
    previewImage: null,
  },
  {
    id: 'green',
    name: 'Verde',
    accent: '#22c55e',
    accentHover: '#16a34a',
    accentMuted: 'rgba(34, 197, 94, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#051208',
    bgCard: '#0b2413',
    previewImage: null,
  },
  {
    id: 'blue',
    name: 'Azul',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentMuted: 'rgba(59, 130, 246, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#060f1f',
    bgCard: '#0d1d36',
    previewImage: null,
  },
  {
    id: 'yellow',
    name: 'Amarillo',
    accent: '#eab308',
    accentHover: '#ca8a04',
    accentMuted: 'rgba(234, 179, 8, 0.15)',
    textOnAccent: '#000000',
    bgBase: '#171203',
    bgCard: '#2b2108',
    previewImage: null,
  },
  {
    id: 'pink',
    name: 'Rosa',
    accent: '#ec4899',
    accentHover: '#db2777',
    accentMuted: 'rgba(236, 72, 153, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#1a0511',
    bgCard: '#2b0b1d',
    previewImage: null,
  },
  {
    id: 'red',
    name: 'Rojo',
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentMuted: 'rgba(239, 68, 68, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#1a0606',
    bgCard: '#2b0b0b',
    previewImage: null,
  },
  {
    id: 'orange',
    name: 'Naranja',
    accent: '#f97316',
    accentHover: '#ea580c',
    accentMuted: 'rgba(249, 115, 22, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#1a0a03',
    bgCard: '#2b1307',
    previewImage: null,
  },
  {
    id: 'cyan',
    name: 'Cyan',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    accentMuted: 'rgba(6, 182, 212, 0.15)',
    textOnAccent: '#ffffff',
    bgBase: '#041317',
    bgCard: '#092329',
    previewImage: null,
  },
];

export const DEFAULT_THEME_ID = 'white';

export const getThemeById = (id) =>
  THEMES.find((t) => t.id === id) || THEMES[0];
