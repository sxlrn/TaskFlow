import { useEffect, useState } from 'react';
import { Users, Briefcase, HardHat, Shield, Mail, Search, UserPlus, MoreVertical, CheckCircle, Clock, LayoutGrid } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import type { User, Role } from '../types';

interface TeamMember extends User {
  _count?: {
    active_tasks: number;
    completed_tasks: number;
    total_tasks: number;
  };
}

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admin: {
    label: 'Адмін',
    color: 'text-red-500',
    bg: 'bg-red-50',
    icon: <Shield size={12} />,
  },
  manager: {
    label: 'Менеджер',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    icon: <Briefcase size={12} />,
  },
  worker: {
    label: 'Працівник',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: <HardHat size={12} />,
  },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
  const bg = user.avatar_color ?? '#6366f1';

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

type FilterRole = 'all' | Role;

const FILTERS: { key: FilterRole; label: string }[] = [
  { key: 'all', label: 'Всі' },
  { key: 'admin', label: 'Адмін' },
  { key: 'manager', label: 'Менеджер' },
  { key: 'worker', label: 'Працівник' },
];

export default function Team() {
  const { user: me } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterRole>('all');
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await api.get<TeamMember[]>('/users');
        setMembers(data);
      } catch (err) {
        console.error('Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const counts = {
    admin: members.filter((m) => m.role === 'admin').length,
    manager: members.filter((m) => m.role === 'manager').length,
    worker: members.filter((m) => m.role === 'worker').length,
  };

  const filtered = members.filter((m) => {
    const matchRole = filter === 'all' || m.role === filter;
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Команда</h1>
        {me?.role === 'admin' && (
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <UserPlus size={16} />
            Запросити
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Shield size={20} className="text-red-400" />}
          bg="bg-red-50"
          count={counts.admin}
          label="Адмін"
        />
        <StatCard
          icon={<Briefcase size={20} className="text-blue-400" />}
          bg="bg-blue-50"
          count={counts.manager}
          label="Менеджер"
        />
        <StatCard
          icon={<HardHat size={20} className="text-green-500" />}
          bg="bg-green-50"
          count={counts.worker}
          label="Працівник"
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                filter === f.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mr-3" />
          Завантаження...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Нікого не знайдено</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isMe={member.id === me?.id}
              canManage={me?.role === 'admin' && member.id !== me?.id}
              menuOpen={menuOpen === member.id}
              onMenuToggle={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  bg,
  count,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  count: number;
  label: string;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{count}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  isMe,
  canManage,
  menuOpen,
  onMenuToggle,
}: {
  member: TeamMember;
  isMe: boolean;
  canManage: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const active = member._count?.active_tasks ?? 0;
  const completed = member._count?.completed_tasks ?? 0;
  const total = member._count?.total_tasks ?? 0;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar user={member} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{member.full_name}</span>
            <RoleBadge role={member.role} />
            {isMe && (
              <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                Це ви
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Mail size={11} />
            <span className="truncate">{member.email}</span>
          </div>
          {member.department && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
              <LayoutGrid size={11} />
              <span>{member.department}</span>
            </div>
          )}
        </div>

        {/* Task stats */}
        <div className="hidden sm:flex items-center gap-6 text-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={13} className="text-amber-400" />
            <span className="font-medium text-gray-700">{active}</span>
            <span className="text-gray-400">активних</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <CheckCircle size={13} className="text-green-400" />
            <span className="font-medium text-gray-700">{completed}</span>
            <span className="text-gray-400">завершено</span>
          </div>
          <StatBox value={total} label="Всього" />
        </div>

        {/* Menu */}
        {canManage && (
          <div className="relative">
            <button
              onClick={onMenuToggle}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-44 py-1 text-sm">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                  Змінити роль
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500">
                  Видалити з команди
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden flex gap-4 mt-3 pt-3 border-t border-gray-50">
        <StatBox value={active} label="Активних" />
        <StatBox value={completed} label="Завершено" />
        <StatBox value={total} label="Всього" />
      </div>
    </div>
  );
}