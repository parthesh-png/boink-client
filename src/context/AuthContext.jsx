import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('emilo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('emilo_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('emilo_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('emilo_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('emilo_token', receivedToken);
      localStorage.setItem('emilo_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('emilo_token', receivedToken);
      localStorage.setItem('emilo_user', JSON.stringify(receivedUser));
      return receivedUser;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('emilo_token');
    localStorage.removeItem('emilo_user');
  };

  const updateProfile = async ({ name, bio, profilePicture }) => {
    const res = await api.put('/users/profile', { name, bio, profilePicture });
    if (res.data.success) {
      const updatedUser = { ...user, ...res.data.user };
      setUser(updatedUser);
      localStorage.setItem('emilo_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  const updateUserLocal = (updater) => {
    setUser((prev) => {
      const nextUser = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem('emilo_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
