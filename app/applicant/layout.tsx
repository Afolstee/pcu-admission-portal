'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const { user, applicant, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    const currentPath = window.location.pathname;
    const isDashboard = currentPath === '/applicant/dashboard';

    if (!applicant?.program_id && !isDashboard) {
      router.replace('/applicant/dashboard');
    }
  }, [isAuthenticated, isLoading, user, applicant, router]);

  return <>{children}</>;
}
