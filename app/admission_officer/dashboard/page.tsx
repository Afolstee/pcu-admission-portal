"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, UserCheck, Eye, AlertCircle } from "lucide-react";

interface Statistics {
  total_applications: number;
  total_admitted: number;
  pending_submission: number;
  under_review: number;
  review_applications: number;
  by_status: Array<{ application_status: string; count: number }>;
  by_program: Array<{ name: string; count: number }>;
}

interface ActivityItem {
  type: string;
  label: string;
  event_time: string | null;
}

function activityDot(type: string) {
  const map: Record<string, string> = {
    accept:    "bg-emerald-500",
    fee_paid:  "bg-emerald-500",
    submitted: "bg-[#6b21a8]",
    recommend: "bg-[#881337]",
    reject:    "bg-rose-500",
  };
  return map[type] ?? "bg-amber-500";
}

function friendlyTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now  = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (+d === +today)     return `Today, ${time}`;
  if (+d === +yesterday) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats]       = useState<Statistics | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "admissionofficer") {
      router.replace("/staff/login");
      return;
    }

    const load = async () => {
      try {
        const res = await ApiClient.getDashboard(10);
        setStats(res.statistics);
        setActivity(res.recent_activity || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user, router, authLoading]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#6b21a8]/5 via-slate-50/30 to-[#881337]/[0.02] dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
            Admission Officer <span className="bg-gradient-to-r from-[#6b21a8] to-[#881337] bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage student applications and admissions overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Applications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Total Applications
              </p>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {stats?.total_applications ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-[#6b21a8] group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Admitted Candidates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Admitted Candidates
              </p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats?.total_admitted ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Under Review */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Under Review
              </p>
              <h3 className="text-3xl font-black text-[#881337] dark:text-rose-400">
                {stats?.under_review ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-[#881337] group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Pending Submission */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-between group">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Pending Submission
              </p>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats?.pending_submission ?? 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Main Grid: Recent Activity + Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Recent Activity Card */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            {/* Premium Gradient Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6b21a8] to-[#881337]" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Recent Activity
              </h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full font-medium">
                Live Feed
              </span>
            </div>

            {activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">No recent activity to display.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[380px] pr-1">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activity.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 py-4 first:pt-1 last:pb-1 group transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 px-2 rounded-xl -mx-2">
                      <div className="mt-1.5 flex items-center justify-center shrink-0">
                        <span className={`w-3 h-3 rounded-full ${activityDot(item.type)} ring-4 ring-white dark:ring-slate-900 shadow-sm`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-snug text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                          {item.label}
                        </p>
                        <p className="text-xs mt-1 text-slate-400 dark:text-slate-500 font-medium">
                          {friendlyTime(item.event_time)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Status + Program Breakdown */}
          <div className="flex flex-col gap-6">
            {/* Applications by Status Card */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-sm border-t-4 border-t-[#881337] hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/40">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
                  Applications by Status
                  <span className="text-xs text-[#881337] dark:text-rose-400 font-medium px-2 py-0.5 bg-[#881337]/5 rounded-full">
                    Status Overview
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {stats?.by_status?.map((s) => (
                  <div key={s.application_status} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 capitalize flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#881337]" />
                      {s.application_status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#881337]/10 text-[#881337] dark:bg-[#881337]/20 dark:text-rose-300">
                      {s.count}
                    </span>
                  </div>
                ))}
                {(!stats?.by_status || stats.by_status.length === 0) && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">No status data yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applications by Program Card */}
            <Card className="border border-slate-100 dark:border-slate-800/80 shadow-sm border-t-4 border-t-[#6b21a8] hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800/40">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
                  Applications by Program
                  <span className="text-xs text-[#6b21a8] dark:text-purple-400 font-medium px-2 py-0.5 bg-[#6b21a8]/5 rounded-full">
                    Course Statistics
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {stats?.by_program?.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2 truncate pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6b21a8]" />
                      {p.name}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#6b21a8]/10 text-[#6b21a8] dark:bg-[#6b21a8]/20 dark:text-purple-300 shrink-0">
                      {p.count}
                    </span>
                  </div>
                ))}
                {(!stats?.by_program || stats.by_program.length === 0) && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">No program data yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
