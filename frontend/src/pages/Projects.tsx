import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Search, MoreVertical, Calendar, User, Trash2, Pencil, X } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Task } from '../types';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Активний',  cls: 'bg-emerald-50 text-emerald-600' },
  on_hold:   { label: 'На паузі',  cls: 'bg-amber-50 text-amber-600' },
  completed: { label: 'Завершено', cls: 'bg-blue-50 text-blue-600' },
  archived:  { label: 'Архів',     cls: 'bg-slate-100 text-slate-500' },
};

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#64748b'];

function ProjectCard({ project, tasks, canEdit, onEdit, onDelete }: {
  project: Project; tasks: Task[]; canEdit: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const done = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
  const s = STATUS_MAP[project.status] || STATUS_MAP.active;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow relative group">
      <div className="h-1 rounded-full mb-4" style={{ background: project.color || '#6366f1', width: '40%' }} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 text-[14px] leading-snug flex-1">{project.title}</h3>
        {canEdit && (
          <div className="relative">
            <button onClick={() => setMenu(m => !m)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
              <MoreVertical size={15} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1 w-36">
                  <button onClick={() => { setMenu(false); onEdit(); }} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Pencil size={13} /> Редагувати
                  </button>
                  <button onClick={() => { setMenu(false); onDelete(); }} className="w-full text-left px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2">
                    <Trash2 size={13} /> Видалити
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {project.description && <p className="text-[12px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{project.description}</p>}
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">{done}/{tasks.length} задач</span>
          <span className="font-semibold text-slate-600">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: project.color || '#6366f1' }} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
        {project.manager && <span className="text-[11px] text-slate-400 flex items-center gap-1"><User size={11} /> {project.manager.full_name}</span>}
        {project.deadline && <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto"><Calendar size={11} />{format(new Date(project.deadline), 'd MMM yyyy', { locale: uk })}</span>}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose }: { project?: Project; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    deadline: project?.deadline ? project.deadline.split('T')[0] : '',
    color: project?.color || '#6366f1',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const sel = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      project ? api.put(`/projects/${project.id}`, data) : api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">{project ? 'Редагувати проєкт' : 'Новий проєкт'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Назва *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={sel} placeholder="Назва проєкту" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Опис</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${sel} resize-none`} placeholder="Короткий опис..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Статус</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={sel}>
                <option value="active">Активний</option>
                <option value="on_hold">На паузі</option>
                <option value="completed">Завершено</option>
                <option value="archived">Архів</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Пріоритет</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={sel}>
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
                <option value="critical">Критичний</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Дедлайн</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={sel} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Колір</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Скасувати</button>
          <button
            onClick={() => form.title && mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition">
            {mutation.isPending ? 'Збереження...' : project ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/projects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const canCreate = user?.role === 'admin' || user?.role === 'manager';
  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Пошук проєктів..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        {canCreate && (
          <button onClick={() => { setEditProject(undefined); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            <Plus size={16} /> Новий проєкт
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-400 text-sm">Проєктів не знайдено</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project}
              tasks={tasks.filter(t => t.project_id === project.id)}
              canEdit={canCreate}
              onEdit={() => { setEditProject(project); setShowModal(true); }}
              onDelete={() => deleteMutation.mutate(project.id)} />
          ))}
        </div>
      )}

      {showModal && <ProjectModal project={editProject} onClose={() => { setShowModal(false); setEditProject(undefined); }} />}
    </div>
  );
}