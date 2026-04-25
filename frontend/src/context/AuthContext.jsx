import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('smartstudy_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartstudy_token'));
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    setBootstrapping(false);
  }, []);

  const persist = (u, t) => {
    if (u) localStorage.setItem('smartstudy_user', JSON.stringify(u));
    else localStorage.removeItem('smartstudy_user');
    if (t) localStorage.setItem('smartstudy_token', t);
    else localStorage.removeItem('smartstudy_token');
  };

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });
    const t = data.token || data.access_token || data.accessToken;
    const u = {
      id: data.id ?? data.user?.id,
      name: data.name ?? data.user?.name ?? email.split('@')[0],
      email: data.email ?? data.user?.email ?? email,
    };
    setUser(u);
    setToken(t);
    persist(u, t);
    return u;
  }, []);

  const register = useCallback(async ({ name, email, password, availableHoursPerDay }) => {
    const { data } = await api.post('/auth/register', {
      name, email, password, availableHoursPerDay: Number(availableHoursPerDay),
    });
    const t = data.token || data.access_token || data.accessToken;
    const u = {
      id: data.id ?? data.user?.id,
      name: data.name ?? data.user?.name ?? name,
      email: data.email ?? data.user?.email ?? email,
    };
    if (t) {
      setUser(u);
      setToken(t);
      persist(u, t);
    }
    return { user: u, token: t };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    persist(null, null);
  }, []);

  const value = { user, token, login, register, logout, bootstrapping, isAuthenticated: !!token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
