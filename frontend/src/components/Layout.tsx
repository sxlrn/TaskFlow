import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Menu, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Дашборд', icon: LayoutDashboard, path: '/' },
  { label: 'Проєкти', icon: FolderKanban, path: '/projects' },
  { label: 'Задачі', icon: CheckSquare, path: '/tasks' },
  { label: 'Команда', icon: Users, path: '/team' },
];

const roleLabel: Record<string, string> = { admin: 'Адмін', manager: 'Менеджер', worker: 'Працівник' };
const roleColor: Record<string, string> = { admin: 'bg-rose-500', manager: 'bg-violet-500', worker: 'bg-emerald-500' };

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const currentLabel = navItems.find(n => n.path === location.pathname)?.label || '';

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex font-sans overflow-x-hidden w-full">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-slate-100 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ width: '248px' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-white opacity-90" />
          </div>
          <span className="font-semibold text-slate-800 text-[15px] tracking-tight">TaskFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 transition-all cursor-pointer ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} className="text-slate-400 flex-shrink-0" />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        {user && (
          <div className="px-3 py-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ background: user.avatar_color || '#6366f1' }}
              >
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-slate-700 truncate">{user.full_name}</p>
                <span className={`inline-block text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-full ${roleColor[user.role] || 'bg-slate-400'}`}>
                  {roleLabel[user.role] || user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="Вийти">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main — ключова зміна тут */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:pl-[248px]">
        <header className="sticky top-0 z-10 bg-[#f8f9fc]/80 backdrop-blur border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">
          <button className="lg:hidden text-slate-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-[15px] font-semibold text-slate-800">{currentLabel}</h1>
          <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition">
            <Bell size={15} />
          </button>
        </header>

        <main className="flex-1 px-3 sm:px-6 py-6 page-fade">
          {children}
        </main>
      </div>
    </div>
  );
}