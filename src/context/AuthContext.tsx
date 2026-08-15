'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';

export const ADMIN_EMAIL = 'ay8880625@gmail.com';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  demoLogin: (asAdmin?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'foodmart_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const saveUserToState = (profile: UserProfile | null) => {
    setUser(profile);
    if (typeof window !== 'undefined') {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  };

  // Check current session from /api/auth/me on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const formatted: UserProfile = {
              userId: data.user.id,
              name: data.user.name,
              email: data.user.email,
              photoURL: data.user.photoURL || undefined,
              role: data.user.role as UserRole,
              createdAt: data.user.createdAt,
              lastLoginAt: data.user.lastLoginAt,
            };
            saveUserToState(formatted);
          } else {
            // Keep cached user if offline or fallback
          }
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
      }

      const data = await res.json();
      const profile: UserProfile = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photoURL: data.user.photoURL || undefined,
        role: data.user.role as UserRole,
        createdAt: data.user.createdAt,
        lastLoginAt: data.user.lastLoginAt,
      };

      saveUserToState(profile);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const signup = async (name: string, email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Signup failed');
      }

      const data = await res.json();
      const profile: UserProfile = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photoURL: data.user.photoURL || undefined,
        role: data.user.role as UserRole,
        createdAt: data.user.createdAt,
        lastLoginAt: data.user.lastLoginAt,
      };

      saveUserToState(profile);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      setLoading(false);
      throw err;
    }
  };

  const demoLogin = async (asAdmin: boolean = false): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asAdmin }),
      });

      if (!res.ok) {
        throw new Error('Demo login failed');
      }

      const data = await res.json();
      const profile: UserProfile = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        photoURL: data.user.photoURL || undefined,
        role: data.user.role as UserRole,
        createdAt: data.user.createdAt,
        lastLoginAt: data.user.lastLoginAt,
      };

      saveUserToState(profile);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Demo login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    saveUserToState(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        const updated: UserProfile = {
          ...user,
          ...resData.user,
        };
        saveUserToState(updated);
      }
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        signup,
        demoLogin,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
