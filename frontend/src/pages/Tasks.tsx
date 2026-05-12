import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal, MoreVertical, Pencil, Trash2, ArrowRight, Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Task, Project, User } from '../types';

const STATUSES = ['backlog','todo','in_progress','review','done','cancelled'] as const;
const STATUS_LABELS: Record<string, string> = { backlog:'Беклог', todo:'До виконання', in_progress:'В роботі', review:'На перевірці', done:'Готово', cancelled:'Скасовано' };
const STATUS_COLORS: Record<string, string> = { backlog:'#94a3b8', todo:'#6366f1', in_progress:'#3b82f6', review:'#f59e0b', done:'#10b981', cancelled:'#cbd5e1' };
const PRIORITY_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  low:      { label:'Низький',   cls:'bg-slate-100 text-slate-400',  dot:'bg-slate-400' },
  medium:   { label:'Середній',  cls:'bg-yellow-50 text-yellow-600', dot:'bg-yellow-400' },
  high:     { label:'Високий',   cls:'bg-orange-50 text-orange-600', dot:'bg-orange-400' },
  critical: { label:'Критичний', cls:'bg-rose-50 text-rose-600',     dot:'bg-rose-500' },
};
const NEXT_STATUS: Record<string, string> = { backlog:'todo', todo:'in_progress', in_progress:'review', review:'done' };
const NEXT_LABEL: Record<string, string>  = { backlog:'→ До виконання', todo:'→ В роботу', in_progress:'→ На перевірку', review:'→ Готово' };

function TaskCard({ task, currentUser, onEdit, onStatusChange, onDelete }: {
  task: Task; currentUser: User | null;
  onEdit: () => void; onStatusChange: (task: Task, status: string) => void; onDelete: (id: number) => void;
}) {
  const [menu, setMenu] = useState(false);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const canModify = currentUser?.role !== 'worker' || task.assignee?.id === currentUser?.id;
  const next = NEXT_STATUS[task.status];
  const p = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;

  return (
    <div className={`bg-white rounded-xl border p-3.5 group hover:shadow-sm transition-shadow cursor-pointer ${isOverdue ? 'border-rose-200' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-[12.5px] font-medium text-slate-800 leading-snug flex-1" onClick={onEdit}>{task.title}</p>
        {canModify && (
          <div className="relative flex-shrink-0">
            <button onClick={() => setMenu(m => !m)} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100">
              <MoreVertical size={13} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1 w-44 text-xs">
                  <button onClick={() => { setMenu(false); onEdit(); }} className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Pencil size={11} /> Редагувати</button>
                  {next && <button onClick={() => { setMenu(false); onStatusChange(task, next); }} className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2"><ArrowRight size={11} /> {NEXT_LABEL[task.status]}</button>}
                  <button onClick={() => { setMenu(false); onDelete(task.id); }} className="w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 flex items-center gap-2"><Trash2 size={11} /> Видалити</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {task.project?.title && <p className="text-[10.5px] text-slate-400 mt-1 truncate">{task.project.title}</p>}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${p.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot} inline-block`} />{p.label}
        </span>
        {task.deadline && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isOverdue ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}>
            <Calendar size={9} />{format(new Date(task.deadline), 'd MMM', { locale: uk })}
          </span>
        )}
        {task.estimated_hours && <span className="text-[10px] text-slate-400 flex items-center gap-0.5 ml-auto"><Clock size={9} /> {task.estimated_hours}г</span>}
      </div>
      {task.assignee && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600"
            style={{ background: task.assignee.avatar_color || '#e0e7ff' }}>
            {task.assignee.full_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10.5px] text-slate-500">{task.assignee.full_name}</span>
        </div>
      )}
    </div>
  );
}

function TaskModal({ task, projects, users, currentUser, onClose }: {
  task?: Task; projects: Project[]; users: User[]; currentUser: User | null; onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    project_id: task?.project_id?.toString() || '',
    assignee_id: task?.assignee_id?.toString() || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
    estimated_hours: task?.estimated_hours?.toString() || '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const sel = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';
  const canEditStatus = currentUser?.role !== 'worker' || task?.assignee_id === currentUser?.id;

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      task ? api.put(`/tasks/${task.id}`, data) : api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">{task ? 'Редагувати задачу' : 'Нова задача'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Назва *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={sel} placeholder="Назва задачі" /></div>
          <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Опис</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${sel} resize-none`} placeholder="Деталі..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Проєкт *</label>
              <select value={form.project_id} onChange={e => set('project_id', e.target.value)} className={sel}>
                <option value="">Оберіть проєкт</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Виконавець</label>
              <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} className={sel}>
                <option value="">Не призначено</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Статус</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={sel} disabled={!canEditStatus}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Пріоритет</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={sel}>
                <option value="low">Низький</option><option value="medium">Середній</option>
                <option value="high">Високий</option><option value="critical">Критичний</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Дедлайн</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={sel} /></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Оцінка (годин)</label>
              <input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={e => set('estimated_hours', e.target.value)} className={sel} placeholder="0" /></div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Скасувати</button>
          <button onClick={() => form.title && form.project_id && mutation.mutate(form)}
            disabled={mutation.isPending}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition">
            {mutation.isPending ? 'Збереження...' : task ? 'Зберегти' : 'Створити'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    return matchSearch &&
      (!filterProject || t.project_id === Number(filterProject)) &&
      (!filterPriority || t.priority === filterPriority);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Пошук задач..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <SlidersHorizontal size={14} /> Фільтри
        </button>
        {canCreate && (
          <button onClick={() => { setEditTask(undefined); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition ml-auto">
            <Plus size={15} /> Нова задача
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Проєкт</label>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Всі</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Пріоритет</label>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Всі</option>
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
              <option value="critical">Критичний</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex gap-3">{[...Array(5)].map((_, i) => <div key={i} className="flex-shrink-0 w-64 h-64 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUSES.filter(s => s !== 'cancelled').map(status => {
            const colTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }} />
                  <span className="text-[12px] font-semibold text-slate-600">{STATUS_LABELS[status]}</span>
                  <span className="ml-auto text-[11px] text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} currentUser={user}
                      onEdit={() => { setEditTask(task); setShowModal(true); }}
                      onStatusChange={(t, s) => statusMutation.mutate({ id: t.id, status: s })}
                      onDelete={id => deleteMutation.mutate(id)} />
                  ))}
                  {colTasks.length === 0 && <div className="text-center py-8 text-slate-300 text-[11px]">Порожньо</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <TaskModal task={editTask} projects={projects} users={users} currentUser={user}
          onClose={() => { setShowModal(false); setEditTask(undefined); }} />
      )}
    </div>
  );
}