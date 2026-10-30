import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.js';
import { Heart, Globe, User, LogOut, Menu, X, Shield, Activity, Calendar, Stethoscope, ChevronRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');

  const toggleLanguage = (lang: string) => {
    updateLanguage(lang);
  };

  const toggleTextSize = () => {
    const next = textSize === 'normal' ? 'large' : 'normal';
    setTextSize(next);
    document.documentElement.style.fontSize = next === 'large' ? '18px' : '16px';
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'PARENT':
        return '/parent';
      case 'HEALTH_WORKER':
        return '/worker';
      case 'DOCTOR':
        return '/doctor';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Utility Strip */}
      <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-white">{t('app.subtitle')}</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-300">{t('app.region')}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Accessibility text resize */}
            <button
              onClick={toggleTextSize}
              className="text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 font-mono"
              title="Toggle Text Size"
            >
              A {textSize === 'large' ? '(-)' : '(+)'}
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-800 rounded px-1 py-0.5 border border-slate-700">
              <Globe className="w-3.5 h-3.5 text-pink-400 ml-1" />
              <button
                onClick={() => toggleLanguage('en')}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  i18n.language === 'en' ? 'bg-pink-700 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => toggleLanguage('ta')}
                className={`px-2 py-0.5 rounded text-xs transition ${
                  i18n.language === 'ta' ? 'bg-pink-700 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* User status / Demo shortcut */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1 text-pink-300 hover:text-white font-medium"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                  <span className="bg-pink-900/80 text-pink-200 text-[10px] px-1.5 py-0.2 rounded uppercase border border-pink-700/50">
                    {user.role.replace('_', ' ')}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-slate-400 hover:text-rose-300 ml-1"
                  title={t('nav.signOut')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-pink-700 hover:bg-pink-800 text-white font-medium px-2.5 py-0.5 rounded text-xs transition flex items-center gap-1 shadow-sm"
              >
                <span>{t('nav.signIn')}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-700 shadow-sm group-hover:scale-105 transition">
            <Heart className="w-6 h-6 fill-pink-600 text-pink-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-pink-700 transition">
                Materna<span className="text-pink-700">Track</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link
            to="/"
            className={`hover:text-pink-700 transition ${location.pathname === '/' ? 'text-pink-700 font-semibold' : ''}`}
          >
            {t('nav.home')}
          </Link>
          <a href="#mission" className="hover:text-pink-700 transition">
            {t('nav.mission')}
          </a>
          <a href="#maternal-care" className="hover:text-pink-700 transition">
            {t('nav.maternalCare')}
          </a>
          <a href="#child-immunization" className="hover:text-pink-700 transition">
            {t('nav.immunization')}
          </a>
          <a href="#timeline" className="hover:text-pink-700 transition">
            {t('nav.timeline')}
          </a>
          <a href="#resources" className="hover:text-pink-700 transition">
            {t('nav.resources')}
          </a>

          {user && (
            <Link
              to={getDashboardPath()}
              className="bg-pink-700 hover:bg-pink-800 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <span>{t('nav.dashboard')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <Link
              to={getDashboardPath()}
              className="bg-pink-700 text-white text-xs px-2.5 py-1 rounded font-medium"
            >
              {t('nav.dashboard')}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.home')}
          </Link>
          <a
            href="#mission"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.mission')}
          </a>
          <a
            href="#maternal-care"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.maternalCare')}
          </a>
          <a
            href="#child-immunization"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.immunization')}
          </a>
          <a
            href="#timeline"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.timeline')}
          </a>
          <a
            href="#resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium hover:text-pink-700"
          >
            {t('nav.resources')}
          </a>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-slate-100 text-rose-700 py-2 rounded-md font-medium text-sm"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-pink-700 text-white py-2 rounded-md font-medium text-sm"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
