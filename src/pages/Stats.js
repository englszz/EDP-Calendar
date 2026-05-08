import React, { useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { CATEGORIES } from '../utils/helpers';
import { format, subDays } from 'date-fns';

export default function Stats() {
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const completedTasks = tasks.filter(t => t.completed);
  const rate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Tasks by category
  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      ...cat,
      total: tasks.filter(t => t.category === cat.value).length,
      done: tasks.filter(t => t.category === cat.value && t.completed).length,
    })).filter(c => c.total > 0),
    [tasks]
  );

  // Last 7 days activity
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      return {
        date: format(d, 'EEE', { locale: undefined }),
        count: tasks.filter(t => t.dueDate === dateStr).length,
        done: tasks.filter(t => t.dueDate === dateStr && t.completed).length,
      };
    });
  }, [tasks]);

  const maxCount = Math.max(...last7.map(d => d.count), 1);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Estadísticas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tu progreso en números 📊</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tareas creadas', val: tasks.length, color: '#6366f1' },
          { label: 'Completadas', val: completedTasks.length, color: '#10b981' },
          { label: 'Tasa de éxito', val: `${rate}%`, color: rate > 70 ? '#10b981' : rate > 40 ? '#f59e0b' : '#ef4444' },
          { label: 'Proyectos', val: projects.length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-3xl font-display font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly activity */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">Actividad últimos 7 días</h2>
        <div className="flex items-end gap-2 h-24">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative" style={{ height: `${(d.count / maxCount) * 80}px`, minHeight: '4px' }}>
                <div className="w-full h-full rounded-t-md bg-primary/30" />
                {d.done > 0 && (
                  <div className="absolute bottom-0 w-full rounded-t-md bg-primary"
                    style={{ height: `${(d.done / Math.max(d.count, 1)) * 100}%` }} />
                )}
              </div>
              <span className="text-xs text-slate-500">{d.date}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary inline-block" /> Completadas</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-primary/30 inline-block" /> Total</span>
        </div>
      </div>

      {/* By category */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">Por categoría</h2>
        {byCategory.length === 0 ? (
          <p className="text-slate-500 text-sm">Crea tareas para ver estadísticas.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.value}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{cat.emoji} {cat.label}</span>
                  <span className="text-xs text-slate-500">{cat.done}/{cat.total}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${(cat.done / cat.total) * 100}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects overview */}
      {projects.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Progreso de proyectos</h2>
          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{p.name}</span>
                  <span className="text-xs font-mono text-slate-500">{p.progress || 0}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${p.progress || 0}%`, background: p.color || '#6366f1' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border flex justify-between text-sm">
            <span className="text-slate-500">Ingresos totales</span>
            <span className="text-accent-green font-mono font-medium">
              ${projects.reduce((a, p) => a + (p.budget || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
