import React from 'react';
import { format } from 'date-fns';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_FULL_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function formatSpanishDate(date) {
  const d = new Date(date);
  return `${DAYS_FULL_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

function getCategoryInfo(category) {
  const categories = {
    comida: { label: 'Comida', color: '#f59e0b' },
    transporte: { label: 'Transporte', color: '#3b82f6' },
    universidad: { label: 'Universidad', color: '#8b5cf6' },
    salidas: { label: 'Salidas', color: '#ec4899' },
    servicios: { label: 'Servicios', color: '#f97316' },
    salud: { label: 'Salud', color: '#10b981' },
    ropa: { label: 'Ropa', color: '#06b6d4' },
  };
  return categories[category] || { label: category || 'Otros', color: '#6b7280' };
}

function getPriorityInfo(priority) {
  const priorities = {
    alta:  { label: 'Alta',  color: '#ef4444' },
    media: { label: 'Media', color: '#f59e0b' },
    baja:  { label: 'Baja',  color: '#22c55e' },
  };
  return priorities[priority] || priorities.media;
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().setHours(0,0,0,0));
}

export default function CalendarModal({ day, tasks, onClose, onSelectTask }) {
  if (!day) return null;

  const dayTasks = tasks.filter(t => t.dueDate === format(day, 'yyyy-MM-dd'));
  const label = formatSpanishDate(day);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card border border-[#2a2a2a] animate-slide-up max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e1e1e]">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Tareas del día</p>
            <h2 className="text-base font-semibold text-white capitalize">{label}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg">×</button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-5">
          {dayTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 text-sm">No hay tareas este día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dayTasks.map(task => {
                const cat = getCategoryInfo(task.category);
                const pri = getPriorityInfo(task.priority);
                const overdue = isOverdue(task.dueDate) && !task.completed;

                return (
                  <button 
                    key={task.id} 
                    onClick={() => { onSelectTask(task); onClose(); }}
                    className={`w-full text-left card p-4 hover:border-[#333] transition-all ${task.completed ? 'opacity-40' : ''} ${overdue ? 'border-l-2 border-l-red-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center ${task.completed ? '' : 'border-[#444]'}`}
                           style={task.completed ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                        {task.completed && (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="var(--text-on-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-white ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs" style={{ color: cat.color + 'cc' }}>{cat.label}</span>
                          <span className="text-xs" style={{ color: pri.color + 'cc' }}>{pri.label}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e1e1e]">
          <p className="text-xs text-slate-600 text-center">
            {dayTasks.filter(t => t.completed).length} de {dayTasks.length} completadas
          </p>
        </div>
      </div>
    </div>
  );
}