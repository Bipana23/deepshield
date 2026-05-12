import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'deepshield_token';
const USER_KEY  = 'deepshield_user';

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser  = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      }).then(res => {
        setUser(res.data.user);
        setToken(savedToken);
        setReady(true);
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, []);

  const login = useCallback(({ user, token }) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    setUser(user);
    setToken(token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!user && !!token;

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated,
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}