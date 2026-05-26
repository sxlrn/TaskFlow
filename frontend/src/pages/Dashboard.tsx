import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckSquare, FolderKanban, AlertCircle, TrendingUp, ArrowRight, ChevronDown } from 'lucide-react';
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

const PROJECT_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Активний',  cls: 'bg-emerald-50 text-emerald-600' },
  on_hold:   { label: 'На паузі',  cls: 'bg-amber-50 text-amber-600' },
  completed: { label: 'Завершено', cls: 'bg-blue-50 text-blue-600' },
  archived:  { label: 'Архів',     cls: 'bg-slate-100 text-slate-500' },
};

const TYPE_CFG: Record<string, { label: string; cls: string }> = {
  standard: { label: 'Розробка', cls: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
  research: { label: 'Дослідження', cls: 'bg-purple-50 text-purple-600 border border-purple-100' },
  testing:  { label: 'Тестування', cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
  planning: { label: 'Планування', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Доброго ранку' : h < 18 ? 'Добрий день' : 'Добрий вечір';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'active' | 'on_hold' | 'completed'>('active');

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
  const activeMyTasks = myTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
  const visibleTasks = showAllTasks ? activeMyTasks : activeMyTasks.slice(0, 5);
  const recentActivity = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6);
  
  const filteredProjects = projects.filter(p => {
    if (projectStatusFilter === 'all') return true;
    return p.status === projectStatusFilter;
  });
  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 4);

  const handleTabChange = (status: 'all' | 'active' | 'on_hold' | 'completed') => {
    setProjectStatusFilter(status);
    setShowAllProjects(false);
  };

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
      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ icon: Icon, label, value, sub, bg, ic }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 flex items-center gap-2`}>
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-[14px]">Мої активні задачі</h3>
              <Link to="/tasks" className="text-indigo-500 text-[12px] font-medium flex items-center gap-1 hover:text-indigo-700">
                Всі <ArrowRight size={13} />
              </Link>
            </div>
            {activeMyTasks.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Немає активних задач 🎉</p>
            ) : (
              <div>
                <div className="space-y-2.5">
                  {visibleTasks.map(task => {
                    const p = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
                    const s = STATUS_CFG[task.status] || STATUS_CFG.todo;
                    const tType = TYPE_CFG[task.type] || TYPE_CFG.standard;
                    
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
                    const isOverspent = task.actual_hours && task.estimated_hours && task.actual_hours > task.estimated_hours;

                    return (
                      <div
                        key={task.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl transition border ${
                          isOverdue
                            ? 'border-rose-200 bg-rose-50/20 shadow-sm shadow-rose-50'
                            : 'border-slate-100 bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${tType.cls}`}>
                              {tType.label}
                            </span>
                            <p className="text-[13px] font-semibold text-slate-700 truncate">{task.title}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: task.project?.color || '#6366f1' }}
                            />
                            <p className="text-[11px] text-slate-400 truncate">{task.project?.title}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                          {/* Hours Indicator */}
                          {task.estimated_hours && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
                              isOverspent
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                              {task.actual_hours || 0}г / {task.estimated_hours}г
                            </span>
                          )}

                          {/* Status / Priority Badges */}
                          <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${p.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.dot} inline-block`} />
                          </span>
                          <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                          
                          {/* Overdue / Deadline Highlight */}
                          {task.deadline && (
                            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${
                              isOverdue
                                ? 'bg-rose-500 text-white font-bold animate-pulse'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {format(new Date(task.deadline), 'd MMM', { locale: uk })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {activeMyTasks.length > 5 && (
                  <button
                    onClick={() => setShowAllTasks(s => !s)}
                    className="w-full text-center text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 select-none"
                  >
                    {showAllTasks ? 'Згорнути' : `Показати всі активні задачі (${activeMyTasks.length})`}
                    <ChevronDown
                      size={13}
                      className={`transform transition-transform duration-300 ${
                        showAllTasks ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Project progress */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-[14px]">Прогрес проєктів</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredProjects.length} всього
              </span>
            </div>

            {/* Premium segmented control for project status tabs */}
            <div className="flex gap-1 mb-4 p-1 bg-slate-50 rounded-xl border border-slate-100/50">
              {(['active', 'all', 'on_hold', 'completed'] as const).map(status => {
                const labelMap = {
                  active: 'Активні',
                  all: 'Всі',
                  on_hold: 'Пауза',
                  completed: 'Завершені',
                };
                const isActive = projectStatusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => handleTabChange(status)}
                    className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-lg transition-all select-none ${
                      isActive
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {labelMap[status]}
                  </button>
                );
              })}
            </div>

            {visibleProjects.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Проєктів не знайдено 📁</p>
            ) : (
              <div className="space-y-4">
                {visibleProjects.map(p => {
                  const pt = tasks.filter(t => t.project_id === p.id);
                  const completedTasks = pt.filter(t => t.status === 'done').length;
                  const pct = pt.length > 0 ? Math.round((completedTasks / pt.length) * 100) : 0;
                  const sInfo = PROJECT_STATUS_CFG[p.status] || { label: 'Активний', cls: 'bg-emerald-50 text-emerald-600' };

                  return (
                    <div
                      key={p.id}
                      className="group/item p-2 -mx-2 rounded-xl hover:bg-slate-50/70 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center text-[12.5px] mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: p.color || '#6366f1' }}
                          />
                          <Link
                            to={`/projects`}
                            className="text-slate-700 font-semibold truncate hover:text-indigo-600 transition-colors"
                          >
                            {p.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className="text-slate-400 text-[10.5px] font-medium">
                            {completedTasks}/{pt.length}
                          </span>
                          <span className="font-bold text-slate-600">{pct}%</span>
                        </div>
                      </div>
                      
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: p.color || '#6366f1' }}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <span className={`w-1 h-1 rounded-full ${p.status === 'active' ? 'bg-emerald-500 animate-pulse' : p.status === 'on_hold' ? 'bg-amber-500' : p.status === 'completed' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                          {sInfo.label}
                        </span>
                        {p.deadline && (
                          <span>до {format(new Date(p.deadline), 'd MMM yyyy', { locale: uk })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredProjects.length > 4 && (
                  <button
                    onClick={() => setShowAllProjects(s => !s)}
                    className="w-full text-center text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 select-none"
                  >
                    {showAllProjects ? 'Згорнути' : `Показати всі (${filteredProjects.length})`}
                    <ChevronDown
                      size={13}
                      className={`transform transition-transform duration-300 ${
                        showAllProjects ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
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