import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal, MoreVertical, Pencil, Trash2, ArrowRight, Calendar, Clock, X, MessageSquare, Network } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Task, Project, User, Comment } from '../types';

const STATUSES = ['backlog','todo','research','in_progress','code_review','review','done','cancelled'] as const;
const STATUS_LABELS: Record<string, string> = { backlog:'Беклог', todo:'До виконання', research:'Дослідження', in_progress:'В роботі', code_review:'Code Review', review:'На перевірці', done:'Готово', cancelled:'Скасовано' };
const STATUS_COLORS: Record<string, string> = { backlog:'#94a3b8', todo:'#6366f1', research:'#8b5cf6', in_progress:'#3b82f6', code_review:'#f43f5e', review:'#f59e0b', done:'#10b981', cancelled:'#cbd5e1' };
const PRIORITY_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  low:      { label:'Низький',   cls:'bg-slate-100 text-slate-400',  dot:'bg-slate-400' },
  medium:   { label:'Середній',  cls:'bg-yellow-50 text-yellow-600', dot:'bg-yellow-400' },
  high:     { label:'Високий',   cls:'bg-orange-50 text-orange-600', dot:'bg-orange-400' },
  critical: { label:'Критичний', cls:'bg-rose-50 text-rose-600',     dot:'bg-rose-500' },
};

export const getNextStatus = (task: Task) => {
  if (task.status === 'backlog') return 'todo';
  if (task.status === 'todo') {
    if (task.type === 'testing' || task.type === 'planning') return 'in_progress';
    return task.type === 'research' ? 'research' : 'in_progress';
  }
  if (task.status === 'research') return 'in_progress';
  if (task.status === 'in_progress') {
    if (task.type === 'testing' || task.type === 'planning') return 'done';
    return task.type === 'standard' ? 'code_review' : 'review';
  }
  if (task.status === 'code_review') return 'review';
  if (task.status === 'review') return 'done';
  return null;
};

export const getNextLabel = (task: Task) => {
  const next = getNextStatus(task);
  if (!next) return '';
  return `→ ${STATUS_LABELS[next]}`;
};

