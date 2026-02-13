'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useProgramGuard() {
  const router = useRouter();
  const { isAuthenticated, applicant } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (!applicant?.program_id) {
      router.replace('/applicant/select-program');
    }
  }, [isAuthenticated, applicant, router]);
}
