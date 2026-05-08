import React, { useState, useEffect } from 'react';

const STATUSES = [
  { value: 'active', label: 'Activo', color: '#10b981' },
  { value: 'paused', label: 'Pausado', color: '#f59e0b' },
  { value: 'completed', label: 'Completado', color: '#6366f1' },
];

export default function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', client: '', description: '',
    budget: '', deadline: '', status: 'active', progress: 0, color: '#6366f1',
  });

  useEffect(() => {
    if (project) setForm({ ...project, budget: project.budget || '', deadline: project.deadline || '' });
  }, [project]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, budget: Number(form.budget) || 0, progress: Number(form.progress) || 0 });
    onClose();
  };

  const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#06b6d4'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-surface-card border border-surface-border rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-semibold text-white">
            {project ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input text-base" placeholder="Nombre del proyecto" value={form.name}
            onChange={e => set('name', e.target.value)} required autoFocus />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Cliente</label>
              <input className="input" placeholder="Nombre del cliente" value={form.client}
                onChange={e => set('client', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Presupuesto ($)</label>
              <input className="input" type="number" placeholder="0" value={form.budget}
                onChange={e => set('budget', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea className="input resize-none h-20" placeholder="¿De qué trata este proyecto?"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Estado</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">
              Progreso: {form.progress}%
            </label>
            <input type="range" min="0" max="100" value={form.progress}
              onChange={e => set('progress', e.target.value)}
              className="w-full accent-primary" />
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-card scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{project ? 'Guardar' : 'Crear proyecto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
