import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';
import i18n from '../i18n/index.js';

export interface User {
  id: string;
  email: string;
  role: 'PARENT' | 'HEALTH_WORKER' | 'DOCTOR' | 'ADMIN';
  fullName: string;
  phone?: string;
  preferredLanguage?: string;
  parentProfile?: any;
  healthWorkerProfile?: any;
  clinicianProfile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch<User>('/auth/me');
        if (res.success && res.data) {
          setUser(res.data);
          if (res.data.preferredLanguage && ['en', 'ta'].includes(res.data.preferredLanguage)) {
            i18n.changeLanguage(res.data.preferredLanguage);
            localStorage.setItem('maternatrack_lang', res.data.preferredLanguage);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password = 'password') => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      localStorage.setItem('maternatrack_token', res.data.token);
      if (res.data.user.preferredLanguage) {
        i18n.changeLanguage(res.data.user.preferredLanguage);
        localStorage.setItem('maternatrack_lang', res.data.user.preferredLanguage);
      }
      return { success: true, role: res.data.user.role };
    }
    return { success: false, error: res.error || 'Login failed.' };
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('maternatrack_token');
    setUser(null);
  };

  const updateLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('maternatrack_lang', lang);
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      try {
        await apiFetch('/auth/language', {
          method: 'PATCH',
          body: JSON.stringify({ language: lang }),
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
