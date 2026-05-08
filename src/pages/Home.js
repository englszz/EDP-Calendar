import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { CATEGORIES, isOverdue } from '../utils/helpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];

export default function Home() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { projects } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('Pendientes');
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');

  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filter === 'Hoy' && t.dueDate !== todayStr) return false;
      if (filter === 'Pendientes' && t.completed) return false;
      if (filter === 'Completadas' && !t.completed) return false;
      if (catFilter && t.category !== catFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filter, catFilter, search, todayStr]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => isOverdue(t.dueDate) && !t.completed).length,
    today: tasks.filter(t => t.dueDate === todayStr && !t.completed).length,
  }), [tasks, todayStr]);

  const activeProjects = projects.filter(p => p.status === 'active');

  const handleSave = (data) => {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <p className="text-slate-500 text-sm capitalize">{today}</p>
        <h1 className="text-2xl font-display font-bold text-white mt-0.5">Dashboard Personal</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total tareas', val: stats.total, color: '#6366f1', emoji: '📋' },
          { label: 'Completadas', val: stats.completed, color: '#10b981', emoji: '✅' },
          { label: 'Para hoy', val: stats.today, color: '#f59e0b', emoji: '📅' },
          { label: 'Vencidas', val: stats.overdue, color: '#ef4444', emoji: '⚠️' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{s.label}</span>
              <span className="text-base">{s.emoji}</span>
            </div>
            <p className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Active projects summary */}
      {activeProjects.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Proyectos activos</p>
          <div className="flex flex-wrap gap-3">
            {activeProjects.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color || '#6366f1' }} />
                <span className="text-sm text-slate-300">{p.name}</span>
                <span className="text-xs text-slate-500 font-mono">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-white">Tareas</h2>
        <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary text-sm py-2">
          + Nueva tarea
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3 mb-4">
        <input className="input" placeholder="🔍 Buscar tarea..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${!catFilter ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>
            Todas
          </button>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCatFilter(c.value === catFilter ? '' : c.value)}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${catFilter === c.value ? 'text-white' : 'text-slate-500 hover:text-white'}`}
              style={catFilter === c.value ? { background: c.color + '30', color: c.color } : {}}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-400 font-medium">
            {filter === 'Pendientes' ? '¡Todo al día! No tienes tareas pendientes.' : 'No hay tareas aquí.'}
          </p>
          <button onClick={() => { setEditTask(null); setShowModal(true); }}
            className="mt-4 text-primary text-sm hover:underline">
            + Crear una nueva tarea
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task}
              onToggle={toggleTask}
              onEdit={(t) => { setEditTask(t); setShowModal(true); }}
              onDelete={deleteTask} />
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTask(null); }} />
      )}
    </div>
  );
}
