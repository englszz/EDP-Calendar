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
  { value: 'estudio', label: 'Estudio', color: '#3b82f6', emoji: '📚' },
  { value: 'trabajo', label: 'Trabajo', color: '#8b5cf6', emoji: '💼' },
  { value: 'personal', label: 'Personal', color: '#10b981', emoji: '🙂' },
  { value: 'gym', label: 'Gym', color: '#f59e0b', emoji: '💪' },
  { value: 'aprendizaje', label: 'Aprendizaje', color: '#ec4899', emoji: '🎯' },
  { value: 'otro', label: 'Otro', color: '#6b7280', emoji: '📌' },
];

export const PRIORITIES = [
  { value: 'alta', label: 'Alta', color: '#ef4444' },
  { value: 'media', label: 'Media', color: '#f59e0b' },
  { value: 'baja', label: 'Baja', color: '#10b981' },
];

export const getCategoryInfo = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[5];

export const getPriorityInfo = (value) =>
  PRIORITIES.find(p => p.value === value) || PRIORITIES[1];
