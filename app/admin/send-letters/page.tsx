'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LogOut, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Application {
  id: number;
  name: string;
  email: string;
  program_name: string;
  application_status: string;
}

interface SendResult {
  total_requested: number;
  letters_created: number;
  errors: number;
  created: Array<{ applicant_id: number; letter_id: number }>;
  failed: Array<{ applicant_id: number; error: string }>;
}

export default function SendLettersPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [templateId, setTemplateId] = useState('1');
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/auth/login');
      return;
    }

    loadApplications();
  }, [isAuthenticated, user, router]);

  const loadApplications = async () => {
    try {
      const response = await ApiClient.getApplications('accepted');
      setApplications(response.applications || []);
    } catch (err) {
      setError('Failed to load applications. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplicants(new Set(applications.map((app) => app.id)));
    } else {
      setSelectedApplicants(new Set());
    }
  };

  const handleSelectApplicant = (applicantId: number, checked: boolean) => {
    const newSelected = new Set(selectedApplicants);
    if (checked) {
      newSelected.add(applicantId);
    } else {
      newSelected.delete(applicantId);
    }
    setSelectedApplicants(newSelected);
  };

  const handleSendLetters = async () => {
    if (selectedApplicants.size === 0) {
      setError('Please select at least one applicant');
      return;
    }

    setSending(true);
    setError(null);
    setSendResult(null);

    try {
      const result = await ApiClient.sendBatchLetters(
        Array.from(selectedApplicants),
        admissionDate,
        parseInt(templateId)
      );
      setSendResult(result);
      setSelectedApplicants(new Set());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send letters';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admission Portal - Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground">Logged in as</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-primary hover:underline text-sm mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Send Admission Letters</h1>
          <p className="text-muted-foreground">
            Generate and send admission letters to accepted candidates
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

        {sendResult && (
          <Card className="mb-6 border-green-500/50 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex gap-3 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Letters Sent Successfully</p>
                  <p className="text-sm text-green-800">
                    {sendResult.letters_created} letters created, {sendResult.errors} failed
                  </p>
                </div>
              </div>

              {sendResult.failed.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="font-medium text-sm text-green-900 mb-2">Failed Recipients:</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    {sendResult.failed.map((fail) => (
                      <li key={fail.applicant_id}>
                        • Applicant {fail.applicant_id}: {fail.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle>Letter Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admission-date">Admission Date</Label>
                <Input
                  id="admission-date"
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Letter Template</Label>
                <Select value={templateId} onValueChange={setTemplateId} disabled={sending}>
                  <SelectTrigger id="template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Default Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Applicants</p>
                  <Badge variant="secondary" className="text-lg py-2 px-3">
                    {selectedApplicants.size} / {applications.length}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={handleSendLetters}
                disabled={sending || selectedApplicants.size === 0}
                className="w-full gap-2 mt-6"
              >
                <Mail className="h-4 w-4" />
                {sending
                  ? 'Sending Letters...'
                  : `Send to ${selectedApplicants.size} Applicant${selectedApplicants.size !== 1 ? 's' : ''}`}
              </Button>
            </CardContent>
          </Card>

          {/* Applicants List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accepted Applicants</CardTitle>
                  <CardDescription>Select applicants to send letters to</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) =>
                    handleSelectAll(selectedApplicants.size !== applications.length)
                  }
                  disabled={sending}
                >
                  {selectedApplicants.size === applications.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading applicants...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No accepted applications found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent"
                    >
                      <Checkbox
                        id={`app-${app.id}`}
                        checked={selectedApplicants.has(app.id)}
                        onCheckedChange={(checked) =>
                          handleSelectApplicant(app.id, checked as boolean)
                        }
                        disabled={sending}
                      />
                      <label
                        htmlFor={`app-${app.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.email} • {app.program_name}
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
