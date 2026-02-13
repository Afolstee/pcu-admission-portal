'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LogOut, Upload, Save, Send, AlertCircle } from 'lucide-react';
import ApplicationFormComponent from '@/components/ApplicationForm';
import { useProgramGuard } from '@/hooks/useProgramGuard';

export default function ApplicationPage() {
  const router = useRouter();
  const { user, applicant, isAuthenticated, logout } = useAuth();
  const [formTemplate, setFormTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useProgramGuard();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'applicant') {
      router.replace('/auth/login');
      return;
    }

    const loadFormTemplate = async () => {
      try {
        if (!applicant?.program_id) {
          router.replace('/applicant/select-program');
          return;
        }
        const response = await ApiClient.getFormTemplate(applicant.program_id);
        setFormTemplate(response);
      } catch (err) {
        setError('Failed to load application form. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFormTemplate();
  }, [isAuthenticated, user, applicant, router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admission Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground">Welcome back</p>
              <p className="font-medium text-foreground">{user?.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-4 bg-transparent"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Application Form - {formTemplate?.program || 'Loading...'}
          </h1>
          <p className="text-muted-foreground">
            Complete all required fields and upload the necessary documents
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {formTemplate && (
          <ApplicationFormComponent
            template={formTemplate}
            applicantId={applicant?.id}
            programId={applicant?.program_id}
            onSuccess={() => {
              router.push('/applicant/dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
}
