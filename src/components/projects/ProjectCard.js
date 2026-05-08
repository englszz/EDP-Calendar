import React from 'react';
import { formatDate, isOverdue } from '../../utils/helpers';

const STATUS_LABELS = { active: 'Activo', paused: 'Pausado', completed: 'Completado' };
const STATUS_COLORS = { active: '#10b981', paused: '#f59e0b', completed: '#6366f1' };

export default function ProjectCard({ project, onEdit, onDelete }) {
  const overdue = isOverdue(project.deadline) && project.status !== 'completed';
  const statusColor = STATUS_COLORS[project.status] || '#6366f1';

  return (
    <div className="card p-5 hover:border-primary/30 transition-all group cursor-pointer" onClick={() => onEdit(project)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: (project.color || '#6366f1') + '20', border: `2px solid ${project.color || '#6366f1'}40` }}>
            <div className="w-full h-full flex items-center justify-center text-lg">💼</div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight">{project.name}</h3>
            {project.client && <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge text-xs px-2 py-0.5" style={{ background: statusColor + '20', color: statusColor }}>
            {STATUS_LABELS[project.status]}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs p-1 rounded">
            🗑️
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Progreso</span>
          <span className="text-xs font-mono text-slate-400">{project.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-surface rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${project.progress || 0}%`, background: project.color || '#6366f1' }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        {project.budget > 0 && (
          <span className="text-accent-green font-mono font-medium">${project.budget.toLocaleString()}</span>
        )}
        {project.deadline && (
          <span className={overdue ? 'text-red-400' : 'text-slate-500'}>
            {overdue ? '⚠️ ' : '📅 '}{formatDate(project.deadline)}
          </span>
        )}
      </div>
    </div>
  );
}
