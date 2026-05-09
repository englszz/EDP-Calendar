import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import CalendarModal from '../components/tasks/CalendarModal';
import { CATEGORIES, isOverdue } from '../utils/helpers';
import { format, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];

function CalendarView({ tasks, onDayClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = (getDay(days[0]) + 6) % 7;

  const getTasksForDay = (day) =>
    tasks.filter(t => t.dueDate && t.dueDate === format(day, 'yyyy-MM-dd'));

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm">← Ant</button>
        <span className="text-sm font-semibold text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm">Sig →</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
          <div key={d} className="text-center text-xs text-slate-600 py-1 font-medium">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#1a1a1a]">
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-[#0a0a0a] h-14" />
        ))}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const hasOverdue = dayTasks.some(t => !t.completed && t.dueDate < format(new Date(), 'yyyy-MM-dd'));
          const today = isToday(day);

          return (
            <button key={day.toISOString()} onClick={() => onDayClick(day)}
              className="bg-[#0a0a0a] h-14 flex flex-col items-center pt-1.5 gap-1 transition-all hover:bg-[#161616]">
              <span className={`text-xs font-mono w-6 h-6 flex items-center justify-center ${today ? 'bg-white text-black font-bold' : 'text-slate-400'}`}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center px-0.5">
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <span key={i} className={`w-1.5 h-1.5 ${t.completed ? 'bg-white/30' : hasOverdue ? 'bg-red-400' : 'bg-white'}`} />
                  ))}
                  {dayTasks.length > 3 && <span className="text-[9px] text-slate-600">+{dayTasks.length - 3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 mt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white inline-block" /> Con tareas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-400 inline-block" /> Vencidas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white/30 inline-block" /> Completadas</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { projects } = useProjects();
  const [showModal, setShowModal]         = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [detailTask, setDetailTask]       = useState(null);
  const [calendarDay, setCalendarDay]     = useState(null);
  const [filter, setFilter]               = useState('Pendientes');
  const [catFilter, setCatFilter]         = useState('');
  const [search, setSearch]               = useState('');
  const [viewMode, setViewMode]           = useState('list');

  const today    = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const filteredTasks = useMemo(() =>
    tasks.filter(t => {
      if (filter === 'Hoy'         && t.dueDate !== todayStr) return false;
      if (filter === 'Pendientes'  && t.completed)            return false;
      if (filter === 'Completadas' && !t.completed)           return false;
      if (catFilter && t.category !== catFilter)              return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [tasks, filter, catFilter, search, todayStr]
  );

  const stats = useMemo(() => ({
    total:     tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue:   tasks.filter(t => isOverdue(t.dueDate) && !t.completed).length,
    today:     tasks.filter(t => t.dueDate === todayStr && !t.completed).length,
  }), [tasks, todayStr]);

  const activeProjects = projects.filter(p => p.status === 'active');

  const handleSave = (data) => {
    if (editTask) updateTask(editTask.id, data);
    else addTask(data);
    setEditTask(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <p className="text-slate-500 text-sm capitalize">{today}</p>
        <h1 className="text-2xl font-display font-bold text-white mt-0.5">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',       val: stats.total },
          { label: 'Completadas', val: stats.completed },
          { label: 'Para hoy',   val: stats.today },
          { label: 'Vencidas',   val: stats.overdue },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-white">{s.val}</p>
          </div>
        ))}
      </div>

      {activeProjects.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Proyectos activos</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {activeProjects.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white" />
                <span className="text-sm text-slate-300">{p.name}</span>
                <span className="text-xs text-slate-600 font-mono">{p.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-base font-display font-semibold text-white">Tareas</h2>
        <div className="flex items-center gap-2">
          <div className="flex border border-[#2a2a2a]">
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
              Lista
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
              Calendario
            </button>
          </div>
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary py-1.5">
            + Nueva tarea
          </button>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <CalendarView tasks={tasks} onDayClick={setCalendarDay} />
      )}

      {viewMode === 'list' && (
        <div className="space-y-3 mb-4">
          <input className="input" placeholder="Buscar tarea..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium transition-all border ${filter === f ? 'bg-white text-black border-white' : 'border-[#2a2a2a] text-slate-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCatFilter('')}
              className={`px-3 py-1 text-xs transition-all border ${!catFilter ? 'border-[#444] text-white' : 'border-transparent text-slate-600 hover:text-white'}`}>
              Todas
            </button>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCatFilter(c.value === catFilter ? '' : c.value)}
                className={`px-3 py-1 text-xs transition-all border ${catFilter === c.value ? 'border-[#444] text-white' : 'border-transparent text-slate-600 hover:text-white'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        loading ? (
          <div className="text-center py-12 text-slate-600 text-sm">Cargando...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-sm">
              {filter === 'Pendientes' ? 'No hay tareas pendientes.' : 'Sin resultados.'}
            </p>
            <button onClick={() => { setEditTask(null); setShowModal(true); }}
              className="mt-3 text-slate-500 hover:text-white text-sm transition-colors underline">
              Crear tarea
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task}
                onToggle={toggleTask}
                onClick={setDetailTask}
                onEdit={(t) => { setEditTask(t); setShowModal(true); }}
                onDelete={deleteTask} />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {calendarDay && (
        <CalendarModal
          day={calendarDay}
          tasks={tasks}
          onClose={() => setCalendarDay(null)}
          onSelectTask={setDetailTask} />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={(t) => { setEditTask(t); setShowModal(true); }}
          onDelete={(id) => { deleteTask(id); setDetailTask(null); }} />
      )}

      {showModal && (
        <TaskModal task={editTask} onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTask(null); }} />
      )}
    </div>
  );
}