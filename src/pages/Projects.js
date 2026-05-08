import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import TaskModal from '../components/tasks/TaskModal';
import TaskCard from '../components/tasks/TaskCard';

const STATUS_TABS = ['all', 'active', 'paused', 'completed'];
const STATUS_LABELS = { all: 'Todos', active: 'Activos', paused: 'Pausados', completed: 'Completados' };

export default function Projects() {
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = useMemo(() =>
    projects.filter(p => statusFilter === 'all' || p.status === statusFilter),
    [projects, statusFilter]
  );

  const projectTasks = useMemo(() =>
    selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [],
    [tasks, selectedProject]
  );

  const totalRevenue = projects.filter(p => p.status === 'completed').reduce((a, p) => a + (p.budget || 0), 0);
  const pendingRevenue = projects.filter(p => p.status === 'active').reduce((a, p) => a + (p.budget || 0), 0);

  const handleSaveProject = (data) => {
    if (editProject) { updateProject(editProject.id, data); if (selectedProject?.id === editProject.id) setSelectedProject({...editProject, ...data}); }
    else addProject(data);
    setEditProject(null);
  };

  const handleEditProject = (p) => { setEditProject(p); setShowProjectModal(true); };

  const handleSaveTask = (data) => {
    if (editTask) updateTask(editTask.id, data);
    else addTask({ ...data, projectId: selectedProject.id, type: 'proyecto' });
    setEditTask(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Proyectos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modo negocios 💼</p>
        </div>
        <button onClick={() => { setEditProject(null); setShowProjectModal(true); }} className="btn-primary">
          + Nuevo proyecto
        </button>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Proyectos activos', val: projects.filter(p => p.status === 'active').length, color: '#10b981' },
          { label: 'Ingresos cobrados', val: `$${totalRevenue.toLocaleString()}`, color: '#6366f1' },
          { label: 'Ingresos pendientes', val: `$${pendingRevenue.toLocaleString()}`, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xl font-display font-bold" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === tab ? 'bg-primary text-white' : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
            }`}>
            {STATUS_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <p className="text-slate-500 col-span-3 text-center py-8">Cargando...</p>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-4xl mb-3">🚀</p>
            <p className="text-slate-400">No hay proyectos aún. ¡Crea el primero!</p>
          </div>
        ) : filteredProjects.map(p => (
          <ProjectCard key={p.id} project={p}
            onEdit={(proj) => { setSelectedProject(proj); handleEditProject(proj); }}
            onDelete={deleteProject} />
        ))}
      </div>

      {/* Project detail / tasks */}
      {selectedProject && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-white">{selectedProject.name}</h2>
              <p className="text-xs text-slate-500">{selectedProject.client}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditTask(null); setShowTaskModal(true); }} className="btn-primary text-sm py-1.5 px-3">
                + Tarea
              </button>
              <button onClick={() => setSelectedProject(null)} className="btn-ghost text-sm py-1.5 px-3">
                Cerrar
              </button>
            </div>
          </div>
          {projectTasks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No hay tareas en este proyecto.</p>
          ) : (
            <div className="space-y-2">
              {projectTasks.map(task => (
                <TaskCard key={task.id} task={task}
                  onToggle={toggleTask}
                  onEdit={(t) => { setEditTask(t); setShowTaskModal(true); }}
                  onDelete={deleteTask} />
              ))}
            </div>
          )}
        </div>
      )}

      {showProjectModal && (
        <ProjectModal project={editProject} onSave={handleSaveProject} onClose={() => { setShowProjectModal(false); setEditProject(null); }} />
      )}
      {showTaskModal && (
        <TaskModal task={editTask} onSave={handleSaveTask} onClose={() => { setShowTaskModal(false); setEditTask(null); }} />
      )}
    </div>
  );
}
