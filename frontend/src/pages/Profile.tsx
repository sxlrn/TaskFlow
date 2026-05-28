import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User as UserIcon, Shield, Briefcase, Mail, KeyRound, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#64748b', // Slate
];

const roleLabel: Record<string, string> = {
  admin: 'Адміністратор',
  manager: 'Менеджер проекту',
  worker: 'Спеціаліст / Виконавець',
};

const roleColor: Record<string, string> = {
  admin: 'bg-rose-50 text-rose-600 border border-rose-100',
  manager: 'bg-violet-50 text-violet-600 border border-violet-100',
  worker: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
};

export default function Profile() {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatar_color || '#4f46e5');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Профіль успішно оновлено!' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.error || 'Помилка під час оновлення профілю';
      setMessage({ type: 'error', text: errMsg });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const trimmedFullName = fullName.trim();
    const trimmedDepartment = department.trim();

    if (!trimmedFullName) {
      setMessage({ type: 'error', text: "Ім'я не може бути порожнім" });
      return;
    }

    if (password) {
      if (password.includes(' ')) {
        setMessage({ type: 'error', text: 'Пароль не може містити пробіли' });
        return;
      }
      if (password.length < 6) {
        setMessage({ type: 'error', text: 'Пароль має бути не менше 6 символів' });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Паролі не співпадають' });
        return;
      }
    }

    const payload: any = {
      full_name: trimmedFullName,
      department: trimmedDepartment,
      avatar_color: avatarColor,
    };

    if (password) {
      payload.password = password;
    }

    mutation.mutate(payload);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header/Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md transition-all duration-300"
          style={{ backgroundColor: avatarColor }}
        >
          {fullName.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <h2 className="text-xl font-bold text-slate-800">{fullName || user.email}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColor[user.role]}`}>
              <Shield size={12} /> {roleLabel[user.role]}
            </span>
            {department && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                <Briefcase size={12} /> {department}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
              <Mail size={12} /> {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-start gap-3 animate-fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}
        >
          {message.type === 'success' ? (
            <Check size={18} className="mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-[15px] flex items-center gap-2">
            <UserIcon size={17} className="text-indigo-500" /> Особисті дані
          </h3>
          <p className="text-xs text-slate-400 mt-1">Оновіть свою інформацію, яка відображається в системі.</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Повне ім'я *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Введіть ваше ім'я"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Посада / Професія</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Наприклад: Frontend розробник"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 block">Колір аватара</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((c) => {
                const isSelected = avatarColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className="w-8 h-8 rounded-full border border-slate-200/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow-sm font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 text-[15px] flex items-center gap-2">
            <KeyRound size={17} className="text-indigo-500" /> Безпека
          </h3>
          <p className="text-xs text-slate-400 mt-1">Введіть новий пароль лише якщо ви бажаєте змінити поточний.</p>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Новий пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Мінімум 6 символів"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Підтвердження пароля</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Повторіть пароль"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            {mutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </div>
  );
}
