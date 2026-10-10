import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Stethoscope, Users, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success && res.role) {
      redirectToRole(res.role);
    } else {
      setError(res.error || t('auth.invalidCredentials'));
    }
  };

  const redirectToRole = (role: string) => {
    switch (role) {
      case 'PARENT':
        navigate('/parent');
        break;
      case 'HEALTH_WORKER':
        navigate('/worker');
        break;
      case 'DOCTOR':
        navigate('/doctor');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);

    const res = await login(demoEmail, demoPass);
    setIsLoading(false);

    if (res.success && res.role) {
      redirectToRole(res.role);
    } else {
      setError(res.error || t('auth.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Side: Brand & Quick Demo Access */}
        <div className="lg:col-span-5 bg-gradient-to-br from-pink-800 to-pink-950 text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">MaternaTrack</h1>
                <p className="text-[11px] text-pink-300">{t('app.subtitle')}</p>
              </div>
            </div>

            <p className="text-xs text-pink-200/90 leading-relaxed">
              {t('auth.subtitle')}
            </p>

            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 mb-3 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-pink-300" />
                {t('auth.demoQuickAccess')}
              </h3>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('parent.demo@materna.local', 'DemoParent@2026')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-300 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{t('auth.parentDemo')}</p>
                      <p className="text-[10px] text-pink-300 font-mono">parent.demo@materna.local</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-300 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('worker.demo@materna.local', 'DemoWorker@2026')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-300 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{t('auth.workerDemo')}</p>
                      <p className="text-[10px] text-pink-300 font-mono">worker.demo@materna.local</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-300 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('doctor.demo@materna.local', 'DemoDoctor@2026')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-pink-300 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{t('auth.doctorDemo')}</p>
                      <p className="text-[10px] text-pink-300 font-mono">doctor.demo@materna.local</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-300 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin.demo@materna.local', 'DemoAdmin@2026')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition flex items-center justify-between text-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-pink-300 shrink-0" />
                    <div>
                      <p className="font-semibold text-white">{t('auth.adminDemo')}</p>
                      <p className="text-[10px] text-pink-300 font-mono">admin.demo@materna.local</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-pink-300 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-pink-900/60 rounded-xl border border-pink-700/50 text-[11px] text-pink-200">
            {t('app.syntheticNotice')}
          </div>
        </div>

        {/* Right Side: Standard Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">{t('auth.title')}</h2>
            <p className="text-xs text-slate-500">{t('auth.subtitle')}</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. parent.demo@materna.local"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:border-pink-600 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-700 hover:bg-pink-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying...</span>
                </span>
              ) : (
                <>
                  <span>{t('auth.signInButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>{t('app.footerNotice')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
