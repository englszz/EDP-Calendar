import React, { useState, useEffect } from 'react';

const STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Completado' },
];

const currencySymbol = {
  USD: '$',
  DOP: 'RD$',
};

export default function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '',
    client: '',
    description: '',
    budget: '',
    currency: 'USD',
    deadline: '',
    status: 'active',
    progress: 0,
  });

  useEffect(() => {
    if (project) {
      setForm(f => ({
        ...f,
        ...project,
        budget: project.budget ?? '',
        deadline: project.deadline ?? '',
        currency: project.currency ?? 'USD',
        progress: project.progress ?? 0,
        status: project.status ?? 'active',
      }));
    }
  }, [project]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      budget: parseFloat(form.budget) || 0,
      progress: Number(form.progress) || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-display font-semibold text-white">
            {project ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
              Nombre del proyecto
            </label>

            <input
              className="input"
              placeholder="ej. Rediseño web AJ Dent"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* CLIENT + STATUS */}
          <div className="grid grid-cols-2 gap-3">
            
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
                Cliente
              </label>

              <input
                className="input"
                placeholder="Nombre del cliente"
                value={form.client}
                onChange={e => set('client', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
                Estado
              </label>

              <select
                className="input"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BUDGET */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
              Presupuesto
            </label>

            <div className="flex items-center border border-[#2a2a2a] rounded-lg overflow-hidden">

              <span className="px-3 text-slate-400 text-sm">
                {currencySymbol[form.currency]}
              </span>

              <input
                className="input flex-1 border-0"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={form.budget}
                onChange={e => set('budget', e.target.value)}
              />

              <select
                className="input w-24 border-l border-[#2a2a2a] text-slate-300 font-mono"
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="DOP">DOP</option>
              </select>

            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
              Descripción
            </label>

            <textarea
              className="input resize-none h-20"
              placeholder="¿De qué trata este proyecto?"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* DEADLINE */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
              Deadline
            </label>

            <input
              className="input"
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
            />
          </div>

          {/* PROGRESS */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">
              Progreso — <span className="font-mono text-white">{form.progress}%</span>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={form.progress}
              onChange={e => set('progress', Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancelar
            </button>

            <button type="submit" className="btn-primary flex-1">
              {project ? 'Guardar' : 'Crear proyecto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}