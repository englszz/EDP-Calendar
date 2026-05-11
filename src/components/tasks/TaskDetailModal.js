import React from 'react';
import { getCategoryInfo, getPriorityInfo, formatDate, isOverdue } from '../../utils/helpers';
import { isIOS, showNotification, addTaskToCalendar, scheduleTaskReminder } from '../../utils/notifications';

export default function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  if (!task) return null;

  const cat = getCategoryInfo(task.category);
  const pri = getPriorityInfo(task.priority);
  const overdue = isOverdue(task.dueDate) && !task.completed;
  const isiOS = isIOS();

  const handleNotifyNow = () => {
    showNotification(
      `📌 ${task.title}`,
      task.description || `Vence: ${formatDate(task.dueDate)}`,
      { taskId: task.id }
    );
  };

  const handleScheduleReminder = () => {
    scheduleTaskReminder(task, 30); // 30 minutos antes
    showNotification(
      '⏰ Recordatorio programado',
      `Te avisaremos 30 minutos antes de "${task.title}"`,
      { taskId: task.id }
    );
  };

  const handleAddToCalendar = () => {
    addTaskToCalendar(task);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center ${
              task.completed ? 'bg-white border-white' : 'border-[#444]'
            }`}>
              {task.completed && (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h2 className={`text-base font-semibold leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg flex-shrink-0">×</button>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-5 pb-5 border-b border-[#1e1e1e]">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Descripción</p>
            <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#1e1e1e]">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Categoría</p>
            <p className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prioridad</p>
            <p className="text-sm font-medium" style={{ color: pri.color }}>{pri.label}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fecha límite</p>
            <p className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-white'}`}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
              {overdue && <span className="text-xs ml-1">(vencida)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estado</p>
            <p className="text-sm font-medium text-white">{task.completed ? 'Completada' : 'Pendiente'}</p>
          </div>
        </div>

        {/* Notification options (solo si no está completada) */}
        {!task.completed && task.dueDate && (
          <div className="mb-5 pb-5 border-b border-[#1e1e1e]">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Recordatorios</p>
            <div className="flex flex-col gap-2">
              {isiOS ? (
                <button
                  onClick={handleAddToCalendar}
                  className="w-full px-4 py-2 text-xs bg-green-600/20 text-green-400 border border-green-900 hover:bg-green-600/30 transition-all text-left">
                  📅 Agregar al Calendario (con recordatorio nativo)
                </button>
              ) : (
                <>
                  <button
                    onClick={handleNotifyNow}
                    className="w-full px-4 py-2 text-xs bg-blue-600/20 text-blue-400 border border-blue-900 hover:bg-blue-600/30 transition-all text-left">
                    Notificar ahora
                  </button>
                  <button
                    onClick={handleScheduleReminder}
                    className="w-full px-4 py-2 text-xs bg-orange-600/20 text-orange-400 border border-orange-900 hover:bg-orange-600/30 transition-all text-left">
                    Programar recordatorio (30 min antes)
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { onDelete(task.id); onClose(); }}
            className="px-4 py-2 text-xs text-red-400 border border-red-900 hover:bg-red-900/20 transition-all">
            Borrar
          </button>
          <button onClick={() => { onEdit(task); onClose(); }}
            className="btn-outline flex-1 text-center">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}