'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useProgramGuard() {
  const router = useRouter();
  const { isAuthenticated, user, applicant } = useAuth();
 
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    // Ignore guard for students and admins
    if (user.role !== 'applicant') return;
 
    if (!applicant?.program_id) {
      router.replace('/applicant/select-program');
    }
  }, [isAuthenticated, user, applicant, router]);
}
