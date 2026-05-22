"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ArrowLeft, Inbox } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Application {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  program_id: number;
  program_name: string;
  application_status: string;
  admission_status: string;
  submitted_at: string;
  form_no?: string;
  session?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
  submitted: "bg-[#6b21a8]/5 text-[#6b21a8] border border-[#6b21a8]/10 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  screening: "bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  admitted: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("submitted");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admissionofficer") {
      router.replace("/staff/login");
      return;
    }

    loadApplications();
  }, [isAuthenticated, user, router, status]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.getApplications(status);
      setApplications((response.applications as any as Application[]) || []);
    } catch (err) {
      console.error("Error loading applications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6b21a8]/5 via-slate-50/30 to-[#881337]/[0.02] dark:from-slate-950 dark:to-slate-900">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/admission_officer/dashboard"
              className="text-[#6b21a8] hover:text-[#881337] font-semibold flex items-center gap-1.5 text-sm mb-3 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Manage <span className="bg-gradient-to-r from-[#6b21a8] to-[#881337] bg-clip-text text-transparent">Applications</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Review, screen, and recommend applicant submissions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Filter Status:</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-[#6b21a8] focus:border-[#6b21a8] font-semibold text-slate-700 dark:text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl dark:border-slate-800">
                <SelectItem value="submitted" className="font-medium rounded-lg">Submitted</SelectItem>
                <SelectItem value="screening" className="font-medium rounded-lg">Under Review</SelectItem>
                <SelectItem value="admitted" className="font-medium rounded-lg">Admitted</SelectItem>
                <SelectItem value="rejected" className="font-medium rounded-lg">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b21a8] mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading applications list...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-4">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No applications found</h3>
            <p className="text-slate-400 dark:text-slate-500 max-w-sm mx-auto text-sm">
              There are currently no candidate applications on record matching the "{status}" status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link key={app.id} href={`/admission_officer/application/${app.id}`}>
                <Card className="border border-slate-100 dark:border-slate-800/80 rounded-2xl hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:scale-[1.005] hover:border-purple-200/50 cursor-pointer overflow-hidden relative group">
                  {/* Subtle brand left border line */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#6b21a8] to-[#881337] group-hover:w-1.5 transition-all duration-300" />
                  
                  <CardContent className="p-6 pl-7">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 group-hover:text-[#6b21a8] transition-colors duration-200 truncate">
                            {app.name}
                          </h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[app.application_status] || 'bg-slate-100 text-slate-700'}`}>
                            {app.application_status === 'accepted' ? 'Admitted' : app.application_status.replace('_', ' ')}
                          </span>
                          
                          {/* Fee status pill — only shown on admitted tab */}
                          {status === 'admitted' && (
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              app.application_status === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30'
                                : 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30'
                            }`}>
                              {app.application_status === 'accepted' ? '✓ Fee Paid' : '⏳ Awaiting Fee'}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Form No
                            </p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                              {app.form_no || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Applicant Email
                            </p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                              {app.email || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Program Type
                            </p>
                            <p className="font-semibold text-[#6b21a8] dark:text-purple-300 mt-0.5 truncate">
                              {app.program_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Session
                            </p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                              {app.session || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#6b21a8] group-hover:translate-x-1 transition-all duration-300 ml-4 shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
