import React from 'react';
import { formatDate, isOverdue, getCategoryInfo, getPriorityInfo } from '../../utils/helpers';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat = getCategoryInfo(task.category);
  const pri = getPriorityInfo(task.priority);
  const overdue = isOverdue(task.dueDate) && !task.completed;

  return (
    <div className={`card p-4 flex gap-3 group transition-all hover:border-primary/30 ${
      task.completed ? 'opacity-50' : ''
    } ${overdue ? 'border-red-500/40' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
          task.completed
            ? 'bg-primary border-primary'
            : 'border-slate-600 hover:border-primary'
        }`}
      >
        {task.completed && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
          <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-white leading-snug ${task.completed ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="badge text-xs px-2 py-0.5" style={{background: cat.color + '20', color: cat.color}}>
            {cat.emoji} {cat.label}
          </span>
          <span className="badge text-xs px-2 py-0.5" style={{background: pri.color + '20', color: pri.color}}>
            ● {pri.label}
          </span>
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
              {overdue ? '⚠️ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-all text-xs">
          ✏️
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all text-xs">
          🗑️
        </button>
      </div>
    </div>
  );
}
