"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  BookOpen,
  LogOut,
  FileText,
  DollarSign,
  Download,
  Settings,
} from "lucide-react";
import { useProgramGuard } from "@/hooks/useProgramGuard";

interface ApplicantStatus {
  id: number;
  program_id: number;
  program_name: string;
  application_status: string;
  admission_status: string;
  has_paid_acceptance_fee: boolean;
  has_paid_tuition: boolean;
  submitted_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  recommended: "bg-orange-100 text-orange-800",
};

const admissionStatusColors: Record<string, string> = {
  not_admitted: "bg-gray-100 text-gray-800",
  admitted: "bg-green-100 text-green-800",
  admission_revoked: "bg-red-100 text-red-800",
};

export default function ApplicantDashboard() {
  const router = useRouter();
  const { user, applicant, isAuthenticated, logout, refreshStatus } = useAuth();
  const [status, setStatus] = useState<ApplicantStatus | null>(null);
  const [loading, setLoading] = useState(true);
  useProgramGuard();

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStatus = async () => {
      try {
        const response = await ApiClient.getApplicantStatus();
        setStatus(response.applicant);
      } catch (err) {
        console.error("Error loading status:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const applicationStep = {
    pending: 1,
    submitted: 2,
    under_review: 2,
    accepted: 3,
    rejected: 1,
    recommended: 2,
  }[status?.application_status || "pending"];

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{status?.program_name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  statusColors[status?.application_status || "pending"]
                }
              >
                {status?.application_status?.replace("_", " ").toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Admission Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  admissionStatusColors[
                    status?.admission_status || "not_admitted"
                  ]
                }
              >
                {status?.admission_status?.replace("_", " ").toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Application Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Application Steps</CardTitle>
            <CardDescription>
              Track your progress through the application process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Application Form */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    applicationStep >= 1 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Complete Application Form</h4>
                  <p className="text-sm text-muted-foreground">
                    Fill out your application form and upload required documents
                  </p>
                  {applicationStep >= 1 && (
                    <Link href="/applicant/application">
                      <Button
                        size="sm"
                        variant={applicationStep === 1 ? "default" : "outline"}
                        className="mt-2"
                      >
                        {status?.application_status === "pending"
                          ? "Start Application"
                          : "View Application"}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Step 2: Review & Wait */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    applicationStep >= 2 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Application Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our admissions team will review your application
                  </p>
                  {status?.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on{" "}
                      {new Date(status.submitted_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Acceptance & Payment */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    applicationStep >= 3 ? "bg-primary" : "bg-gray-300"
                  }`}
                >
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Payment & Admission</h4>
                  <p className="text-sm text-muted-foreground">
                    Pay acceptance fee and tuition
                  </p>
                  {applicationStep >= 3 && (
                    <div className="space-y-2 mt-2">
                      {!status?.has_paid_acceptance_fee && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2 bg-transparent"
                          disabled
                        >
                          <DollarSign className="h-4 w-4" />
                          Pay Acceptance Fee
                        </Button>
                      )}
                      {!status?.has_paid_tuition && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2 bg-transparent"
                          disabled
                        >
                          <DollarSign className="h-4 w-4" />
                          Pay Tuition
                        </Button>
                      )}
                      {status?.has_paid_acceptance_fee &&
                        status?.has_paid_tuition && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 bg-transparent"
                            disabled
                          >
                            <Download className="h-4 w-4" />
                            Print Admission Documents
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
