"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, FileText, Mail, BarChart3, Settings, Users } from "lucide-react";

interface Statistics {
  total_applications: number;
  total_admitted: number;
  by_status: Array<{ application_status: string; count: number }>;
  by_program: Array<{ name: string; count: number }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "admissions_officer") {
      router.replace("/staff/login");
      return;
    }

    const loadStatistics = async () => {
      try {
        const response = await ApiClient.getStatistics();
        setStats(response);
      } catch (err) {
        console.error("Error loading statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [isAuthenticated, user, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/staff/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center rounded-xl overflow-hidden">
              <Image
                src="/images/logo new.png"
                alt="PCU Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage applications and admissions
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats?.total_applications || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admitted Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats?.total_admitted || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.by_status?.find(
                  (s) => s.application_status === "under_review",
                )?.count || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Submission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {stats?.by_status?.find(
                  (s) => s.application_status === "pending",
                )?.count || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/applications">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Review Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and approve submitted applications
                </p>
                <Badge variant="outline">
                  {stats?.by_status?.find(
                    (s) => s.application_status === "submitted",
                  )?.count || 0}{" "}
                  pending
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/send-letters">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Admission Letters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate and send admission letters to candidates
                </p>
                <Badge variant="outline">
                  {stats?.by_status?.find(
                    (s) => s.application_status === "accepted",
                  )?.count || 0}{" "}
                  to process
                </Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/statistics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  View Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed application statistics and analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.by_status?.map((status) => (
                <div
                  key={status.application_status}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium capitalize">
                    {status.application_status.replace("_", " ")}
                  </span>
                  <Badge variant="secondary">{status.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications by Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.by_program?.map((program) => (
                <div
                  key={program.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{program.name}</span>
                  <Badge variant="secondary">{program.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Academic Session Management */}
        <AcademicSessionManager />
      </div>
    </div>
  );
}

function AcademicSessionManager() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await ApiClient.getGlobalSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ApiClient.updateGlobalSettings({
        current_academic_session: settings.current_academic_session,
        current_semester: settings.current_semester
      });
      alert("Academic settings updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Academic Session Manager
        </CardTitle>
        <CardDescription>
          Set the global active session and semester for all portal activities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="grid md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Academic Session</label>
            <input 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.current_academic_session || ""}
              onChange={e => setSettings({...settings, current_academic_session: e.target.value})}
              placeholder="e.g. 2025/2026"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Semester</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={settings.current_semester || "First Semester"}
              onChange={e => setSettings({...settings, current_semester: e.target.value})}
            >
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
            </select>
          </div>
          <Button type="submit" disabled={saving} className="w-full md:w-auto">
            {saving ? "Updating..." : "Activate Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
