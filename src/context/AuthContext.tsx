"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'moderator' | 'admin' | 'superadmin';
  permissions?: string[];
  rewardPoints?: number;
  avatar?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  sendOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'shajgoj_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveUserToLocal = useCallback((u: AuthUser | null) => {
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.user) {
        const u: AuthUser = {
          ...data.user,
          id: data.user.id || data.user._id,
        };
        setUser(u);
        saveUserToLocal(u);
        return;
      }
    } catch {
      // fallback to localStorage
    }

    // fallback: read localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, [saveUserToLocal]);

  useEffect(() => {
    // Initial load
    refreshUser().finally(() => setIsLoading(false));

    // Listen to changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Login failed' };
      }

      const u: AuthUser = {
        ...data.user,
        id: data.user.id || data.user._id,
      };

      setUser(u);
      saveUserToLocal(u);
      return { success: true, user: u };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { success: false, message: errorMessage };
    }
  };

  const signup = async (name: string, phone: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed' };
      }

      const u: AuthUser = {
        ...data.user,
        id: data.user.id || data.user._id,
      };

      setUser(u);
      saveUserToLocal(u);
      return { success: true, user: u };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      return { success: false, message: errorMessage };
    }
  };

  const sendOtp = async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Failed to send verification code.' };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch {
      return { success: false, message: 'Verification failed.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // quiet
    }
    setUser(null);
    saveUserToLocal(null);
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedData };
      saveUserToLocal(merged);
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        sendOtp,
        verifyOtp,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