function TaskCard({ task, currentUser, onEdit, onStatusChange, onDelete }: {
  task: Task; currentUser: User | null;
  onEdit: () => void; onStatusChange: (task: Task, status: string) => void; onDelete: (id: number) => void;
}) {
  const [menu, setMenu] = useState(false);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
  const canModify = currentUser?.role !== 'worker' || task.assignee?.id === currentUser?.id;
  const next = getNextStatus(task);
  const nextLabel = getNextLabel(task);
  const p = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;

  const hasHours = task.estimated_hours || task.actual_hours;
  const isTimeExceeded = task.actual_hours && task.estimated_hours && task.actual_hours > task.estimated_hours;

  return (
    <div onClick={onEdit} className={`bg-white rounded-xl border p-3.5 group hover:shadow-sm hover:border-indigo-200 transition-all cursor-pointer ${
      isOverdue ? 'border-rose-500 bg-rose-50/20 shadow-sm shadow-rose-100/50' : 'border-slate-100'
    }`}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-[12.5px] font-medium text-slate-800 leading-snug flex-1">{task.title}</p>
        {canModify && (
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMenu(m => !m)} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100">
              <MoreVertical size={13} />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-7 z-20 bg-white border border-slate-100 rounded-xl shadow-lg py-1 w-44 text-xs">
                  <button onClick={() => { setMenu(false); onEdit(); }} className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2"><Pencil size={11} /> Редагувати</button>
                  {next && <button onClick={() => { setMenu(false); onStatusChange(task, next); }} className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2"><ArrowRight size={11} /> {nextLabel}</button>}
                  <button onClick={() => { setMenu(false); onDelete(task.id); }} className="w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 flex items-center gap-2"><Trash2 size={11} /> Видалити</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {task.project?.title && <p className="text-[10.5px] text-slate-400 mt-1 truncate">{task.project.title}</p>}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${
          task.type === 'research' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
          task.type === 'testing' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
          task.type === 'planning' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
          'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }`}>
          {task.type === 'research' ? '🔬 Дослідницька' :
           task.type === 'testing' ? '🧪 Тестувальна' :
           task.type === 'planning' ? '📅 Планувальна' :
           '📋 Розробницька'}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${p.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot} inline-block`} />{p.label}
        </span>
        {task.deadline && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isOverdue ? 'bg-rose-100 text-rose-600 font-bold border border-rose-200' : 'bg-slate-100 text-slate-500'}`}>
            <Calendar size={9} />{format(new Date(task.deadline), 'd MMM', { locale: uk })}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto" onClick={e => e.stopPropagation()}>
          {task._count?.subtasks ? <span className="text-[10px] text-slate-400 flex items-center gap-0.5" title="Підзадачі"><Network size={10} /> {task._count.subtasks}</span> : null}
          <button onClick={onEdit} className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-0.5" title="Коментарі"><MessageSquare size={10} /> {task._count?.comments || 0}</button>
          {hasHours && (
            <span className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium border ${
              isTimeExceeded 
                ? 'bg-rose-50 text-rose-600 border-rose-200 font-bold' 
                : 'text-slate-500 bg-slate-50 border-slate-100'
            }`} title={isTimeExceeded ? 'Перевищено оцінку часу!' : 'Витрачений / Оцінений час'}>
              <Clock size={10} />
              <span>{task.actual_hours ?? 0}г / {task.estimated_hours ?? '-'}г</span>
            </span>
          )}
        </div>
      </div>
      {(task.assignee || task.reviewer || task.tester) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex items-center gap-3 flex-wrap">
          {task.assignee && (
            <div className="flex items-center gap-1" title="Виконавець">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                style={{ background: task.assignee.avatar_color || '#4f46e5' }}>
                {task.assignee.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-medium text-slate-600 max-w-[65px] truncate">{task.assignee.full_name.split(' ')[0]}</span>
            </div>
          )}
          {task.reviewer && (
            <div className="flex items-center gap-1" title="Код-ревювер">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">CR:</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                style={{ background: task.reviewer.avatar_color || '#ec4899' }}>
                {task.reviewer.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-medium text-slate-500 max-w-[65px] truncate">{task.reviewer.full_name.split(' ')[0]}</span>
            </div>
          )}
          {task.tester && (
            <div className="flex items-center gap-1" title="Тестер">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">QA:</span>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                style={{ background: task.tester.avatar_color || '#10b981' }}>
                {task.tester.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-medium text-slate-500 max-w-[65px] truncate">{task.tester.full_name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskComments({ taskId, currentUser }: { taskId: number; currentUser: User | null }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: () => api.get(`/comments?task_id=${taskId}`).then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => api.post('/comments', { task_id: taskId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // To update counts
      setNewComment('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => api.put(`/comments/${id}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // To update counts
    },
  });

  if (isLoading) return <div className="text-sm text-slate-400 mt-4">Завантаження коментарів...</div>;

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Коментарі ({comments.length})</h3>
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
        {comments.map(c => (
          <div key={c.id} className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: c.author?.avatar_color || '#94a3b8' }}>
                  {c.author?.full_name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700">{c.author?.full_name}</span>
                <span className="text-[10px] text-slate-400">{format(new Date(c.created_at), 'd MMM HH:mm', { locale: uk })}</span>
              </div>
              {(currentUser?.id === c.author_id || currentUser?.role !== 'worker') && (
                <div className="flex items-center gap-2">
                  {currentUser?.id === c.author_id && (
                    <button onClick={() => { setEditingId(c.id); setEditContent(c.content); }} className="text-slate-400 hover:text-indigo-600"><Pencil size={12} /></button>
                  )}
                  <button onClick={() => deleteMutation.mutate(c.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={12} /></button>
                </div>
              )}
            </div>
            {editingId === c.id ? (
              <div className="mt-2">
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-300 resize-none" rows={2} />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateMutation.mutate({ id: c.id, content: editContent })} className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700">Зберегти</button>
                  <button onClick={() => setEditingId(null)} className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg">Скасувати</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{c.content}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: currentUser?.avatar_color || '#94a3b8' }}>
          {currentUser?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Написати коментар..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" rows={2} />
          <div className="flex justify-end mt-2">
            <button onClick={() => newComment.trim() && addMutation.mutate(newComment)} disabled={!newComment.trim() || addMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
              {addMutation.isPending ? 'Надсилання...' : 'Коментувати'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskModal({ task, parentId, projects, users, currentUser, onClose, onAddSubtask, onOpenTask }: {
  task?: Task; parentId?: number; projects: Project[]; users: User[]; currentUser: User | null; onClose: () => void; onAddSubtask?: (parentId: number) => void; onOpenTask?: (t: Task) => void;
}) {
  const queryClient = useQueryClient();
  const { data: fullTask } = useQuery<Task>({
    queryKey: ['task', task?.id],
    queryFn: () => api.get(`/tasks/${task?.id}`).then(r => r.data),
    enabled: !!task?.id,
  });

  const currentTask = fullTask || task;

  const [form, setForm] = useState({
    title: currentTask?.title || '',
    description: currentTask?.description || '',
    project_id: currentTask?.project_id?.toString() || (parentId && projects.length ? projects[0].id.toString() : ''),
    assignee_id: currentTask?.assignee_id?.toString() || '',
    reviewer_id: currentTask?.reviewer_id?.toString() || '',
    tester_id: currentTask?.tester_id?.toString() || '',
    type: currentTask?.type || 'standard',
    status: currentTask?.status || 'todo',
    priority: currentTask?.priority || 'medium',
    deadline: currentTask?.deadline ? currentTask.deadline.split('T')[0] : '',
    estimated_hours: currentTask?.estimated_hours?.toString() || '',
    actual_hours: currentTask?.actual_hours?.toString() || '',
    parent_id: parentId || currentTask?.parent_id || '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  
  // Якщо ми відкрили існуючу задачу, а користувач worker і задача не його — він може тільки дивитися і коментувати
  const readOnly = !!currentTask && (currentUser?.role === 'worker' && currentTask.assignee_id !== currentUser?.id);
  const canEditStatus = !readOnly && (currentUser?.role !== 'worker' || currentTask?.assignee_id === currentUser?.id);
  const disabledProps = readOnly ? { disabled: true } : {};

  const sel = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 disabled:bg-slate-50';

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      currentTask ? api.put(`/tasks/${currentTask.id}`, data) : api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (currentTask) queryClient.invalidateQueries({ queryKey: ['task', currentTask.id] });
      if (parentId) queryClient.invalidateQueries({ queryKey: ['task', parentId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">
            {currentTask ? 'Деталі задачі' : (parentId ? 'Нова підзадача' : 'Нова задача')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Назва *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className={sel} placeholder="Назва задачі" {...disabledProps} /></div>
          <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Опис</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${sel} resize-none`} placeholder="Деталі..." {...disabledProps} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Проєкт *</label>
              <select value={form.project_id} onChange={e => set('project_id', e.target.value)} className={sel} {...disabledProps} disabled={readOnly || !!parentId}>
                <option value="">Оберіть проєкт</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Виконавець</label>
              <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} className={sel} {...disabledProps}>
                <option value="">Не призначено</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Код-ревювер</label>
              <select value={form.reviewer_id} onChange={e => set('reviewer_id', e.target.value)} className={sel} {...disabledProps}>
                <option value="">Не призначено</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Тестер</label>
              <select value={form.tester_id} onChange={e => set('tester_id', e.target.value)} className={sel} {...disabledProps}>
                <option value="">Не призначено</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Статус</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={sel} disabled={!canEditStatus}>
                {STATUSES.filter(s => {
                  if (form.type === 'testing' || form.type === 'planning') {
                    return ['backlog', 'todo', 'in_progress', 'done'].includes(s);
                  }
                  if (form.type === 'standard') {
                    return s !== 'research';
                  }
                  return true;
                }).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select></div>
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Тип задачі</label>
              <select value={form.type} onChange={e => {
                const newType = e.target.value as 'research' | 'standard' | 'testing' | 'planning';
                const invalidForTestingPlanning = ['research', 'code_review', 'review'].includes(form.status);
                setForm(f => ({
                  ...f,
                  type: newType,
                  status: (newType === 'standard' && f.status === 'research') ? 'todo' : 
                          ((newType === 'testing' || newType === 'planning') && invalidForTestingPlanning) ? 'todo' : f.status
                }));
              }} className={sel} {...disabledProps}>
                <option value="standard">Розробницька (Стандартна)</option>
                <option value="research">Дослідницька</option>
                <option value="testing">Тестувальна</option>
                <option value="planning">Планувальна</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Пріоритет</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={sel} {...disabledProps}>
                <option value="low">Низький</option><option value="medium">Середній</option>
                <option value="high">Високий</option><option value="critical">Критичний</option>
              </select></div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Оцінка (г)</label>
                <input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={e => set('estimated_hours', e.target.value)} className={sel} placeholder="0" {...disabledProps} />
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Фактично (г)</label>
                <input type="number" min="0" step="0.5" value={form.actual_hours} onChange={e => set('actual_hours', e.target.value)} className={sel} placeholder="0" {...disabledProps} />
              </div>
            </div>
          </div>
          <div><label className="text-xs font-medium text-slate-500 mb-1.5 block">Дедлайн</label>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={sel} {...disabledProps} /></div>
        </div>

        {mutation.isError && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium border border-rose-100">
            Помилка: {(mutation.error as any)?.response?.data?.error || 'Не вдалося зберегти задачу'}
          </div>
        )}
        
        {!readOnly && (
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Скасувати</button>
            <button onClick={() => form.title && form.project_id && mutation.mutate(form)}
              disabled={mutation.isPending || readOnly}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition">
              {mutation.isPending ? 'Збереження...' : currentTask ? 'Зберегти' : 'Створити'}
            </button>
          </div>
        )}

        {currentTask && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Підзадачі ({currentTask._count?.subtasks || currentTask.subtasks?.length || 0})</h3>
              {currentUser?.role !== 'worker' && onAddSubtask && (
                <button onClick={() => { onClose(); onAddSubtask(currentTask.id); }} className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
                  <Plus size={12} /> Додати
                </button>
              )}
            </div>
            {(currentTask.subtasks?.length ?? 0) > 0 && (
              <div className="space-y-2 mb-4">
                {currentTask.subtasks?.map(st => (
                  <div key={st.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onOpenTask?.(st)}>
                    <Network size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 flex-1">{st.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">{STATUS_LABELS[st.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTask && <TaskComments taskId={currentTask.id} currentUser={currentUser} />}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>();
  const [parentIdForNewTask, setParentIdForNewTask] = useState<number | undefined>();
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'standard' | 'research' | 'testing' | 'planning'>('all');
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

  // Фільтруємо задачі: не показуємо підзадачі на головній дошці
  const mainTasks = tasks.filter(t => !t.parent_id);
  
  const filtered = mainTasks.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || t.type === activeTab;
    const matchTypeFilter = !filterType || t.type === filterType;
    return matchSearch && matchTab && matchTypeFilter &&
      (!filterProject || t.project_id === Number(filterProject)) &&
      (!filterPriority || t.priority === filterPriority);
  });

  return (
    <div className="w-full flex flex-col h-auto md:h-[calc(100vh-115px)] overflow-y-auto md:overflow-hidden space-y-4 pr-1">
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
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
          <button onClick={() => { setEditTask(undefined); setParentIdForNewTask(undefined); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition ml-auto">
            <Plus size={15} /> Нова задача
          </button>
        )}
      </div>

      {/* Перемикач типу задач (Вкладки) */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 rounded-xl max-w-2xl flex-shrink-0 overflow-x-auto scrollbar-none">
        {(['all', 'standard', 'research', 'testing', 'planning'] as const).map((t) => {
          const isActive = activeTab === t;
          const label = t === 'all' ? 'Всі задачі' : 
                        t === 'standard' ? 'Розробницькі' : 
                        t === 'research' ? 'Дослідження' :
                        t === 'testing' ? 'Тестувальні' : 'Планувальні';
          const count = t === 'all' 
            ? mainTasks.length 
            : mainTasks.filter(task => task.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-1.5 px-4 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-3 gap-3 flex-shrink-0">
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
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Тип задачі</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Всі</option>
              <option value="standard">Розробницькі</option>
              <option value="research">Дослідницькі</option>
              <option value="testing">Тестувальні</option>
              <option value="planning">Планувальні</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex gap-3 flex-shrink-0">{[...Array(5)].map((_, i) => <div key={i} className="flex-shrink-0 w-64 h-64 bg-slate-200 rounded-2xl animate-pulse" />)}</div>
       ) : (
        <>
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-300 text-sm">Задач не знайдено</div>
            ) : (
              filtered.map(task => (
                <TaskCard key={task.id} task={task} currentUser={user}
                  onEdit={() => { setEditTask(task); setParentIdForNewTask(undefined); setShowModal(true); }}
                  onStatusChange={(t, s) => statusMutation.mutate({ id: t.id, status: s })}
                  onDelete={id => deleteMutation.mutate(id)} />
              ))
            )}
          </div>
          <div className="hidden md:flex gap-4 overflow-x-auto pb-4 items-start flex-1 min-h-0 scrollbar-none">
          {STATUSES.filter(s => {
            if (s === 'cancelled') return false;
            if (activeTab === 'testing' || activeTab === 'planning') {
              return ['backlog', 'todo', 'in_progress', 'done'].includes(s);
            }
            if (activeTab === 'standard' && s === 'research') return false;
            return true;
          }).map(status => {
            const colTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-[270px] flex flex-col bg-slate-50 p-3 rounded-2xl border border-slate-100/80 max-h-full">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }} />
                  <span className="text-[12px] font-semibold text-slate-700">{STATUS_LABELS[status]}</span>
                  <span className="ml-auto text-[11px] font-medium text-slate-500 bg-white shadow-sm border border-slate-100 rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto pr-1 pb-4 no-scrollbar">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} currentUser={user}
                      onEdit={() => { setEditTask(task); setParentIdForNewTask(undefined); setShowModal(true); }}
                      onStatusChange={(t, s) => statusMutation.mutate({ id: t.id, status: s })}
                      onDelete={id => deleteMutation.mutate(id)} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-[11px] border-2 border-dashed border-slate-200/60 rounded-xl bg-slate-50/50">
                      Немає задач
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {showModal && (
        <TaskModal 
          key={`modal-${editTask?.id || 'new'}-${parentIdForNewTask || 'root'}`}
          task={editTask} parentId={parentIdForNewTask} projects={projects} users={users} currentUser={user}
          onClose={() => { setShowModal(false); setEditTask(undefined); setParentIdForNewTask(undefined); }}
          onAddSubtask={(pId) => { setEditTask(undefined); setParentIdForNewTask(pId); setShowModal(true); }}
          onOpenTask={(t) => { setParentIdForNewTask(undefined); setEditTask(t); }} 
        />
      )}
    </div>
  );
}