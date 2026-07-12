import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, isOverdue, getCategoryInfo, getPriorityInfo } from '../../utils/helpers';
import { isIOS, isPWA, supportsWebNotifications, showNotification, addTaskToCalendar } from '../../utils/notifications';
import { CalendarIcon, BellIcon, EditIcon, TrashIcon } from '../icons/Icons';

export default function TaskCard({ task, onToggle, onClick, onEdit, onDelete }) {
  const cat = getCategoryInfo(task.category);
  const pri = getPriorityInfo(task.priority);
  const overdue = isOverdue(task.dueDate) && !task.completed;
  const isiOS = isIOS();
  const canNotify = supportsWebNotifications() && Notification.permission === 'granted';

  const handleNotifyNow = (e) => {
    e.stopPropagation();
    showNotification(
      task.title,
      `Vence: ${formatDate(task.dueDate)}`,
      { taskId: task.id }
    );
  };

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    addTaskToCalendar(task);
  };

  // En iOS: mostrar calendario si no es PWA con permisos, notificacion si es PWA
  const showCalendarOption = isiOS && (!canNotify || !isPWA());
  const showNotifyOption = !isiOS || canNotify;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: task.completed ? 0.45 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      onClick={() => onClick?.(task)}
      className={`card p-4 flex gap-3 group transition-all hover:border-[#333] cursor-pointer ${task.completed ? 'opacity-40' : ''} ${overdue ? 'border-l-2 border-l-red-500' : ''}`}>
      <motion.button
        whileTap={{ scale: 0.78 }}
        onClick={(e) => { e.stopPropagation(); onToggle(task.id, task.completed); }}
        className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-all flex items-center justify-center ${
          task.completed ? '' : 'border-[#444] hover:border-white'
        }`}
        style={task.completed ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
        <AnimatePresence>
          {task.completed && (
            <motion.svg
              className="w-2.5 h-2.5"
              fill="none"
              viewBox="0 0 12 12"
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 520, damping: 24 }}
            >
              <path d="M2 6l3 3 5-5" stroke="var(--text-on-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-white leading-snug ${task.completed ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-600 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs" style={{ color: cat.color + 'cc' }}>{cat.label}</span>
          <span className="text-xs" style={{ color: pri.color + 'cc' }}>{pri.label}</span>
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-600'}`}>
              {overdue ? '! ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!task.completed && task.dueDate && (
          <>
            {showCalendarOption && (
              <button
                onClick={handleAddToCalendar}
                className="px-2 py-1 text-slate-600 hover:text-green-400 transition-colors text-xs border border-transparent hover:border-green-900 flex items-center gap-1"
                title="Agregar al calendario">
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            )}
            {showNotifyOption && (
              <button
                onClick={handleNotifyNow}
                className="px-2 py-1 text-slate-600 hover:text-blue-400 transition-colors text-xs border border-transparent hover:border-blue-900 flex items-center gap-1"
                title="Notificar ahora">
                <BellIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
        <button onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="px-2 py-1 text-slate-600 hover:text-white transition-colors text-xs border border-transparent hover:border-[#333] flex items-center gap-1">
          <EditIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editar</span>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="px-2 py-1 text-slate-600 hover:text-red-400 transition-colors text-xs border border-transparent hover:border-red-900 flex items-center gap-1">
          <TrashIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Borrar</span>
        </button>
      </div>
    </motion.div>
  );
}
