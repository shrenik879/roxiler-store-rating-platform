import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { setAccessToken, getAccessToken } from '@/services/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!getAccessToken()) {
        setInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        if (active) setUser(me);
      } catch {
        setAccessToken(null);
      } finally {
        if (active) setInitializing(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload) => {
    const { user: u, accessToken } = await authService.login(payload);
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: u, accessToken } = await authService.register(payload);
    setAccessToken(accessToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, initializing, isAuthenticated: !!user, login, register, logout, setUser }),
    [user, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
