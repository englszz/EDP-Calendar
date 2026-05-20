import React, { useState, useMemo } from 'react';
import { useFinance, DEFAULT_CATEGORIES, getCategoryInfo } from '../hooks/useFinance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FA_ICONS = [
  'fa-utensils','fa-bus','fa-graduation-cap','fa-champagne-glasses',
  'fa-bolt','fa-heart-pulse','fa-shirt','fa-house','fa-car',
  'fa-gamepad','fa-music','fa-book','fa-dog','fa-dumbbell',
  'fa-plane','fa-gift','fa-coffee','fa-phone','fa-laptop','fa-tag',
];

const COLORS = [
  '#f59e0b','#3b82f6','#8b5cf6','#ec4899','#f97316',
  '#10b981','#06b6d4','#ef4444','#84cc16','#a78bfa',
];

function CategoryModal({ onSave, onClose }) {
  const [form, setForm] = useState({ label: '', icon: 'fa-tag', color: '#6b7280' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    onSave({ ...form, value: form.label.toLowerCase().replace(/\s+/g, '-') });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Nueva categoría</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder="ej. Gym, Delivery, Mascota..."
            value={form.label} onChange={e => set('label', e.target.value)} required autoFocus />
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Ícono</label>
            <div className="grid grid-cols-8 gap-2">
              {FA_ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => set('icon', icon)}
                  className={`w-9 h-9 flex items-center justify-center transition-all border ${form.icon === icon ? 'bg-white text-black border-white' : 'border-[#2a2a2a] text-slate-400 hover:text-white hover:border-[#444]'}`}>
                  <i className={`fas ${icon} text-sm`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-7 h-7 transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransactionModal({ transaction, allCategories, onSave, onClose, onNewCategory }) {
  const [form, setForm] = useState({
    amount: transaction?.amount || '',
    category: transaction?.category || allCategories[0]?.value || '',
    description: transaction?.description || '',
    isRecurring: transaction?.isRecurring || false,
    dueDay: transaction?.dueDay || new Date().getDate().toString(),
    frequency: transaction?.frequency || 'monthly',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) return;
    onSave({
      ...form,
      amount: Number(form.amount),
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'expense',
      dueDay: form.isRecurring ? Number(form.dueDay) : null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">{transaction ? 'Editar gasto' : 'Agregar gasto'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Monto (RD$)</label>
            <input className="input text-lg font-mono" type="number" placeholder="0.00"
              value={form.amount} onChange={e => set('amount', e.target.value)} required autoFocus />
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Categoría</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {allCategories.map(c => (
                <button key={c.value} type="button" onClick={() => set('category', c.value)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs border transition-all ${form.category === c.value ? 'bg-white text-black border-white' : 'border-[#2a2a2a] text-slate-400 hover:text-white hover:border-[#444]'}`}>
                  <i className={`fas ${c.icon} text-xs`} style={{ color: form.category === c.value ? 'black' : c.color }} />
                  {c.label}
                </button>
              ))}
              <button type="button" onClick={onNewCategory}
                className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed border-[#2a2a2a] text-slate-600 hover:text-white hover:border-[#444] transition-all">
                <i className="fas fa-plus text-xs" /> Nueva
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Descripción (opcional)</label>
            <input className="input" placeholder="ej. Almuerzo, pasaje norte..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Toggle gasto fijo */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">Es un gasto fijo</p>
                <p className="text-xs text-slate-500 mt-0.5">Se agregará a tus gastos recurrentes</p>
              </div>
              <button type="button" onClick={() => set('isRecurring', !form.isRecurring)}
                className={`w-11 h-6 transition-all relative ${form.isRecurring ? 'bg-white' : 'bg-[#2a2a2a]'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-black transition-all ${form.isRecurring ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Día de pago</label>
                  <input className="input" type="number" min="1" max="31"
                    value={form.dueDay} onChange={e => set('dueDay', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Frecuencia</label>
                  <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                    <option value="monthly">Mensual</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{transaction ? 'Guardar' : 'Agregar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BudgetModal({ allCategories, getBudget, setBudget, deleteBudget, onClose }) {
  const [values, setValues] = useState(() => {
    const init = {};
    allCategories.forEach(c => { init[c.value] = getBudget(c.value) || ''; });
    return init;
  });

  const handleSave = async () => {
    for (const [cat, amt] of Object.entries(values)) {
      if (amt === '' || Number(amt) === 0) await deleteBudget(cat);
      else await setBudget(cat, amt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Presupuesto mensual</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg">×</button>
        </div>
        <p className="text-xs text-slate-500 mb-5">Pon 0 o deja vacío para eliminar el presupuesto.</p>
        <div className="space-y-3">
          {allCategories.map(c => (
            <div key={c.value} className="flex items-center gap-3">
              <i className={`fas ${c.icon} w-5 text-center flex-shrink-0`} style={{ color: c.color }} />
              <span className="text-sm text-slate-300 w-28 flex-shrink-0">{c.label}</span>
              <input className="input flex-1 text-sm font-mono" type="number" placeholder="0"
                value={values[c.value] || ''}
                onChange={e => setValues(v => ({ ...v, [c.value]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
          <button onClick={handleSave} className="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>
  );
}

function RecurringModal({ item, allCategories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    amount: item?.amount || '',
    category: item?.category || allCategories[0]?.value || '',
    dueDay: item?.dueDay || '1',
    frequency: item?.frequency || 'monthly',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: Number(form.amount), dueDay: Number(form.dueDay) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-[#111111] border border-[#2a2a2a] p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">{item ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white w-8 h-8 flex items-center justify-center text-lg">×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder="ej. Netflix, Pasaje, Universidad..."
            value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Monto (RD$)</label>
              <input className="input font-mono" type="number" placeholder="0"
                value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Día de pago</label>
              <input className="input" type="number" min="1" max="31"
                value={form.dueDay} onChange={e => set('dueDay', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Categoría</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {allCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Frecuencia</label>
              <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                <option value="monthly">Mensual</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{item ? 'Guardar' : 'Agregar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Finance() {
  const {
    monthTransactions, loading,
    addTransaction, updateTransaction, deleteTransaction,
    setBudget, getBudget, deleteBudget,
    addRecurring, updateRecurring, deleteRecurring, recurring,
    addCategory, deleteCategory, customCategories, allCategories,
    totalExpenses, getSpentByCategory,
  } = useFinance();

  const [showTransaction, setShowTransaction] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [showBudget, setShowBudget] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [editRecurring, setEditRecurring] = useState(null);
  const [showCategory, setShowCategory] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const today = new Date().getDate();

  const recurringStats = useMemo(() => {
    const pending = recurring.filter(r => r.status !== 'paid');
    const overdue = pending.filter(r => r.dueDay < today);
    const totalFixed = recurring.reduce((a, r) => a + r.amount, 0);
    return { pending, overdue, totalFixed };
  }, [recurring, today]);

  const TABS = ['overview', 'transactions', 'recurring'];
  const TAB_LABELS = { overview: 'Resumen', transactions: 'Gastos', recurring: 'Gastos fijos' };

const handleSaveTransaction = async (data) => {
  if (editTransaction) {
    await updateTransaction(editTransaction.id, data);
  } else {
    await addTransaction(data);
  }
  setEditTransaction(null);
};

  const handleSaveRecurring = (data) => {
    if (editRecurring) updateRecurring(editRecurring.id, data);
    else addRecurring(data);
    setEditRecurring(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Finanzas</h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">
            {format(new Date(), 'MMMM yyyy', { locale: es })}
          </p>
        </div>
        <button onClick={() => { setEditTransaction(null); setShowTransaction(true); }} className="btn-primary py-1.5">
          + Gasto
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gastado este mes</p>
          <p className="text-2xl font-mono font-bold text-white">RD${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Gastos fijos</p>
          <p className="text-2xl font-mono font-bold text-white">RD${recurringStats.totalFixed.toLocaleString()}</p>
        </div>
      </div>

      {recurringStats.overdue.length > 0 && (
        <div className="card p-4 mb-4 border-l-2 border-l-red-500">
          <p className="text-sm text-red-400 font-medium">
            ! {recurringStats.overdue.length} pago{recurringStats.overdue.length > 1 ? 's' : ''} vencido{recurringStats.overdue.length > 1 ? 's' : ''}:{' '}
            {recurringStats.overdue.map(r => r.name).join(', ')}
          </p>
        </div>
      )}

      <div className="flex border border-[#2a2a2a] mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Por categoría</h2>
            <button onClick={() => setShowBudget(true)} className="text-xs text-slate-500 hover:text-white transition-colors">
              Editar presupuesto
            </button>
          </div>
          {allCategories.map(cat => {
            const spent = getSpentByCategory(cat.value);
            const budget = getBudget(cat.value);
            const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const over = budget > 0 && spent > budget;
            if (spent === 0 && budget === 0) return null;
            return (
              <div key={cat.value} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${cat.icon}`} style={{ color: cat.color }} />
                    <span className="text-sm text-white">{cat.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-mono font-medium ${over ? 'text-red-400' : 'text-white'}`}>
                      RD${spent.toLocaleString()}
                    </span>
                    {budget > 0 && <span className="text-xs text-slate-600 ml-1">/ RD${budget.toLocaleString()}</span>}
                  </div>
                </div>
                {budget > 0 && (
                  <div className="h-0.5 bg-[#1e1e1e]">
                    <div className="h-full transition-all" style={{ width: `${percent}%`, background: over ? '#ef4444' : cat.color, height: '2px' }} />
                  </div>
                )}
                {over && <p className="text-xs text-red-400 mt-1">! Pasaste RD${(spent - budget).toLocaleString()}</p>}
              </div>
            );
          })}
          {monthTransactions.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-6">Agrega tu primer gasto para ver el resumen.</p>
          )}
          {customCategories.length > 0 && (
            <div className="card p-4 mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Mis categorías</p>
              <div className="space-y-2">
                {customCategories.map(c => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className={`fas ${c.icon}`} style={{ color: c.color }} />
                      <span className="text-sm text-slate-300">{c.label}</span>
                    </div>
                    <button onClick={() => deleteCategory(c.id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="animate-fade-in">
          {loading ? (
            <p className="text-slate-600 text-sm text-center py-8">Cargando...</p>
          ) : monthTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-sm">No hay gastos este mes.</p>
              <button onClick={() => setShowTransaction(true)} className="mt-3 text-slate-500 hover:text-white text-sm underline">
                Agregar el primero
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {monthTransactions.map(t => {
                const cat = getCategoryInfo(t.category, customCategories);
                return (
                  <div key={t.id} className="card p-4 flex items-center gap-3 group hover:border-[#333] transition-all">
                    <i className={`fas ${cat.icon} flex-shrink-0`} style={{ color: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium truncate">{t.description || cat.label}</p>
                        {t.isRecurring && <span className="text-xs text-slate-600 border border-[#2a2a2a] px-1.5 py-0.5">Fijo</span>}
                      </div>
                      <p className="text-xs text-slate-600">{t.date}</p>
                    </div>
                    <p className="text-sm font-mono font-bold text-white flex-shrink-0">RD${t.amount.toLocaleString()}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditTransaction(t); setShowTransaction(true); }}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-white border border-transparent hover:border-[#333] transition-all">
                        Editar
                      </button>
                      <button onClick={() => deleteTransaction(t.id)}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-red-400 border border-transparent hover:border-red-900 transition-all">
                        Borrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">Total: <span className="text-white font-mono">RD${recurringStats.totalFixed.toLocaleString()}/mes</span></p>
          </div>
          {recurring.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No hay gastos fijos todavía.</p>
          ) : (
            <div className="space-y-2">
              {recurring.map(r => {
                const cat = getCategoryInfo(r.category, customCategories);
                const isOverdue = r.status !== 'paid' && r.dueDay < today;
                const statusColor = r.status === 'paid' ? '#10b981' : isOverdue ? '#ef4444' : '#f59e0b';
                const statusLabel = r.status === 'paid' ? 'Pagado' : isOverdue ? 'Vencido' : 'Pendiente';
                return (
                  <div key={r.id} className={`card p-4 flex items-center gap-3 group hover:border-[#333] transition-all ${isOverdue ? 'border-l-2 border-l-red-500' : ''}`}>
                    <i className={`fas ${cat.icon} flex-shrink-0`} style={{ color: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">{r.name}</p>
                      <p className="text-xs text-slate-600">Día {r.dueDay} · {r.frequency === 'monthly' ? 'Mensual' : r.frequency === 'weekly' ? 'Semanal' : 'Anual'}</p>
                    </div>
                    <p className="text-sm font-mono font-bold text-white flex-shrink-0">RD${r.amount.toLocaleString()}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 border" style={{ color: statusColor, borderColor: statusColor + '40' }}>{statusLabel}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateRecurring(r.id, { status: r.status === 'paid' ? 'pending' : 'paid' })}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-white border border-transparent hover:border-[#333] transition-all">
                          {r.status === 'paid' ? 'Desmarcar' : 'Pagado'}
                        </button>
                        <button onClick={() => { setEditRecurring(r); setShowRecurring(true); }}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-white border border-transparent hover:border-[#333] transition-all">
                          Editar
                        </button>
                        <button onClick={() => deleteRecurring(r.id)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-red-400 border border-transparent hover:border-red-900 transition-all">
                          Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showTransaction && (
        <TransactionModal transaction={editTransaction} allCategories={allCategories}
          onSave={handleSaveTransaction} onClose={() => { setShowTransaction(false); setEditTransaction(null); }}
          onNewCategory={() => setShowCategory(true)} />
      )}
      {showBudget && (
        <BudgetModal allCategories={allCategories} getBudget={getBudget} setBudget={setBudget}
          deleteBudget={deleteBudget} onClose={() => setShowBudget(false)} />
      )}
      {showRecurring && (
        <RecurringModal item={editRecurring} allCategories={allCategories}
          onSave={handleSaveRecurring} onClose={() => { setShowRecurring(false); setEditRecurring(null); }} />
      )}
      {showCategory && (
        <CategoryModal onSave={addCategory} onClose={() => setShowCategory(false)} />
      )}
    </div>
  );
}