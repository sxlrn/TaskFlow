import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckSquare, FolderKanban, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import type { Task, Project } from '../types';

const PRIORITY_CFG: Record<string, { cls: string; dot: string }> = {
  low:      { cls: 'bg-slate-100 text-slate-400', dot: 'bg-slate-400' },
  medium:   { cls: 'bg-yellow-50 text-yellow-600', dot: 'bg-yellow-400' },
  high:     { cls: 'bg-orange-50 text-orange-600', dot: 'bg-orange-400' },
  critical: { cls: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  backlog:     { label: 'Беклог',       cls: 'bg-slate-100 text-slate-500' },
  todo:        { label: 'До виконання', cls: 'bg-blue-50 text-blue-600' },
  in_progress: { label: 'В роботі',     cls: 'bg-indigo-50 text-indigo-600' },
  review:      { label: 'На перевірці', cls: 'bg-amber-50 text-amber-600' },
  done:        { label: 'Готово',       cls: 'bg-emerald-50 text-emerald-600' },
  cancelled:   { label: 'Скасовано',    cls: 'bg-slate-100 text-slate-400' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Доброго ранку' : h < 18 ? 'Добрий день' : 'Добрий вечір';
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const myTasks = tasks.filter(t => t.assignee?.id === user?.id);
  const overdue = myTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done');
  const inProgress = myTasks.filter(t => t.status === 'in_progress');
  const done = myTasks.filter(t => t.status === 'done');
  const active = myTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').slice(0, 5);
  const recentActivity = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6);
  const activeProjects = projects.filter(p => p.status === 'active').slice(0, 4);

  const STATS = [
    { icon: CheckSquare, label: 'Мої задачі',  value: myTasks.length,    sub: `${done.length} завершено`,  bg: 'bg-indigo-50', ic: 'text-indigo-500' },
    { icon: TrendingUp,  label: 'В роботі',     value: inProgress.length, sub: 'зараз активних',            bg: 'bg-blue-50',   ic: 'text-blue-500' },
    { icon: AlertCircle, label: 'Прострочено',  value: overdue.length,    sub: 'потребують уваги',          bg: 'bg-rose-50',   ic: 'text-rose-500' },
    { icon: FolderKanban,label: 'Проєктів',     value: projects.length,   sub: 'загалом',                   bg: 'bg-violet-50', ic: 'text-violet-500' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{greeting()}, {user?.full_name?.split(' ')[0]}! 👋</h2>
        <p className="text-slate-500 text-sm mt-1">Ось ваш огляд на сьогодні</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value, sub, bg, ic }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={ic} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-400">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* My tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-[14px]">Мої активні задачі</h3>
            <Link to="/tasks" className="text-indigo-500 text-[12px] font-medium flex items-center gap-1 hover:text-indigo-700">
              Всі <ArrowRight size={13} />
            </Link>
          </div>
          {active.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Немає активних задач 🎉</p>
          ) : (
            <div className="space-y-2">
              {active.map(task => {
                const p = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
                const s = STATUS_CFG[task.status] || STATUS_CFG.todo;
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-700 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{task.project?.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${p.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.dot} inline-block`} />
                      </span>
                      <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                      {task.deadline && (
                        <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${new Date(task.deadline) < new Date() ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-500'}`}>
                          {format(new Date(task.deadline), 'd MMM', { locale: uk })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Project progress */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 text-[14px] mb-4">Прогрес проєктів</h3>
            {activeProjects.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Немає активних проєктів</p>
            ) : (
              <div className="space-y-4">
                {activeProjects.map(p => {
                  const pt = tasks.filter(t => t.project_id === p.id);
                  const pct = pt.length > 0 ? Math.round((pt.filter(t => t.status === 'done').length / pt.length) * 100) : 0;
                  return (
                    <div key={p.id}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-slate-700 font-medium truncate flex-1">{p.title}</span>
                        <span className="text-slate-500 ml-2 flex-shrink-0">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color || '#6366f1' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 text-[14px] mb-4">Остання активність</h3>
            {recentActivity.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Немає активності</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(task => (
                  <div key={task.id} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-600 leading-snug">
                        <span className="font-medium text-slate-800">{task.assignee?.full_name || 'Невідомо'}</span>
                        {' — '}{STATUS_CFG[task.status]?.label || task.status}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true, locale: uk })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}