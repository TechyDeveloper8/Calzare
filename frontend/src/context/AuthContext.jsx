import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('calzare_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize guest session ID if not set
  useEffect(() => {
    if (!localStorage.getItem('calzare_session_id')) {
      const guestId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      localStorage.setItem('calzare_session_id', guestId);
    }
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getProfile();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('calzare_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password, phone) => {
    const res = await api.register({ name, email, password, phone });
    if (res.success && res.token) {
      localStorage.setItem('calzare_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('calzare_token');
    setToken(null);
    setUser(null);
  };

  const isStaff = user && ['superadmin', 'admin', 'product_manager', 'order_manager', 'editor', 'customer_support'].includes(user.role);
  const isAdmin = user && ['superadmin', 'admin'].includes(user.role);
  const isSuperAdmin = user && user.role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isStaff,
        isAdmin,
        isSuperAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
