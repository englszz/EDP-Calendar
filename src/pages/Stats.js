import React, { useMemo, useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useFinance, getCategoryInfo } from '../hooks/useFinance';
import { CATEGORIES, PRIORITIES, formatCurrency, convertCurrency } from '../utils/helpers';
import { format, subDays, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-xs">
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-slate-400">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { monthTransactions, recurring, allCategories, customCategories, totalExpenses, getSpentByCategory } = useFinance();
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('tasks');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // ── Task stats ──────────────────────────────────────────────
  const completed  = tasks.filter(t => t.completed);
  const pending    = tasks.filter(t => !t.completed);
  const overdue    = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);
  const dueToday   = tasks.filter(t => !t.completed && t.dueDate === todayStr);
  const thisWeek   = tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate), { locale: es }));
  const rate       = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  const byCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      name: cat.label, value: tasks.filter(t => t.category === cat.value).length, color: cat.color,
    })).filter(c => c.value > 0), [tasks]);

  const byPriority = useMemo(() =>
    PRIORITIES.map(p => ({
      name: p.label, value: tasks.filter(t => t.priority === p.value).length, color: p.color,
    })).filter(p => p.value > 0), [tasks]);

  const last7 = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const ds = format(d, 'yyyy-MM-dd');
      return {
        day: format(d, 'EEE', { locale: es }),
        Pendientes: tasks.filter(t => t.dueDate === ds && !t.completed).length,
        Completadas: tasks.filter(t => t.dueDate === ds && t.completed).length,
      };
    }), [tasks]);

  // ── Finance stats ───────────────────────────────────────────
  const topCategory = useMemo(() => {
    let top = null;
    let max = 0;
    allCategories.forEach(cat => {
      const spent = getSpentByCategory(cat.value);
      if (spent > max) { max = spent; top = cat; }
    });
    return top;
  }, [allCategories, getSpentByCategory]);

  const spendingByCategory = useMemo(() =>
    allCategories.map(cat => ({
      name: cat.label,
      value: getSpentByCategory(cat.value),
      color: cat.color,
      icon: cat.icon,
    })).filter(c => c.value > 0), [allCategories, getSpentByCategory]);

  const totalRecurring = recurring.reduce((a, r) => a + r.amount, 0);
  const recurringPaid = recurring.filter(r => r.status === 'paid').reduce((a, r) => a + r.amount, 0);
  const recurringPending = totalRecurring - recurringPaid;

  // ── Revenue (projects) ──────────────────────────────────────
  const toDisplay = (amount, currency) => convertCurrency(amount, currency || 'USD', displayCurrency);
  const totalRevenue   = projects.reduce((a, p) => a + toDisplay(p.budget || 0, p.currency), 0);
  const earnedRevenue  = projects.filter(p => p.status === 'completed').reduce((a, p) => a + toDisplay(p.budget || 0, p.currency), 0);
  const pendingRevenue = projects.filter(p => p.status === 'active').reduce((a, p) => a + toDisplay(p.budget || 0, p.currency), 0);

  // ── Groq AI insights ────────────────────────────────────────
 const generateInsights = async () => {
  setAiLoading(true);
  setAiInsights('');

  const financialData = {
    gastosTotalesMes: totalExpenses,
    gastosPorCategoria: spendingByCategory.map(c => ({ categoria: c.name, monto: c.value })),
    gastosFijos: totalRecurring,
    gastosFijosPendientes: recurringPending,
    tareasCompletadas: completed.length,
    tareasPendientes: pending.length,
    tasaCompletacion: `${rate}%`,
    proyectosActivos: projects.filter(p => p.status === 'active').length,
  };

  try {
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente financiero y de productividad para EDP Calendar.
Analiza los datos y genera exactamente 4 insights útiles en español informal dominicano.
Cada insight en una línea separada, empieza con un emoji relevante, sé específico con números.
Sin markdown, sin asteriscos, sin guiones. Solo 4 líneas. Máximo 25 palabras por insight.`,
          },
          {
            role: 'user',
            content: `Dame 4 insights de estos datos: ${JSON.stringify(financialData)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No se pudieron generar insights.';
    setAiInsights(text);
  } catch (err) {
    setAiInsights('Error al conectar con el asistente. Intenta de nuevo.');
  }
  setAiLoading(false);
};

  const Stat = ({ label, value, sub }) => (
    <div className="card p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );

  const SECTIONS = ['tasks', 'finance'];
  const SECTION_LABELS = { tasks: 'Tareas', finance: 'Finanzas' };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Estadísticas</h1>
        <p className="text-slate-500 text-sm mt-0.5">Resumen de tu actividad</p>
      </div>

      {/* Section toggle */}
      <div className="flex border border-[#2a2a2a]">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 text-xs font-medium transition-all ${activeSection === s ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {/* ── TASKS SECTION ── */}
      {activeSection === 'tasks' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total tareas"  value={tasks.length} />
            <Stat label="Completadas"   value={completed.length} sub={`${rate}% del total`} />
            <Stat label="Para hoy"      value={dueToday.length} />
            <Stat label="Vencidas"      value={overdue.length} sub={overdue.length > 0 ? 'Requieren atención' : 'Al día'} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Pendientes"    value={pending.length} />
            <Stat label="Esta semana"   value={thisWeek.length} sub="con fecha asignada" />
            <Stat label="Proyectos"     value={projects.length} />
            <Stat label="Tasa de éxito" value={`${rate}%`} sub={rate >= 70 ? 'Buen ritmo' : rate >= 40 ? 'Puede mejorar' : 'Empuja más'} />
          </div>

          {projects.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos</h2>
                <div className="flex border border-[#2a2a2a]">
                  {['USD', 'DOP'].map(c => (
                    <button key={c} onClick={() => setDisplayCurrency(c)}
                      className={`px-3 py-1 text-xs font-mono transition-all ${displayCurrency === c ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>
                      {c === 'USD' ? 'US$' : 'RD$'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total portafolio', val: totalRevenue },
                  { label: 'Cobrado',          val: earnedRevenue },
                  { label: 'Por cobrar',       val: pendingRevenue },
                ].map(s => (
                  <div key={s.label} className="bg-[#0a0a0a] border border-[#1e1e1e] p-4">
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className="text-lg font-mono font-bold text-white">{formatCurrency(s.val, displayCurrency)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Por categoría</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                      {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {byCategory.map(c => (
                    <div key={c.name} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2 h-2 flex-shrink-0" style={{ background: c.color }} />
                      <span>{c.name}</span>
                      <span className="text-slate-600 ml-auto">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Por prioridad</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={byPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} strokeWidth={0}>
                      {byPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {byPriority.map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="w-2 h-2" style={{ background: p.color }} />
                      <span>{p.name} ({p.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tasks.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Actividad últimos 7 días</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={last7} barSize={12} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 0, fontSize: 12 }} cursor={{ fill: '#ffffff08' }} />
                  <Bar dataKey="Pendientes"  fill="#3a3a3a" />
                  <Bar dataKey="Completadas" fill="#ffffff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {projects.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Progreso de proyectos</h2>
              <div className="space-y-4">
                {projects.map(p => (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-sm text-white">{p.name}</span>
                        {p.client && <span className="text-xs text-slate-600 ml-2">{p.client}</span>}
                      </div>
                      <span className="text-xs font-mono text-slate-400">{p.progress || 0}%</span>
                    </div>
                    <div className="h-px bg-[#1e1e1e]">
                      <div className="h-full bg-white transition-all" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── FINANCE SECTION ── */}
      {activeSection === 'finance' && (
        <>
          {/* KPIs financieros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Gastado este mes" value={`RD$${totalExpenses.toLocaleString()}`} />
            <Stat label="Gastos fijos" value={`RD$${totalRecurring.toLocaleString()}`} sub="al mes" />
            <Stat label="Fijos pagados" value={`RD$${recurringPaid.toLocaleString()}`} sub={`de RD$${totalRecurring.toLocaleString()}`} />
            <Stat label="Fijos pendientes" value={`RD$${recurringPending.toLocaleString()}`} sub={recurringPending > 0 ? 'Por pagar' : 'Todo pagado'} />
          </div>

          {/* Top categoría */}
          {topCategory && (
            <div className="card p-4 flex items-center gap-4">
              <i className={`fas ${topCategory.icon} text-2xl`} style={{ color: topCategory.color }} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Mayor gasto este mes</p>
                <p className="text-white font-semibold">{topCategory.label} — <span className="font-mono">RD${getSpentByCategory(topCategory.value).toLocaleString()}</span></p>
              </div>
            </div>
          )}

          {/* Pie chart gastos */}
          {spendingByCategory.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Distribución de gastos</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={0}>
                    {spendingByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload?.length ? (
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 text-xs">
                      <p className="text-white font-medium">{payload[0].name}</p>
                      <p className="text-slate-400">RD${payload[0].value.toLocaleString()}</p>
                    </div>
                  ) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {spendingByCategory.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 flex-shrink-0" style={{ background: c.color }} />
                    <span>{c.name}</span>
                    <span className="text-slate-600 ml-auto font-mono">RD${c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gastos fijos breakdown */}
          {recurring.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Gastos fijos del mes</h2>
              <div className="space-y-2">
                {recurring.map(r => {
                  const cat = getCategoryInfo(r.category, customCategories);
                  const isPaid = r.status === 'paid';
                  return (
                    <div key={r.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${cat.icon} text-xs`} style={{ color: cat.color }} />
                        <span className={`text-sm ${isPaid ? 'text-slate-500 line-through' : 'text-white'}`}>{r.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-white">RD${r.amount.toLocaleString()}</span>
                        <span className={`text-xs ${isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isPaid ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-[#1e1e1e] flex justify-between">
                <span className="text-xs text-slate-500">Total fijos</span>
                <span className="text-sm font-mono text-white">RD${totalRecurring.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Groq AI Insights */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Insights con IA</h2>
                <p className="text-xs text-slate-600 mt-0.5">Análisis automático de tu situación financiera</p>
              </div>
              <button onClick={generateInsights} disabled={aiLoading}
                className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
                {aiLoading ? 'Analizando...' : 'Generar insights'}
              </button>
            </div>

            {aiLoading && (
              <div className="space-y-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-4 bg-[#1a1a1a] animate-pulse" style={{ width: `${70 + i * 5}%` }} />
                ))}
              </div>
            )}

            {aiInsights && !aiLoading && (
              <div className="space-y-3">
                {aiInsights.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#1e1e1e]">
                    <p className="text-sm text-slate-300 leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            )}

            {!aiInsights && !aiLoading && (
              <div className="text-center py-6">
                <p className="text-slate-600 text-sm">Dale a "Generar insights" para que la IA analice tu situación.</p>
              </div>
            )}
          </div>

          {monthTransactions.length === 0 && spendingByCategory.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <p>Agrega gastos en Finanzas para ver estadísticas.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}