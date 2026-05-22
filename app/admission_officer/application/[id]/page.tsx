"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Check, X, AlertCircle, ArrowLeft, ArrowRight, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Sub-components defined OUTSIDE the parent to prevent remounting ──────────

function ApplicantInfoTab({
  applicant,
  form,
  passportUrl,
}: {
  applicant: any;
  form: any;
  passportUrl: string | null;
}) {
  const olevelResults = form?.olevel_results || [];

  return (
    <div className="space-y-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm rounded-2xl relative overflow-hidden">
      {/* Absolute top brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6b21a8] to-[#881337]" />

      {/* Header with passport */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 pb-8 border-b border-slate-100 dark:border-slate-800/60">
        <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md bg-slate-50 dark:bg-slate-800 shrink-0 ring-4 ring-[#6b21a8]/5 dark:ring-purple-950/20 group transition-all duration-300 hover:scale-[1.02] flex items-center justify-center">
          {passportUrl ? (
            <img
              src={passportUrl}
              alt="Passport"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <User className="w-12 h-12 mb-1 opacity-70" />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Photo</span>
            </div>
          )}
        </div>
        <div className="space-y-3 flex-1 min-w-0 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
            {form?.full_name || applicant?.name}
          </h2>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2.5 gap-x-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email:</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-xs">{form?.email || applicant?.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone:</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold">{form?.phone_number || applicant?.phone_number}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Gender:</span>
              <span className="text-slate-700 dark:text-slate-200 font-bold uppercase">{form?.gender || "N/A"}</span>
            </div>
          </div>

          <div className="pt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge className="bg-gradient-to-r from-[#6b21a8] to-[#881337] text-white border-0 py-1 px-3 rounded-full font-bold text-xs tracking-wide shadow-sm">
              {form?.first_choice_program_name || applicant?.program_name}
            </Badge>
            {form?.second_choice_program_name && (
              <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs py-1 px-3 rounded-full bg-slate-50/50 dark:bg-slate-800/30">
                2nd choice: {form.second_choice_program_name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="w-1.5 h-4 bg-[#6b21a8] rounded-full" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Personal Details
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Date of Birth", value: form?.date_of_birth },
            { label: "Place of Birth", value: form?.place_of_birth },
            { label: "Nationality", value: form?.nationality },
            { label: "State of Origin", value: form?.state },
            { label: "LGA", value: form?.lga },
            { label: "Religion", value: form?.religion },
            { label: "Blood Group", value: form?.blood_group },
            { label: "Genotype", value: form?.genotype },
            { label: "Contact Address", value: form?.address || form?.contact_address, fullSpan: true },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40 hover:border-purple-100 dark:hover:border-purple-900/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 ${
                item.fullSpan ? "sm:col-span-2 md:col-span-3" : ""
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {item.label}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block break-words">
                {item.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsor Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="w-1.5 h-4 bg-[#881337] rounded-full" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Sponsor Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Sponsor Name", value: form?.sponsor_name },
            { label: "Sponsor Phone", value: form?.sponsor_phone_number },
            { label: "Relationship", value: form?.sponsor_relationship },
            { label: "Sponsor Address", value: form?.sponsor_address, fullSpan: true },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40 hover:border-rose-100 dark:hover:border-rose-950/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 ${
                item.fullSpan ? "sm:col-span-2 md:col-span-3" : ""
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {item.label}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block break-words">
                {item.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next of Kin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="w-1.5 h-4 bg-[#6b21a8] rounded-full" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Next of Kin Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Kin Name", value: form?.next_of_kin_name },
            { label: "Kin Phone", value: form?.next_of_kin_phone_number },
            { label: "Kin Address", value: form?.next_of_kin_address, fullSpan: true },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40 hover:border-purple-100 dark:hover:border-purple-900/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200 ${
                item.fullSpan ? "sm:col-span-2 md:col-span-3" : ""
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {item.label}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5 block break-words">
                {item.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Programme Choices */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="w-1.5 h-4 bg-[#881337] rounded-full" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Programme Choices
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "First Choice Program", value: form?.first_choice_program_name, accent: "text-[#6b21a8] dark:text-purple-350" },
            { label: "Second Choice Program", value: form?.second_choice_program_name, accent: "text-[#881337] dark:text-rose-350" },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100/50 dark:border-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60 transition-all duration-200"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {item.label}
              </span>
              <span className={`font-extrabold text-sm mt-1 block ${item.accent}`}>
                {item.value || "N/A"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* O'Level Results */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
          <div className="w-1.5 h-4 bg-[#6b21a8] rounded-full" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            O'Level Results
          </h3>
        </div>
        {olevelResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {olevelResults.map((exam: any, idx: number) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md hover:border-purple-200/40 transition-all duration-300"
              >
                {/* Visual top border accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6b21a8] to-[#881337]" />
                
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-extrabold text-sm text-[#6b21a8] dark:text-purple-300 uppercase tracking-wide">
                      {exam.name || "O'Level Exam"} — Sitting {idx + 1}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-850/40 mb-4 font-semibold text-slate-600 dark:text-slate-400">
                    <p>
                      <strong className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider">Reg Number:</strong> 
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{exam.number}</span>
                    </p>
                    <p>
                      <strong className="text-slate-400 font-medium block text-[9px] uppercase tracking-wider">Exam Year:</strong> 
                      <span className="text-slate-800 dark:text-slate-200 font-bold mt-0.5 block">{exam.year}</span>
                    </p>
                  </div>
                  
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="pb-2 font-semibold">Subject</th>
                        <th className="pb-2 text-right font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {exam.subjects
                        ?.filter((s: any) => s.subject)
                        .map((s: any, sIdx: number) => (
                          <tr
                            key={sIdx}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors duration-150 group/row"
                          >
                            <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-350 uppercase text-xs">
                              {s.subject}
                            </td>
                            <td className="py-2.5 text-right font-extrabold text-[#881337] dark:text-rose-450 text-xs">
                              {s.grade || "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic py-4">
            No O'Level results uploaded.
          </p>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({
  documents,
}: {
  documents: any[];
}) {
  const handleDownload = async (doc: any) => {
    try {
      const token = localStorage.getItem("auth_token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/e-portal/api";
      const res = await fetch(
        `${baseUrl}/applicant/download-document/${doc.document_id || doc.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
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

  return (
    <Card className="border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
      {/* Absolute top brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#881337] to-[#6b21a8]" />

      <CardHeader className="p-6 sm:p-8">
        <CardTitle className="text-xl font-extrabold text-slate-800 dark:text-white">Uploaded Documents</CardTitle>
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
          {documents?.length || 0} document(s) uploaded on record
        </p>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 pt-0">
        {documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.document_id || doc.id}
                className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/40 rounded-xl hover:border-purple-200/50 dark:hover:border-purple-900/50 hover:bg-white dark:hover:bg-slate-800/40 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Left gradient accent line */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#6b21a8] to-[#881337] opacity-60 group-hover:opacity-100 transition-opacity" />

                <div className="flex-1 min-w-0 pl-3">
                  <p className="font-bold text-slate-700 dark:text-slate-200 truncate text-sm group-hover:text-[#6b21a8] transition-colors duration-200">
                    {doc.original_filename}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5 capitalize">
                    {(doc.document_type || "").replace(/_/g, " ")}
                    {doc.file_size
                      ? ` · ${(doc.file_size / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4 gap-1.5 shrink-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-350 hover:text-[#6b21a8] dark:hover:text-purple-300 font-bold text-xs rounded-xl shadow-sm transition-all"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 py-12 text-center">
            No applicant documents have been uploaded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewsTab({
  application,
  onReviewSuccess,
}: {
  application: ApplicationDetail;
  onReviewSuccess: () => void;
}) {
  const [reviewing, setReviewing] = useState(false);
  const [decision, setDecision] = useState<"accept" | "reject" | "recommend">("accept");
  const [approvedCourse, setApprovedCourse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [programs, setPrograms] = useState<{ program_id: number; program: string; department: string; degree: string }[]>([]);

  const applicantId   = application.applicant.id;
  // admin.py returns prog_type (the program_types.id FK)
  const programTypeId: number | null = application.applicant.prog_type ?? application.applicant.program_id ?? null;

  // Fetch all available programs for this applicant's program type
  useEffect(() => {
    if (!programTypeId) return;
    ApiClient.getPrograms(programTypeId)
      .then((res: any) => setPrograms(res.programs || []))
      .catch(() => setPrograms([]));
  }, [programTypeId]);

  // Existing decision already stored on the application row
  const currentDecision     = application.applicant.decision      as string | undefined;
  const currentApprovedCourse = application.applicant.approved_course as string | undefined;
  const decisionDate        = application.applicant.decision_date  as string | undefined;

  const needsCourse = decision === "accept" || decision === "recommend";

  const handleReview = async () => {
    if (needsCourse && !approvedCourse) {
      setError("Please select the approved course before submitting.");
      return;
    }
    setReviewing(true);
    setError(null);
    setReviewSuccess(null);
    try {
      await ApiClient.reviewApplication(
        applicantId,
        decision,
        needsCourse ? approvedCourse : undefined
      );
      const labels: Record<string, string> = {
        accept:    "Accepted",
        reject:    "Rejected",
        recommend: "Recommended",
      };
      setReviewSuccess(`Application ${labels[decision] || "reviewed"} successfully.`);
      setApprovedCourse("");
      setDecision("accept");
      window.dispatchEvent(new Event('application-reviewed'));
      onReviewSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewing(false);
    }
  };

  const decisionColor = (d: string) =>
    d === "accept"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30"
      : d === "reject"
      ? "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30"
      : "bg-[#6b21a8]/5 text-[#6b21a8] border border-[#6b21a8]/10 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30";

  const decisionLabel = (d: string) =>
    d === "accept" ? "Accepted" : d === "reject" ? "Rejected" : "Recommended";

  const canReview =
    application.applicant.application_status === "submitted" ||
    application.applicant.application_status === "screening";

  return (
    <div className="space-y-6">

      {/* ── Current decision summary ────────────────────────────────────── */}
      {currentDecision && (
        <Card className="border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-[#6b21a8]" />
          
          <CardHeader className="p-6">
            <CardTitle className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Current Decision Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${decisionColor(currentDecision)}`}>
                {decisionLabel(currentDecision)}
              </span>
              {decisionDate && (
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  on {new Date(decisionDate).toLocaleString()}
                </span>
              )}
            </div>
            {currentApprovedCourse && (
              <div className="text-sm font-semibold bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850/40 inline-block">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Approved Course of Admission</span>
                <span className="text-slate-800 dark:text-slate-150 font-extrabold text-sm">{currentApprovedCourse}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Success banner ──────────────────────────────────────────────── */}
      {reviewSuccess && (
        <Card className="border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/55 dark:bg-emerald-950/20 rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex items-center gap-2.5">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-350 font-bold">{reviewSuccess}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/80 dark:border-rose-900/55 dark:bg-rose-950/20 rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-450 shrink-0" />
            <p className="text-sm text-rose-800 dark:text-rose-350 font-bold">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Review form ─────────────────────────────────────────────────── */}
      {canReview && (
        <Card className="border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6b21a8] to-[#881337]" />

          <CardHeader className="p-6">
            <CardTitle className="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Add Review Decision</CardTitle>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
              Currently processing application:{" "}
              <span className="font-bold capitalize text-slate-600 dark:text-slate-350">
                {application.applicant.application_status}
              </span>
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6 pt-0">

            {/* Decision buttons */}
            <div className="grid grid-cols-3 gap-3.5">
              {([
                { 
                  value: "accept",    
                  label: "Accept",    
                  icon: <Check className="h-5 w-5" />, 
                  cls: "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 ring-emerald-500/20" 
                },
                { 
                  value: "reject",    
                  label: "Reject",    
                  icon: <X className="h-5 w-5" />, 
                  cls: "border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 ring-rose-500/20" 
                },
                { 
                  value: "recommend", 
                  label: "Recommend", 
                  icon: <ArrowRight className="h-5 w-5" />, 
                  cls: "border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/10 text-[#6b21a8] dark:text-purple-300 hover:bg-[#6b21a8]/10 ring-[#6b21a8]/20" 
                },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={reviewing}
                  onClick={() => { setDecision(opt.value); setApprovedCourse(""); }}
                  className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    decision === opt.value
                      ? `${opt.cls} ring-4 ring-offset-2 dark:ring-offset-slate-900 shadow-md scale-[1.02]`
                      : "border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:scale-[1.01]"
                  }`}
                >
                  <span className="shrink-0">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Accept — choose from applicant's 1st / 2nd choice */}
            {decision === "accept" && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">Accepted Course</label>
                <Select
                  value={approvedCourse}
                  onValueChange={setApprovedCourse}
                  disabled={reviewing}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-[#6b21a8] focus:border-[#6b21a8] font-bold text-slate-700 dark:text-slate-200 py-6">
                    <SelectValue placeholder="Select applicant's 1st or 2nd choice" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl dark:border-slate-800">
                    {application.form?.first_choice_program_name && (
                      <SelectItem value={application.form.first_choice_program_name} className="font-semibold text-sm rounded-lg py-2.5">
                        1st Choice — {application.form.first_choice_program_name}
                      </SelectItem>
                    )}
                    {application.form?.second_choice_program_name && (
                      <SelectItem value={application.form.second_choice_program_name} className="font-semibold text-sm rounded-lg py-2.5">
                        2nd Choice — {application.form.second_choice_program_name}
                      </SelectItem>
                    )}
                    {!application.form?.first_choice_program_name && !application.form?.second_choice_program_name && (
                      <SelectItem value="__none__" disabled className="font-semibold text-sm rounded-lg py-2.5">No choices on record</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {approvedCourse && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    This will be recorded as the <strong className="text-slate-600 dark:text-slate-350">approved_course</strong> and <strong className="text-slate-600 dark:text-slate-350">finalised_course</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Recommend — all courses available for this program type */}
            {decision === "recommend" && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 block">Recommended Course</label>
                <Select
                  value={approvedCourse}
                  onValueChange={setApprovedCourse}
                  disabled={reviewing}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm focus:ring-[#6b21a8] focus:border-[#6b21a8] font-bold text-slate-700 dark:text-slate-200 py-6">
                    <SelectValue placeholder={programs.length ? "Select a course recommendation" : "Loading courses…"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-xl border-slate-100 shadow-xl dark:border-slate-800">
                    {programs.map((p) => (
                      <SelectItem key={p.program_id} value={p.program} className="font-semibold text-sm rounded-lg py-2.5">
                        {p.program}
                        {p.department ? (
                          <span className="text-xs font-medium text-slate-400 ml-1.5">— {p.department}</span>
                        ) : null}
                      </SelectItem>
                    ))}
                    {programs.length === 0 && (
                      <SelectItem value="__none__" disabled className="font-semibold text-sm rounded-lg py-2.5">No courses found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {approvedCourse && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    This recommendation will be recorded as the <strong className="text-slate-600 dark:text-slate-350">approved_course</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleReview}
                disabled={reviewing || (needsCourse && !approvedCourse)}
                className={`gap-2 min-w-[200px] font-bold text-xs uppercase tracking-wider rounded-xl py-5 shadow-md transition-all duration-300 hover:scale-[1.01] ${
                  decision === "accept"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10 hover:shadow-emerald-600/20"
                    : decision === "reject"
                    ? "bg-[#881337] hover:bg-[#70112c] text-white shadow-rose-600/10 hover:shadow-rose-600/20"
                    : "bg-[#6b21a8] hover:bg-[#581c87] text-white shadow-purple-600/10 hover:shadow-purple-600/20"
                }`}
              >
                {reviewing ? (
                  <><span className="animate-spin text-sm">⟳</span> Processing...</>
                ) : decision === "accept" ? (
                  <><Check className="h-4 w-4" /> Accept Application</>
                ) : decision === "reject" ? (
                  <><X className="h-4 w-4" /> Reject Application</>
                ) : (
                  <>→ Submit Recommendation</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationDetail {
  applicant: any;
  form: any;
  documents: any[];
  reviews: any[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30",
  submitted: "bg-[#6b21a8]/5 text-[#6b21a8] border border-[#6b21a8]/10 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  screening: "bg-purple-50 text-purple-700 border border-purple-200/50 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30",
  admitted: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();

  // Keep applicantId as a string — it's a UUID, not an integer
  const applicantId = (params?.id as string) || "";

  const { user, isAuthenticated } = useAuth();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingLetter, setSendingLetter] = useState(false);
  const [letterSent, setLetterSent] = useState(false);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admissionofficer") {
      router.replace("/staff/login");
    }
  }, [isAuthenticated, user, router]);

  // ── Load application data ───────────────────────────────────────────────────
  const loadApplicationDetail = useCallback(async () => {
    if (!applicantId || applicantId === "NaN" || applicantId === "") {
      setError("Invalid application ID.");
      setLoading(false);
      return;
    }
    try {
      const response = await ApiClient.getApplicationDetails(applicantId);
      setApplication(response as ApplicationDetail);
    } catch (err) {
      setError("Failed to load application. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    loadApplicationDetail();
  }, [loadApplicationDetail]);

  useEffect(() => {
    if (!application) return;

    const passportDoc = application.documents?.find(
      (d) =>
        d.document_type?.toLowerCase().includes("passport") ||
        d.original_filename?.toLowerCase().includes("passport")
    );

    const docId = passportDoc?.document_id || passportDoc?.id;
    if (!docId) return;

    let objectUrl: string | null = null;

    const fetchPassport = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000/e-portal/api";
        const response = await fetch(
          `${baseUrl}/applicant/download-document/${docId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setPassportUrl(objectUrl);
        }
      } catch (e) {
        console.error("Failed to fetch passport", e);
      }
    };

    fetchPassport();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [application?.applicant?.id]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleSendLetter = async () => {
    setSendingLetter(true);
    setError(null);
    try {
      await ApiClient.sendAdmissionLetter(applicantId);
      setLetterSent(true);
      await loadApplicationDetail();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send admission letter"
      );
    } finally {
      setSendingLetter(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6b21a8]/5 via-slate-50/30 to-[#881337]/[0.02] dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6b21a8] mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading applicant portfolio...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6b21a8]/5 via-slate-50/30 to-[#881337]/[0.02] dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#881337]" />
          
          <CardContent className="py-12 text-center px-6">
            <AlertCircle className="h-12 w-12 text-[#881337] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              Application Not Found
            </h3>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-6 max-w-xs mx-auto">
              {error || "The candidate portfolio requested could not be located in records."}
            </p>
            <Link href="/admission_officer/applications">
              <Button className="bg-[#6b21a8] hover:bg-[#581c87] text-white font-bold text-xs uppercase tracking-wider rounded-xl px-5 py-2.5">
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6b21a8]/5 via-slate-50/30 to-[#881337]/[0.02] dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/admission_officer/applications"
            className="text-[#6b21a8] hover:text-[#881337] font-semibold flex items-center gap-1.5 text-sm transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Applications
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Applicant <span className="bg-gradient-to-r from-[#6b21a8] to-[#881337] bg-clip-text text-transparent">Portfolio</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm mt-1">
                UUID: <span className="font-mono text-slate-400 dark:text-slate-500 text-xs">{application.applicant.id}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status:</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                statusColors[application.applicant.application_status] || "bg-slate-100 text-slate-700"
              }`}>
                {application.applicant.application_status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Acceptance fee banner */}
          {(application.applicant.application_status === "admitted" ||
            application.applicant.application_status === "accepted") && (
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl border gap-4 shadow-sm relative overflow-hidden ${
                application.applicant.has_paid_acceptance_fee
                  ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30"
                  : "bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30"
              }`}
            >
              {/* Subtle visual accent bar */}
              <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                application.applicant.has_paid_acceptance_fee ? "bg-emerald-500" : "bg-amber-500"
              }`} />
              
              <div className="flex items-center gap-3.5 pl-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                    application.applicant.has_paid_acceptance_fee
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/20"
                      : "bg-amber-500 shadow-sm shadow-amber-500/20"
                  }`}
                />
                <div>
                  <p
                    className={`font-extrabold text-sm ${
                      application.applicant.has_paid_acceptance_fee
                        ? "text-emerald-800 dark:text-emerald-455"
                        : "text-amber-800 dark:text-amber-455"
                    }`}
                  >
                    {application.applicant.has_paid_acceptance_fee
                      ? "Acceptance Fee Paid"
                      : "Awaiting Acceptance Fee Payment"}
                  </p>
                  <p
                    className={`text-xs mt-0.5 font-semibold ${
                      application.applicant.has_paid_acceptance_fee
                        ? "text-emerald-600/90 dark:text-emerald-500/80"
                        : "text-amber-600/90 dark:text-amber-500/80"
                    }`}
                  >
                    {application.applicant.has_paid_acceptance_fee
                      ? "Admission letter can now be sent to this applicant."
                      : "The admission letter will be available once the applicant pays the acceptance fee."}
                  </p>
                </div>
              </div>
              {application.applicant.has_paid_acceptance_fee && (
                <Button
                  onClick={handleSendLetter}
                  disabled={sendingLetter || letterSent}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 py-2.5 text-xs transition-all duration-300 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto"
                >
                  {sendingLetter ? (
                    <>
                      <span className="animate-spin text-sm">⟳</span> Sending...
                    </>
                  ) : letterSent ? (
                    <>✓ Letter Sent</>
                  ) : (
                    <>📧 Send Admission Letter</>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Global error */}
        {error && (
          <Card className="mb-6 border-rose-200 bg-rose-50/80 dark:border-rose-900/55 dark:bg-rose-950/20 rounded-2xl overflow-hidden">
            <CardContent className="p-5 flex gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-45 shrink-0" />
              <p className="text-sm text-rose-800 dark:text-rose-350 font-bold">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="info" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl shadow-inner border border-slate-200/20">
            <TabsTrigger 
              value="info" 
              className="rounded-lg font-bold text-xs uppercase tracking-wider py-2.5 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6b21a8] data-[state=active]:to-[#881337] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 dark:text-slate-450"
            >
              Information
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="rounded-lg font-bold text-xs uppercase tracking-wider py-2.5 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6b21a8] data-[state=active]:to-[#881337] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 dark:text-slate-450"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="rounded-lg font-bold text-xs uppercase tracking-wider py-2.5 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6b21a8] data-[state=active]:to-[#881337] data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 dark:text-slate-450"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            {/* passportUrl lives in parent — never re-fetched on tab switch */}
            <ApplicantInfoTab
              applicant={application.applicant}
              form={application.form}
              passportUrl={passportUrl}
            />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsTab documents={application.documents} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsTab
              application={application}
              onReviewSuccess={loadApplicationDetail}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}