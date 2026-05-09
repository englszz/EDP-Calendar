import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  return format(d, 'd MMM', { locale: es });
};

export const isOverdue = (date) => {
  if (!date) return false;
  const d = date?.toDate ? date.toDate() : new Date(date);
  return isPast(d) && !isToday(d);
};

export const CATEGORIES = [
  { value: 'estudio',     label: 'Estudio',     color: '#4a9eff' },
  { value: 'trabajo',     label: 'Trabajo',     color: '#a78bfa' },
  { value: 'personal',    label: 'Personal',    color: '#34d399' },
  { value: 'gym',         label: 'Gym',         color: '#fbbf24' },
  { value: 'aprendizaje', label: 'Aprendizaje', color: '#f472b6' },
  { value: 'otro',        label: 'Otro',        color: '#9ca3af' },
];

export const PRIORITIES = [
  { value: 'alta',  label: 'Alta',  color: '#ef4444' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'baja',  label: 'Baja',  color: '#6ee7b7' },
];

export const getCategoryInfo = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[5];
export const getPriorityInfo  = (value) => PRIORITIES.find(p => p.value === value) || PRIORITIES[1];

export const USD_TO_DOP = 58.5;

export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount) return currency === 'USD' ? 'US$0' : 'RD$0';
  if (currency === 'DOP') return `RD$${Number(amount).toLocaleString('es-DO')}`;
  return `US$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const convertCurrency = (amount, from, to) => {
  if (from === to) return amount;
  if (from === 'USD' && to === 'DOP') return amount * USD_TO_DOP;
  if (from === 'DOP' && to === 'USD') return amount / USD_TO_DOP;
  return amount;
};