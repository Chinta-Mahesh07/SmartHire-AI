import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, notificationsAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem('access_token')) return;
    try {
      const res = await notificationsAPI.getNotifications();
      const results = res.data.results || res.data;
      setNotifications(results);
      setUnreadCount(res.data.unread_count || results.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile().finally(() => setLoading(false));
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile, fetchNotifications]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { user: userData, tokens } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    fetchNotifications();
    showToast(`Welcome back, ${userData.first_name || userData.username}!`, 'success');
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { user: userData, tokens } = res.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    fetchNotifications();
    showToast('Registration successful! Welcome to SmartHire AI.', 'success');
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    showToast('Logged out successfully.', 'info');
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile: fetchUserProfile,
    notifications,
    unreadCount,
    fetchNotifications,
    markAllRead,
    markSingleRead,
    isAdmin: user?.role === 'ADMIN',
    isRecruiter: user?.role === 'RECRUITER',
    isCandidate: user?.role === 'CANDIDATE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
