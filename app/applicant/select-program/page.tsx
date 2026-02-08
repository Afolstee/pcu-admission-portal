'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  description: string;
}

export default function SelectProgramPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'applicant') {
      router.replace('/auth/login');
      return;
    }

    const loadPrograms = async () => {
      try {
        const response = await ApiClient.getPrograms();
        setPrograms(response.programs || []);
      } catch (err) {
        setError('Failed to load programs. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [isAuthenticated, user, router]);

  const handleSelectProgram = async () => {
    if (!selectedProgram) {
      setError('Please select a program');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await ApiClient.selectProgram(selectedProgram);
      router.push('/applicant/dashboard');
    } catch (err) {
      setError('Failed to select program. Please try again.');
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admission Portal</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Select Your Program</h1>
          <p className="text-lg text-muted-foreground">
            Choose the program that best aligns with your academic goals
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {programs.map((program) => (
            <Card
              key={program.id}
              className={`cursor-pointer transition-all ${
                selectedProgram === program.id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedProgram(program.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                    {selectedProgram === program.id && (
                      <Badge className="mt-2">Selected</Badge>
                    )}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedProgram === program.id
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedProgram === program.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{program.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            disabled={submitting}
          >
            Back Home
          </Button>
          <Button
            onClick={handleSelectProgram}
            disabled={!selectedProgram || submitting}
            className="gap-2"
          >
            {submitting ? 'Selecting Program...' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
