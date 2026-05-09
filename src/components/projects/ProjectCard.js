import React from 'react';
import { formatDate, isOverdue, formatCurrency, convertCurrency } from '../../utils/helpers';

const STATUS_LABELS = { active: 'Activo', paused: 'Pausado', completed: 'Completado' };

export default function ProjectCard({ project, onEdit, onDelete }) {
  const overdue = isOverdue(project.deadline) && project.status !== 'completed';
  const currency = project.currency || 'USD';
  const altCurrency = currency === 'USD' ? 'DOP' : 'USD';
  const altAmount = convertCurrency(project.budget || 0, currency, altCurrency);

  return (
    <div className="card p-5 hover:border-[#333] transition-all group cursor-pointer" onClick={() => onEdit(project)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight">{project.name}</h3>
          {project.client && <p className="text-xs text-slate-500 mt-0.5">{project.client}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 border border-[#2a2a2a] px-2 py-0.5">
            {STATUS_LABELS[project.status]}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs p-1">
            ✕
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Progreso</span>
          <span className="text-xs font-mono text-slate-400">{project.progress || 0}%</span>
        </div>
        <div className="h-px bg-[#222] overflow-hidden">
          <div className="h-full bg-white transition-all" style={{ width: `${project.progress || 0}%` }} />
        </div>
      </div>

      {Number(project.budget) > 0 && (
          <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono font-medium text-white">
              {formatCurrency(project.budget, currency)}
            </p>
            <p className="text-xs font-mono text-slate-600">
              ≈ {formatCurrency(altAmount, altCurrency)}
            </p>
          </div>
          {project.deadline && (
            <span className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
              {overdue ? '! ' : ''}{formatDate(project.deadline)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}