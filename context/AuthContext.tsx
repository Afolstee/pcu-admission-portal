'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
}

interface ApplicantData {
  id: number;
  program_id: number;
  application_status: string;
  admission_status: string;
}

interface AuthContextType {
  user: User | null;
  applicant: ApplicantData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (name: string, email: string, password: string, phone_number: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = ApiClient.getToken();
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await ApiClient.verifyToken();
      // If token is valid, try to get user status
      const status = await ApiClient.getApplicantStatus();
      setApplicant(status.applicant);
    } catch (err) {
      ApiClient.setToken(null);
      setUser(null);
      setApplicant(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, phone_number: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ApiClient.signup(name, email, password, phone_number);
        ApiClient.setToken(response.token);
        setUser(response.user);
        if (response.applicant) {
          setApplicant(response.applicant);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClient.login(email, password);
      ApiClient.setToken(response.token);
      setUser(response.user);
      if (response.applicant) {
        setApplicant(response.applicant);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await ApiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      ApiClient.setToken(null);
      setUser(null);
      setApplicant(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await ApiClient.getApplicantStatus();
      setApplicant(status.applicant);
    } catch (err) {
      console.error('Error refreshing status:', err);
    }
  }, []);

  const value: AuthContextType = {
    user,
    applicant,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    refreshStatus,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
