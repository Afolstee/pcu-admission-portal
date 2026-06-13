"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  ClipboardList,
  Printer,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationDetail {
  applicant: any;
  form: any;
  documents: any[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  submitted: "bg-blue-50 text-blue-700 border border-blue-200",
  screening: "bg-violet-50 text-violet-700 border border-violet-200",
  shortlisted: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  admitted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
  incomplete: "bg-slate-100 text-slate-600 border border-slate-200",
  payment_pending: "bg-amber-50 text-amber-700 border border-amber-200",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#f0e8dc] last:border-0">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-4">
        {label}
      </span>
      <span className="font-semibold text-slate-700 text-sm text-right">
        {value || "N/A"}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      <div className="bg-white border border-[#e8dfd2] rounded-xl overflow-hidden px-4">
        {children}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PtApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const id = params?.id as string;
  const backStatus = searchParams.get("status") || "submitted";

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ptadmin") {
      router.replace("/staff/login");
      return;
    }
    loadApplication();
  }, [isAuthenticated, user, router, id]);

  const loadApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getPtApplicationDetails(id);
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleAction = async (decision: "admit" | "reject" | "shortlist" | "incomplete") => {
    setActionLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      await ApiClient.ptReviewApplication(id, decision, notes || undefined);
      const labels: Record<string, string> = {
        admit: "Applicant admitted successfully.",
        reject: "Application rejected.",
        shortlist: "Applicant shortlisted.",
        incomplete: "Document request sent to applicant.",
      };
      setActionSuccess(labels[decision]);
      await loadApplication();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/e-portal/api";
      const res = await fetch(
        `${baseUrl}/applicant/download-document/${doc.id || doc.document_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.original_filename || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handlePrint = () => {
    const printUrl = ApiClient.getPtApplicationPrintUrl(id);
    window.open(printUrl, "_blank");
  };

  // ─── Loading / error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3eee6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#e8dfd2] border-t-[#c99b45] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-[#f3eee6] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-base mb-1">Failed to load application</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <Link href="/ptadmin/applications" className="mt-4 inline-block text-[#c99b45] font-bold text-sm">
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const { applicant, form, documents } = application;
  const status = applicant?.application_status || "";
  const passportDoc = documents?.find(
    (d) => d.document_type === "passport_photo" || d.document_type === "passport",
  );
  const passportUrl = passportDoc
    ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/e-portal/api"}/applicant/download-document/${passportDoc.id || passportDoc.document_id}?token=${localStorage.getItem("auth_token") || ""}`
    : null;

  const isDecided = ["admitted", "accepted", "rejected", "enrolled"].includes(status);

  return (
    <div className="min-h-screen bg-[#f3eee6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <Link
            href={`/ptadmin/applications?status=${backStatus}`}
            className="text-slate-500 hover:text-slate-800 text-sm font-bold block mb-3"
          >
            ← Back to Applications
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 capitalize">
                {form?.full_name || applicant?.name || "Applicant"}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {applicant?.form_no || `Application #${id}`} · {form?.proposed_course_name || applicant?.program_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={`${statusColors[status] || "bg-slate-100 text-slate-600 border border-slate-200"} font-bold text-xs py-1.5 px-4 rounded-full`}
              >
                {status.replace(/_/g, " ")}
              </Badge>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8dfd2] rounded-xl text-sm font-bold text-slate-600 hover:bg-[#f7f1e8] hover:border-[#c99b45] transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Left: applicant info + documents */}
          <div className="space-y-6">

            {/* Passport + key details */}
            <Card className="border-[#e8dfd2] shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Passport photo */}
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border border-[#e8dfd2] bg-[#f3eee6] shrink-0 flex items-center justify-center">
                    {passportUrl ? (
                      <img
                        src={passportUrl}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <User className="w-8 h-8 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">No photo</span>
                      </div>
                    )}
                  </div>
                  {/* Quick details */}
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase">
                      {form?.full_name || applicant?.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</span>
                        <p className="font-semibold text-slate-700">{form?.email || applicant?.email || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                        <p className="font-semibold text-slate-700">{form?.phone_number || applicant?.phone_number || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programme</span>
                        <p className="font-semibold text-slate-700">{form?.proposed_course_name || applicant?.program_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session</span>
                        <p className="font-semibold text-slate-700">{applicant?.program_session || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal details */}
            <Section title="Personal Details">
              <InfoRow label="Date of Birth" value={form?.date_of_birth} />
              <InfoRow label="Address" value={form?.address} />
              <InfoRow label="State of Origin" value={form?.state_of_origin} />
              <InfoRow label="Gender" value={form?.gender} />
              <InfoRow label="Marital Status" value={form?.marital_status} />
            </Section>

            {/* Academic background */}
            <Section title="Academic Background">
              <InfoRow label="Previous Institution" value={form?.previous_institution} />
              <InfoRow label="Department" value={form?.department} />
              <InfoRow label="Course of Study" value={form?.previous_course} />
              <InfoRow label="UTME Score" value={form?.utme_score?.toString()} />
              <InfoRow label="Entry Mode" value={form?.entry_mode || form?.mode_of_entry} />
            </Section>

            {/* Proposed programme */}
            <Section title="Programme Applied For">
              <InfoRow label="Programme" value={form?.proposed_course_name || applicant?.program_name} />
              <InfoRow label="Faculty" value={form?.proposed_faculty_name} />
              <InfoRow label="Mode" value={form?.mode_of_study} />
              <InfoRow label="Form No." value={applicant?.form_no} />
            </Section>

            {/* Documents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Uploaded Documents ({documents?.length || 0})
                </p>
                {documents?.length > 0 && (
                  <span className="text-xs font-bold text-[#c99b45]">
                    {documents.length} file(s)
                  </span>
                )}
              </div>
              <Card className="border-[#e8dfd2] shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  {documents?.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id || doc.document_id}
                          className="flex items-center justify-between p-3 bg-[#fbfaf7] border border-[#eee5d8] rounded-xl"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-[#c99b45] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">
                                {doc.original_filename}
                              </p>
                              <p className="text-xs text-slate-400 capitalize">
                                {(doc.document_type || "").replace(/_/g, " ")}
                                {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-lg bg-white border border-[#e8dfd2] text-slate-600 hover:border-[#c99b45] hover:bg-[#fdf8f0] text-xs font-bold transition-all shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-6">No documents uploaded.</p>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Right: actions panel */}
          <div className="space-y-4">
            <Card className="border-[#e8dfd2] shadow-sm bg-white rounded-2xl overflow-hidden sticky top-4">
              <CardHeader className="pb-4 border-b border-[#f0e8dc] px-5 pt-5">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Admission Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">

                {/* Feedback messages */}
                {actionSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-emerald-700 font-semibold text-sm">{actionSuccess}</p>
                  </div>
                )}
                {actionError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-rose-600 font-semibold text-sm">{actionError}</p>
                  </div>
                )}

                {/* Current status */}
                <div className="bg-[#fbfaf7] border border-[#eee5d8] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Current Status
                  </p>
                  <Badge
                    className={`${statusColors[status] || "bg-slate-100 text-slate-600 border border-slate-200"} font-bold text-xs py-1 px-3 rounded-full`}
                  >
                    {status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Review Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this decision..."
                    disabled={isDecided}
                    className="w-full bg-white border border-[#e8dfd2] rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c99b45]/40 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Action buttons */}
                {isDecided ? (
                  <div className="bg-[#fbfaf7] border border-[#eee5d8] rounded-xl p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-[#c99b45] mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">Decision finalised</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      This application has already been processed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAction("admit")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#23704d] hover:bg-[#1d5c40] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Admit Applicant
                    </button>
                    <button
                      onClick={() => handleAction("shortlist")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2d5f9a] hover:bg-[#254d7e] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Star className="w-4 h-4" />
                      Shortlist
                    </button>
                    <button
                      onClick={() => handleAction("incomplete")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#e8dfd2] hover:bg-[#f7f1e8] hover:border-[#c99b45] text-slate-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Request Documents
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject Application
                    </button>
                  </div>
                )}

                {actionLoading && (
                  <div className="text-center py-2">
                    <div className="w-5 h-5 border-2 border-[#e8dfd2] border-t-[#c99b45] rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-1 font-medium">Processing...</p>
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
