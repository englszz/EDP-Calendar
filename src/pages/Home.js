import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useFinance } from '../hooks/useFinance';
import { useStreak } from '../hooks/useStreak';
import { toast } from '../components/ui/Toast';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import CalendarModal from '../components/tasks/CalendarModal';
import { CATEGORIES, isOverdue } from '../utils/helpers';
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_FULL_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function formatSpanishDate(date) {
  const d = new Date(date);
  return `${DAYS_FULL_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}

function formatSpanishMonth(date) {
  const d = new Date(date);
  return `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];

function CalendarTaskChip({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      className={`w-full min-w-0 rounded-sm px-1.5 py-0.5 text-left text-[10px] leading-tight transition-all touch-none ${
        task.completed ? 'bg-white/5 text-slate-500 line-through' : 'text-white'
      } ${isDragging ? 'opacity-40 shadow-lg' : 'hover:bg-white/10'}`}
      title={`Arrastrar "${task.title}" a otro dia`}
    >
      <span className="block truncate">{task.title}</span>
    </button>
  );
}

function CalendarDayCell({ day, dayTasks, hasOverdue, today, onDayClick }) {
  const dateKey = format(day, 'yyyy-MM-dd');
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey,
    data: { date: dateKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-base min-h-24 p-1.5 flex flex-col gap-1 transition-all ${
        isOver ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-[#161616]'
      }`}
    >
      <button type="button" onClick={() => onDayClick(day)} className="self-center">
        <span
          className={`text-xs font-mono w-6 h-6 flex items-center justify-center ${today ? 'font-bold' : 'text-slate-400'}`}
          style={today ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)', borderRadius: '4px' } : {}}
        >
          {format(day, 'd')}
        </span>
      </button>

      <div className="space-y-1 overflow-hidden">
        {dayTasks.slice(0, 3).map(task => (
          <CalendarTaskChip key={task.id} task={task} />
        ))}
      </div>

      {dayTasks.length > 3 && (
        <button type="button" onClick={() => onDayClick(day)} className="text-[10px] text-slate-500 hover:text-white text-left">
          +{dayTasks.length - 3} mas
        </button>
      )}

      {dayTasks.length > 0 && (
        <div className="mt-auto flex gap-0.5 flex-wrap justify-center px-0.5">
          {dayTasks.slice(0, 3).map((t, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-white/30' : hasOverdue ? 'bg-red-400' : ''}`}
              style={(!t.completed && !hasOverdue) ? { backgroundColor: 'var(--accent)' } : {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarView({ tasks, onDayClick, onMoveTask }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 6 } })
  );

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startPad = (getDay(days[0]) + 6) % 7;

  const getTasksForDay = (day) =>
    tasks.filter(t => t.dueDate && t.dueDate === format(day, 'yyyy-MM-dd'));

  const handleDragEnd = ({ active, over }) => {
    const nextDate = over?.data?.current?.date;
    if (!nextDate) return;
    const task = active.data?.current?.task;
    if (!task || task.dueDate === nextDate) return;
    onMoveTask(task.id, nextDate);
  };

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm">← Ant</button>
        <span className="text-sm font-semibold text-white capitalize">
          {formatSpanishMonth(currentMonth)}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm">Sig →</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
          <div key={d} className="text-center text-xs text-slate-600 py-1 font-medium">{d}</div>
        ))}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-px bg-[#1a1a1a]">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="bg-base min-h-24" />
          ))}
          {days.map(day => {
            const dayTasks = getTasksForDay(day);
            const hasOverdue = dayTasks.some(t => !t.completed && t.dueDate < format(new Date(), 'yyyy-MM-dd'));
            const today = isToday(day);

            return (
              <CalendarDayCell
                key={day.toISOString()}
                day={day}
                dayTasks={dayTasks}
                hasOverdue={hasOverdue}
                today={today}
                onDayClick={onDayClick}
              />
            );
          })}
        </div>
      </DndContext>

      <div className="flex gap-4 mt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: 'var(--accent)' }} /> Con tareas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-400 inline-block" /> Vencidas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-white/30 inline-block" /> Completadas</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { projects } = useProjects();
  const { addTransaction, allCategories, savingGoals } = useFinance();
  const { currentStreak, updateStreak, getUnlockedAchievements, getNextAchievement } = useStreak();
  const [showModal, setShowModal]         = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [detailTask, setDetailTask]       = useState(null);
  const [calendarDay, setCalendarDay]     = useState(null);
  const [filter, setFilter]               = useState('Pendientes');
  const [catFilter, setCatFilter]         = useState('');
  const [search, setSearch]               = useState('');
  const [viewMode, setViewMode]           = useState('list');
  const [showCatFilters, setShowCatFilters] = useState(false);

  const today    = formatSpanishDate(new Date());
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

  useEffect(() => {
    if (loading || !tasks.length) return;
    const todayCompleted = tasks.some(t => t.completed && t.dueDate === todayStr);
    if (!todayCompleted) return;
    const completedCount = tasks.filter(t => t.completed).length;
    const overdueCount = tasks.filter(t => isOverdue(t.dueDate) && !t.completed).length;
    const savedTotal = (savingGoals || []).reduce((a, g) => a + Number(g.savedAmount || 0), 0);
    updateStreak({
      totalCompleted: completedCount,
      totalSaved: savedTotal,
      hasZeroOverdue: overdueCount === 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, loading, todayStr, savingGoals]);

  const prevStreakRef = React.useRef(currentStreak);
  useEffect(() => {
    if (currentStreak > prevStreakRef.current && currentStreak > 1) {
      toast.streak(currentStreak);
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  const handleSave = (data) => {
    if (editTask) {
      updateTask(editTask.id, data);
      toast.info('Tarea actualizada');
    } else {
      addTask(data);
      toast.success('Tarea creada');
    }
    setEditTask(null);
  };

  const handleToggle = (taskId, wasCompleted) => {
    toggleTask(taskId, wasCompleted);
    if (!wasCompleted) {
      const completedToday = tasks.filter(t => t.completed && t.dueDate === todayStr).length + 1;
      toast.success('Tarea completada');
      if (completedToday === 1) toast.info('Primera del dia');
    }
  };

  const handleMoveTask = (taskId, dueDate) => {
    updateTask(taskId, { dueDate });
  };

  const handleCreateExpenseFromTask = async (task, expense) => {
    const transactionRef = await addTransaction({
      amount: expense.amount,
      category: expense.category,
      description: expense.description || task.title,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      taskId: task.id,
      projectId: task.projectId || null,
      source: 'task',
    });

    await updateTask(task.id, {
      expenseId: transactionRef.id,
      expenseAmount: expense.amount,
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-slate-500 text-sm capitalize">{today}</p>
          <h1 className="text-2xl font-display font-bold text-white mt-0.5">Dashboard</h1>
        </div>
        {currentStreak > 0 && (
          <motion.div
            className="card px-3 py-2 flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <i className="bi bi-fire text-orange-400" />
            <span className="text-sm font-mono font-bold text-white">{currentStreak}</span>
            <span className="text-xs text-slate-500 hidden sm:inline">dia{currentStreak !== 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Pendientes', val: stats.total - stats.completed, icon: 'bi-list-task' },
          { label: 'Vencidas', val: stats.overdue, icon: 'bi-exclamation-triangle', danger: stats.overdue > 0 },
        ].map(s => (
          <motion.div
            key={s.label}
            className={`card p-4 ${s.danger ? 'border-l-2 border-l-red-500' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <i className={`bi ${s.icon} text-sm`} style={{ color: s.danger ? '#ef4444' : 'var(--accent)' }} />
              <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-2xl font-display font-bold text-white">{s.val}</p>
          </motion.div>
        ))}
      </div>

      {activeProjects.length > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Proyectos activos</p>
            {activeProjects.length > 3 && (
              <a href="/projects" className="text-xs text-slate-600 hover:text-white transition-colors">Ver todos</a>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {activeProjects.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
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
              className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'list' ? '' : 'text-slate-500 hover:text-white'}`}
              style={viewMode === 'list' ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' } : {}}
            >
              Lista
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'calendar' ? '' : 'text-slate-500 hover:text-white'}`}
              style={viewMode === 'calendar' ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)' } : {}}
            >
              Calendario
            </button>
          </div>
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary py-1.5">
            + Nueva tarea
          </button>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <CalendarView tasks={tasks} onDayClick={setCalendarDay} onMoveTask={handleMoveTask} />
      )}

      {viewMode === 'list' && (
        <div className="space-y-3 mb-4">
          <input className="input" placeholder="Buscar tarea..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium transition-all border rounded-md ${filter === f ? '' : 'border-[#2a2a2a] text-slate-400 hover:text-white'}`}
                style={filter === f ? { backgroundColor: 'var(--accent)', color: 'var(--text-on-accent)', borderColor: 'var(--accent)' } : {}}
              >
                {f}
              </button>
            ))}
            <button onClick={() => setShowCatFilters(!showCatFilters)}
              className={`px-2 py-1 text-xs transition-all border rounded-md flex items-center gap-1 ${showCatFilters ? 'border-[#444] text-white' : 'border-transparent text-slate-600 hover:text-white'}`}>
              <i className={`bi bi-funnel${showCatFilters ? '-fill' : ''}`} />
              {catFilter ? CATEGORIES.find(c => c.value === catFilter)?.label : 'Categorias'}
            </button>
            {catFilter && (
              <button onClick={() => setCatFilter('')}
                className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                <i className="bi bi-x" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showCatFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 flex-wrap pt-1">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setCatFilter(c.value === catFilter ? '' : c.value)}
                      className={`px-3 py-1 text-xs transition-all border rounded-md ${catFilter === c.value ? 'border-[#444] text-white' : 'border-transparent text-slate-600 hover:text-white'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {viewMode === 'list' && (
        loading ? (
          <div className="text-center py-12 text-slate-600 text-sm">Cargando...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-check-circle text-3xl text-slate-600 mb-3 block" />
            <p className="text-slate-500 text-sm">
              {filter === 'Pendientes' ? 'No hay tareas pendientes. Tiempo libre.' : 'Sin resultados.'}
            </p>
            {filter === 'Pendientes' && (
              <button onClick={() => { setEditTask(null); setShowModal(true); }}
                className="mt-3 text-slate-500 hover:text-white text-sm transition-colors underline">
                Crear tarea
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task}
                  onToggle={handleToggle}
                  onClick={setDetailTask}
                  onEdit={(t) => { setEditTask(t); setShowModal(true); }}
                  onDelete={(id) => { deleteTask(id); toast.info('Tarea eliminada'); }} />
              ))}
            </AnimatePresence>
          </div>
        )
      )}

      {getUnlockedAchievements().length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Logros</p>
            <span className="text-xs text-slate-600">{getUnlockedAchievements().length}/{8}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {getUnlockedAchievements().map(a => (
              <div key={a.id} className="card px-3 py-2 flex items-center gap-2 flex-shrink-0 min-w-0">
                <i className={`bi ${a.icon} text-sm`} style={{ color: 'var(--accent)' }} />
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">{a.label}</p>
                  <p className="text-[10px] text-slate-600 truncate">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
          {getNextAchievement() && (
            <p className="text-[10px] text-slate-600 mt-2">
              Siguiente: {getNextAchievement().label} — {getNextAchievement().description}
            </p>
          )}
        </div>
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
          onDelete={(id) => { deleteTask(id); setDetailTask(null); }}
          onCreateExpense={handleCreateExpenseFromTask}
          financeCategories={allCategories}
        />
      )}

      {showModal && (
        <TaskModal task={editTask} onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTask(null); }} />
      )}
    </div>
  );
}
