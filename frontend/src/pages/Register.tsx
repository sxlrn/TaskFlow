import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export default function Register() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        setError('');
        setLoading(true);
        try {
          await googleLogin(response.credential);
          navigate('/');
        } catch {
          setError('Google реєстрація не вдалась');
        } finally {
          setLoading(false);
        }
      },
    });

    const btn = document.getElementById('google-btn-register');
    if (btn) {
      window.google.accounts.id.renderButton(btn, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signup_with',
        locale: 'uk',
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.email || !form.password || !form.full_name) {
      setError('Заповніть всі поля');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4">
            <div className="w-6 h-6 rounded-md bg-white opacity-90" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Створити акаунт</h1>
          <p className="text-sm text-slate-400 mt-1">Приєднуйтесь до TaskFlow</p>
        </div>

        {/* Google button */}
        <div className="flex justify-center mb-5">
          <div id="google-btn-register" />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">або</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Повне ім'я</label>
            <input
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="Іван Іваненко"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Пароль</label>
            <input
              type="password"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition"
          >
            {loading ? 'Реєстрація...' : 'Зареєструватись'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Вже є акаунт?{' '}
          <a href="/login" className="text-indigo-500 hover:text-indigo-700 font-medium">
            Увійти
          </a>
        </p>
      </div>
    </div>
  );
}