'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';


type StaffRole = 'lecturer' | 'deo' | 'hod' | 'dean' | 'registrar' | 'admissions_officer';

interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  username?: string;
  role: 'applicant' | 'admin' | 'student' | StaffRole;
}

export const STAFF_ROLES: string[] = ['lecturer', 'deo', 'hod', 'dean', 'registrar', 'admissions_officer'];

import { ApiClient, StudentData } from '@/lib/api';

export interface ApplicantData {
  id: number;
  program_id: number;
  application_status: string;
  admission_status: string;
}

export interface ApiResponse {
  user: User;
  token: string;
  applicant?: ApplicantData;
  student?: StudentData;
}

interface AuthContextType {
  user: User | null;
  applicant: ApplicantData | null;
  student: StudentData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (first_name: string, last_name: string, email: string, password: string, phone_number: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
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
      const response = await ApiClient.verifyToken() as { user: User; student?: StudentData; applicant?: ApplicantData };
      setUser(response.user);
      
      if (response.user.role === 'applicant') {
        const status = await ApiClient.getApplicantStatus();
        setApplicant(status.applicant);
        setStudent(null);
      } else if (response.user.role === 'student' && response.student) {
        setStudent(response.student);
        setApplicant(null);
      } else {
        // admin or any staff role — no applicant/student data needed
        setApplicant(null);
        setStudent(null);
      }
    } catch (err) {
      ApiClient.setToken(null);
      setUser(null);
      setApplicant(null);
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (first_name: string, last_name: string, email: string, password: string, phone_number: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ApiClient.signup(first_name, last_name, email, password, phone_number) as ApiResponse;
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
      const response = await ApiClient.login(email, password) as ApiResponse;
      ApiClient.setToken(response.token);
      setUser(response.user);
      if (response.applicant) {
        setApplicant(response.applicant);
      }
      if (response.student) {
        setStudent(response.student);
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
      setStudent(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      if (user?.role === 'applicant') {
        const status = await ApiClient.getApplicantStatus();
        setApplicant(status.applicant);
      } else if (user?.role === 'student') {
        // We can use verifyToken or a dedicated student status endpoint
        const response = await ApiClient.verifyToken() as { user: User; student?: StudentData };
        if (response.student) setStudent(response.student);
      }
    } catch (err) {
      console.error('Error refreshing status:', err);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    applicant,
    student,
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
