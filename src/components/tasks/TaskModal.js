import React, { useState, useEffect } from 'react';
import { CATEGORIES, PRIORITIES } from '../../utils/helpers';

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'personal',
    priority: 'media', dueDate: '', reminderTime: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'personal',
        priority: task.priority || 'media',
        dueDate: task.dueDate || '',
        reminderTime: task.reminderTime || '',
      });
    }
  }, [task]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface-card border border-surface-border rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-semibold text-white">
            {task ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input className="input text-base" placeholder="¿Qué tienes que hacer?" value={form.title}
              onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div>
            <textarea className="input resize-none h-20" placeholder="Descripción (opcional)"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Categoría</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Prioridad</label>
              <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Fecha límite</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Recordatorio</label>
              <input className="input" type="time" value={form.reminderTime} onChange={e => set('reminderTime', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              {task ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
