import React from 'react';
import { formatDate, isOverdue, getCategoryInfo, getPriorityInfo } from '../../utils/helpers';
import { isIOS, showNotification, addTaskToCalendar } from '../../utils/notifications';
import { CalendarIcon, BellIcon, EditIcon, TrashIcon } from '../icons/Icons';

export default function TaskCard({ task, onToggle, onClick, onEdit, onDelete }) {
  const cat = getCategoryInfo(task.category);
  const pri = getPriorityInfo(task.priority);
  const overdue = isOverdue(task.dueDate) && !task.completed;
  const isiOS = isIOS();

  const handleNotifyNow = (e) => {
    e.stopPropagation();
    const hoursUntilDue = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60);
    let urgency = '📌';
    if (hoursUntilDue < 1) urgency = '🔴';
    else if (hoursUntilDue < 24) urgency = '🟡';
    
    showNotification(
      `${urgency} ${task.title}`,
      `Vence: ${formatDate(task.dueDate)}`,
      { taskId: task.id }
    );
  };

  const handleAddToCalendar = (e) => {
    e.stopPropagation();
    addTaskToCalendar(task);
  };

  return (
    <div
      onClick={() => onClick(task)}
      className={`card p-4 flex gap-3 group transition-all hover:border-[#333] cursor-pointer ${task.completed ? 'opacity-40' : ''} ${overdue ? 'border-l-2 border-l-red-500' : ''}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id, task.completed); }}
        className={`mt-0.5 flex-shrink-0 w-4 h-4 border transition-all flex items-center justify-center ${
          task.completed ? 'bg-white border-white' : 'border-[#444] hover:border-white'
        }`}>
        {task.completed && (
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

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
        {/* Botón de calendario (iOS) o notificación (otros) */}
        {!task.completed && task.dueDate && (
          <>
            {isiOS ? (
              <button 
                onClick={handleAddToCalendar}
                className="px-2 py-1 text-slate-600 hover:text-green-400 transition-colors text-xs border border-transparent hover:border-green-900 flex items-center gap-1"
                title="Agregar al calendario">
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>
            ) : (
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
    </div>
  );
}