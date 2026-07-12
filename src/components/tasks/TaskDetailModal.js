import React, { useEffect, useState } from 'react';
import { getCategoryInfo, getPriorityInfo, formatDate, isOverdue } from '../../utils/helpers';
import { isIOS, isPWA, supportsWebNotifications, showNotification, addTaskToCalendar, scheduleTaskReminder } from '../../utils/notifications';
import { useAuth } from '../../hooks/useAuth';

export default function TaskDetailModal({ task, onClose, onEdit, onDelete, onCreateExpense, financeCategories = [] }) {
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: financeCategories[0]?.value || 'servicios',
    description: task?.title ? `Gasto: ${task.title}` : '',
  });
  const [savingExpense, setSavingExpense] = useState(false);
  const [reminderScheduled, setReminderScheduled] = useState(false);

  useEffect(() => {
    if (!financeCategories.length) return;
    setExpenseForm(form => ({
      ...form,
      category: financeCategories.some(category => category.value === form.category)
        ? form.category
        : financeCategories[0].value,
    }));
  }, [financeCategories]);

  useEffect(() => {
    setExpenseForm(form => ({
      ...form,
      description: task?.title ? `Gasto: ${task.title}` : form.description,
    }));
  }, [task?.id, task?.title]);

  if (!task) return null;

  const cat = getCategoryInfo(task.category);
  const pri = getPriorityInfo(task.priority);
  const overdue = isOverdue(task.dueDate) && !task.completed;
  const isiOS = isIOS();
  const canNotify = supportsWebNotifications() && Notification.permission === 'granted';
  const showCalendarOption = isiOS && (!canNotify || !isPWA());
  const showNotifyOption = !isiOS || canNotify;

  const handleNotifyNow = () => {
    showNotification(
      task.title,
      task.description || `Vence: ${formatDate(task.dueDate)}`,
      { taskId: task.id }
    );
  };

  const handleScheduleReminder = async () => {
    await scheduleTaskReminder(task, 30, user?.uid);
    setReminderScheduled(true);
    showNotification(
      'Recordatorio programado',
      `Te avisaremos 30 minutos antes de "${task.title}"`,
      { taskId: task.id }
    );
  };

  const handleAddToCalendar = () => {
    addTaskToCalendar(task);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !onCreateExpense) return;
    setSavingExpense(true);
    await onCreateExpense(task, {
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    setSavingExpense(false);
    setShowExpenseForm(false);
  };

  const setExpense = (key, value) => {
    setExpenseForm(form => ({ ...form, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card border border-[#2a2a2a] p-6 animate-slide-up">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => { onEdit({ ...task, completed: !task.completed }); onClose(); }}
              className={`w-4 h-4 border flex items-center justify-center transition-all ${
              task.completed ? '' : 'border-[#444] hover:border-white'
            }`}
              style={task.completed ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
            >
              {task.completed && (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="var(--text-on-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <h2 className={`text-base font-semibold leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg flex-shrink-0">×</button>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-5 pb-5 border-b border-[#1e1e1e]">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Descripción</p>
            <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#1e1e1e]">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Categoría</p>
            <p className="text-sm font-medium" style={{ color: cat.color }}>{cat.label}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prioridad</p>
            <p className="text-sm font-medium" style={{ color: pri.color }}>{pri.label}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fecha límite</p>
            <p className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-white'}`}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
              {overdue && <span className="text-xs ml-1">(vencida)</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Estado</p>
            <p className="text-sm font-medium text-white">{task.completed ? 'Completada' : 'Pendiente'}</p>
          </div>
        </div>

        {/* Notification options (solo si no esta completada) */}
        {!task.completed && task.dueDate && (
          <div className="mb-5 pb-5 border-b border-[#1e1e1e]">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Recordatorios</p>
            <div className="flex flex-col gap-2">
              {showNotifyOption && (
                <>
                  <button
                    onClick={handleNotifyNow}
                    className="w-full px-4 py-2 text-xs bg-blue-600/20 text-blue-400 border border-blue-900 hover:bg-blue-600/30 transition-all text-left flex items-center gap-2">
                    <i className="bi bi-bell" /> Notificar ahora
                  </button>
                  <button
                    onClick={handleScheduleReminder}
                    disabled={reminderScheduled}
                    className="w-full px-4 py-2 text-xs bg-orange-600/20 text-orange-400 border border-orange-900 hover:bg-orange-600/30 transition-all text-left flex items-center gap-2 disabled:opacity-50">
                    <i className="bi bi-alarm" /> {reminderScheduled ? 'Recordatorio activo' : 'Programar recordatorio (30 min antes)'}
                  </button>
                </>
              )}
              {showCalendarOption && (
                <button
                  onClick={handleAddToCalendar}
                  className="w-full px-4 py-2 text-xs bg-green-600/20 text-green-400 border border-green-900 hover:bg-green-600/30 transition-all text-left flex items-center gap-2">
                  <i className="bi bi-calendar-plus" /> Agregar al Calendario (con recordatorio nativo)
                </button>
              )}
              {isiOS && !isPWA() && (
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Para notificaciones en iPhone, instala la app en tu pantalla de inicio desde Safari.
                </p>
              )}
            </div>
          </div>
        )}

        {onCreateExpense && (
          <div className="mb-5 pb-5 border-b border-[#1e1e1e]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Finanzas</p>
                <p className="text-sm text-slate-300">Convierte esta tarea en un gasto registrado.</p>
              </div>
              <button
                onClick={() => setShowExpenseForm(v => !v)}
                className="btn-outline text-xs py-1.5 px-3 flex-shrink-0"
              >
                Generar gasto
              </button>
            </div>

            {showExpenseForm && (
              <form onSubmit={handleExpenseSubmit} className="card p-4 mt-4 space-y-3 animate-slide-up">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Monto (RD$)</label>
                    <input
                      className="input font-mono"
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={e => setExpense('amount', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Categoria</label>
                    <select
                      className="input"
                      value={expenseForm.category}
                      onChange={e => setExpense('category', e.target.value)}
                    >
                      {financeCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <input
                  className="input"
                  value={expenseForm.description}
                  onChange={e => setExpense('description', e.target.value)}
                  placeholder="Descripcion del gasto"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-outline flex-1 text-xs">
                    Cancelar
                  </button>
                  <button type="submit" disabled={savingExpense} className="btn-primary flex-1 text-xs disabled:opacity-60">
                    {savingExpense ? 'Guardando...' : 'Guardar gasto'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => { onDelete(task.id); onClose(); }}
            className="px-4 py-2 text-xs text-red-400 border border-red-900 hover:bg-red-900/20 transition-all">
            Borrar
          </button>
          <button onClick={() => { onEdit(task); onClose(); }}
            className="btn-outline flex-1 text-center">
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
