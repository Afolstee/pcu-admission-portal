"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient, AdmissionLetterData, PaymentTransaction } from "@/lib/api";
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
  LogOut,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Download,
  Settings,
  ChevronDown,
} from "lucide-react";

import FirstLoginPasswordChange from "@/components/FirstLoginPasswordChange";
import FsmsAdmissionLetter from "@/components/FsmsAdmissionLetter";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, student, isAuthenticated, logout, isLoading } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [regStatus, setRegStatus] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [applicantStatus, setApplicantStatus] = useState<any>(null);
  const [admissionLetter, setAdmissionLetter] =
    useState<AdmissionLetterData | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    [],
  );
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);

  const fetchStatus = async () => {
    if (isAuthenticated && !student?.is_first_login) {
      try {
        setLoadingStatus(true);
        const data = await ApiClient.getStudentCourses("First"); // Check first semester by default
        setRegStatus(data.registration_status);
      } catch (err) {
        console.error("Error fetching reg status:", err);
      } finally {
        setLoadingStatus(false);
      }
    }
  };

  const fetchExtraData = async () => {
    if (!isAuthenticated) return;
    try {
      const statusRes = await ApiClient.getApplicantStatus();
      setApplicantStatus(statusRes.applicant);

      try {
        const letterResponse = await ApiClient.getAdmissionLetter();
        setAdmissionLetter(letterResponse);
      } catch (e) {}

      try {
        const pHistory = await ApiClient.getPaymentHistory();
        setPaymentHistory(pHistory.payment_history);
      } catch (e) {}
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && student?.is_first_login) {
      setShowPasswordChange(true);
    }
  }, [isLoading, isAuthenticated, student]);

  useEffect(() => {
    fetchStatus();
    fetchExtraData();
  }, [isAuthenticated, student]);

  const handlePrintPDF = async () => {
    try {
      setPrintLoading(true);
      const pdfBlob = await ApiClient.printAdmissionLetterPDF();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admission_letter_${admissionLetter?.reference || "letter"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPrintLoading(false);
    }
  };

  const handleDownloadMedicalForm = async () => {
    try {
      setDownloading("medical_form");
      const blob = await ApiClient.downloadMedicalForm();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `medical_examination_form.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading medical form:", err);
      alert(
        err instanceof Error ? err.message : "Failed to download medical form",
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadNotice = async () => {
    try {
      setDownloading("admission_notice");
      const blob = await ApiClient.downloadAdmissionNotice();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pcu_admission_notice_2025.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading notice:", err);
      alert("Failed to download admission notice");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAffidavit = async () => {
    try {
      setDownloading("affidavit");
      const blob = await ApiClient.downloadAffidavitForm();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pcu_affidavit_for_good_conduct.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading affidavit:", err);
      alert("Failed to download affidavit form");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadReceipt = async (receipt_no: string, type: string) => {
    try {
      setDownloading(`receipt_${receipt_no}`);
      const blob = await ApiClient.downloadPaymentReceipt(receipt_no);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_${type}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading receipt:", err);
      alert("Failed to download receipt");
    } finally {
      setDownloading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
        <FirstLoginPasswordChange
          onComplete={() => setShowPasswordChange(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="col-span-full md:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-r from-[#6b21a8] to-[#881337] text-white relative group">
            <div className="absolute top-0 right-0 p-8 opacity-15 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-24 h-24" />
            </div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome, {user?.name}
              </CardTitle>
              <CardDescription className="text-white/80 font-medium text-sm mt-1">
                Matric Number: {student?.matric_number}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {/* Desktop Badges */}
              <div className="hidden md:flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-white/15 text-white hover:bg-white/25 border border-white/10 backdrop-blur-md px-3 py-1 font-semibold"
                >
                  {student?.current_level}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/15 text-white hover:bg-white/25 border border-white/10 backdrop-blur-md px-3 py-1 font-semibold"
                >
                  {student?.session}
                </Badge>
              </div>
              
              {/* Mobile String representation */}
              <div className="md:hidden mt-2.5 text-xs font-semibold text-white/90 bg-white/10 border border-white/15 backdrop-blur-md rounded-lg p-2.5 inline-flex items-center gap-1 shadow-inner">
                <span>Level: <span className="font-bold text-white">{student?.current_level}</span></span>
                <span className="mx-1 text-white/30">&bull;</span>
                <span>Session: <span className="font-bold text-white">{student?.session}</span></span>
              </div>
            </CardContent>
          </Card>

          <Card className="hidden md:flex shadow-md border-[#6b21a8]/10 bg-[#6b21a8]/5 flex-col justify-center items-center text-center p-6 space-y-2 hover:scale-[1.01] transition-transform duration-200">
            <div className="bg-[#6b21a8]/10 p-3 rounded-2xl mb-1 text-[#6b21a8]">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b21a8]/70">
              Current Level
            </p>
            <p className="text-2xl font-bold text-[#6b21a8]">{student?.current_level}</p>
          </Card>

          <Card className="hidden md:flex shadow-md border-[#881337]/10 bg-[#881337]/5 flex-col justify-center items-center text-center p-6 space-y-2 hover:scale-[1.01] transition-transform duration-200">
            <div className="bg-[#881337]/10 p-3 rounded-2xl mb-1 text-[#881337]">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#881337]/70">
              Session
            </p>
            <p className="text-2xl font-bold text-[#881337]">{student?.session}</p>
          </Card>
        </div>

        {/* Action Widgets */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Course Registration Widget */}
          <Card className="shadow-lg border border-[#6b21a8]/10 hover:border-[#6b21a8]/25 transition-all duration-300 group overflow-hidden bg-[#6b21a8]/[0.01]">
            <div className="h-2 bg-gradient-to-r from-[#6b21a8] to-[#6b21a8]/80 w-full shadow-sm" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#6b21a8]/10 p-2 rounded-xl group-hover:bg-[#6b21a8]/20 transition-colors duration-300 text-[#6b21a8]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Course Registration</CardTitle>
              </div>
              <CardDescription className="text-slate-500 mt-1">
                Register your courses for the current semester. Ensure you
                select all compulsory and core courses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {regStatus === "submitted" ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 font-bold py-6 text-base border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 hover:text-emerald-800 transition-all duration-200 shadow-sm"
                  onClick={() => router.push("/student/registration")}
                >
                  View Registration
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </Button>
              ) : (
                <Button
                  className="w-full gap-2 font-bold py-6 text-base bg-[#6b21a8] hover:bg-[#581c87] text-white shadow-lg shadow-purple-500/15 hover:shadow-purple-500/25 transition-all duration-200 hover:scale-[1.01]"
                  onClick={() => router.push("/student/registration")}
                >
                  Go to Registration
                  <BookOpen className="w-5 h-5" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Profile & Settings Widget */}
          <Card className="shadow-lg border border-[#881337]/10 hover:border-[#881337]/25 transition-all duration-300 group overflow-hidden bg-[#881337]/[0.01]">
            <div className="h-2 bg-gradient-to-r from-[#881337] to-[#881337]/80 w-full shadow-sm" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#881337]/10 p-2 rounded-xl group-hover:bg-[#881337]/20 transition-colors duration-300 text-[#881337]">
                  <User className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Profile Information</CardTitle>
              </div>
              <CardDescription className="text-slate-500 mt-1">
                View your student profile details and account status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/50 bg-white">
                  <span className="text-sm font-semibold text-slate-500">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/50 bg-white">
                  <span className="text-sm font-semibold text-slate-500">
                    Portal Username
                  </span>
                  <span className="text-sm font-bold font-mono text-[#6b21a8] bg-[#6b21a8]/5 p-1 px-3 rounded-lg border border-[#6b21a8]/10">
                    {user?.username || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/50 bg-white">
                  <span className="text-sm font-semibold text-slate-500">
                    Email Address
                  </span>
                  <span className="text-sm font-bold text-slate-800">{user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-Only Collapsible Dropdowns */}
        <div className="block md:hidden space-y-4 mt-8">
          {/* 1. Official Admission Documents Collapsible */}
          <div className="border border-[#6b21a8]/10 rounded-2xl overflow-hidden bg-white shadow-md">
            <button
              onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
              className="w-full flex items-center justify-between p-5 bg-[#6b21a8]/5 text-left transition-colors hover:bg-[#6b21a8]/10 duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#6b21a8]/10 p-2 rounded-lg text-[#6b21a8]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Official Admission Documents</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Admission Letter, Medical Form, & Notices</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isDocumentsOpen ? "rotate-180" : ""}`} />
            </button>

            {isDocumentsOpen && (
              <div className="p-4 border-t border-slate-50 bg-slate-50/30 space-y-4">
                {/* Admission Letter */}
                <div className="bg-white border border-[#6b21a8]/10 rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-sm text-slate-800 mb-1">
                    Provisional Admission Letter
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Your official letter of admission for your program.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowLetter(!showLetter)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#6b21a8]/25 text-[#6b21a8] hover:bg-[#6b21a8]/5 text-xs font-semibold py-3.5 h-auto"
                      disabled={!admissionLetter}
                    >
                      {showLetter ? "Hide Letter" : "Preview Letter"}
                    </Button>
                    <Button
                      onClick={handlePrintPDF}
                      size="sm"
                      className="flex-1 gap-1.5 bg-[#6b21a8] hover:bg-[#581c87] text-white text-xs font-semibold py-3.5 h-auto"
                      disabled={printLoading || !admissionLetter}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {printLoading ? "..." : "Download PDF"}
                    </Button>
                  </div>
                </div>

                {/* Medical Form */}
                <div className="bg-white border border-[#881337]/10 rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-sm text-slate-800 mb-1">
                    Medical Examination Form
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Print and take to a certified hospital for examination.
                  </p>
                  <Button
                    onClick={handleDownloadMedicalForm}
                    disabled={
                      downloading === "medical_form" ||
                      !applicantStatus?.has_paid_tuition
                    }
                    className="w-full gap-1.5 bg-[#881337] hover:bg-[#70112c] text-white text-xs font-semibold py-3.5 h-auto"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloading === "medical_form"
                      ? "Downloading..."
                      : "Download PDF"}
                  </Button>
                </div>

                {/* Additional Forms */}
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-sm text-slate-800 mb-1">Resumption Notice & Affidavit</h4>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Official resumption notice and good conduct affidavit.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={handleDownloadNotice}
                      variant="outline"
                      size="sm"
                      disabled={downloading === "admission_notice"}
                      className="w-full gap-1.5 border-[#6b21a8]/25 text-[#6b21a8] hover:bg-[#6b21a8]/5 text-xs font-semibold py-3 h-auto justify-center"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === "admission_notice" ? "..." : "Admission Notice"}
                    </Button>
                    <Button
                      onClick={handleDownloadAffidavit}
                      variant="outline"
                      size="sm"
                      disabled={downloading === "affidavit"}
                      className="w-full gap-1.5 border-[#881337]/25 text-[#881337] hover:bg-[#881337]/5 text-xs font-semibold py-3 h-auto justify-center"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {downloading === "affidavit" ? "..." : "Conduct Affidavit"}
                    </Button>
                  </div>
                </div>

                {/* Admission Letter Live Preview container inside Mobile dropdown */}
                {showLetter && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50 p-3 mt-4">
                    <div className="bg-white p-4 shadow-lg mx-auto max-w-[850px] overflow-x-auto text-[10px]">
                      {admissionLetter ? (
                        <FsmsAdmissionLetter {...admissionLetter} />
                      ) : (
                        <div className="text-center py-6">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6b21a8] mx-auto mb-2" />
                          <p className="text-slate-500 text-xs">Loading letter details...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Payment Transactions Collapsible */}
          <div className="border border-[#881337]/10 rounded-2xl overflow-hidden bg-white shadow-md">
            <button
              onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
              className="w-full flex items-center justify-between p-5 bg-[#881337]/5 text-left transition-colors hover:bg-[#881337]/10 duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#881337]/10 p-2 rounded-lg text-[#881337]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Payment Transactions</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Download payment receipts</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isPaymentsOpen ? "rotate-180" : ""}`} />
            </button>

            {isPaymentsOpen && (
              <div className="p-4 border-t border-slate-50 bg-slate-50/30 space-y-2">
                {paymentHistory.map((pt) => (
                  <div
                    key={pt.transaction_id}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 text-xs transition-colors duration-200"
                  >
                    <span className="capitalize font-bold text-slate-700">
                      {pt.payment_type.replace("_", " ")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[#6b21a8] hover:text-[#581c87] hover:bg-[#6b21a8]/5 font-bold"
                      onClick={() =>
                        handleDownloadReceipt(pt.receipt_no, pt.payment_type)
                      }
                      disabled={downloading === `receipt_${pt.receipt_no}`}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      PDF
                    </Button>
                  </div>
                ))}
                {paymentHistory.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-4 italic bg-white rounded-xl border border-dashed">
                    No payment records found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Admission Letter - From Applicant flow into Student dashboard */}
        <Card
          id="admission-documents"
          className="hidden md:block mb-8 overflow-hidden border border-slate-100 shadow-xl mt-8 bg-white"
        >
          <div className="bg-gradient-to-r from-[#6b21a8]/5 via-[#881337]/5 to-transparent p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  Official Admission Documents
                </CardTitle>
                <CardDescription className="text-sm mt-1 text-slate-500">
                  Access and download your official enrollment documents
                  anytime.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Admission Letter Download */}
              <div className="bg-gradient-to-br from-[#6b21a8]/[0.02] to-transparent border border-[#6b21a8]/10 hover:border-[#6b21a8]/35 transition-all duration-300 rounded-xl p-5 shadow-sm group flex flex-col justify-between">
                <div>
                  <div className="bg-[#6b21a8]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#6b21a8]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 mb-1">
                    Provisional Admission Letter
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Your official letter of admission for your program.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowLetter(!showLetter)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#6b21a8]/25 text-[#6b21a8] hover:bg-[#6b21a8]/5 text-xs font-semibold py-4"
                    disabled={!admissionLetter}
                  >
                    {showLetter ? "Hide" : "Preview"}
                  </Button>
                  <Button
                    onClick={handlePrintPDF}
                    size="sm"
                    className="flex-1 gap-2 bg-[#6b21a8] hover:bg-[#581c87] text-white shadow-md shadow-purple-500/10 text-xs font-semibold py-4"
                    disabled={printLoading || !admissionLetter}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {printLoading ? "..." : "PDF"}
                  </Button>
                </div>
              </div>

              {/* Medical Form Download */}
              <div className="bg-gradient-to-br from-[#881337]/[0.02] to-transparent border border-[#881337]/10 hover:border-[#881337]/35 transition-all duration-300 rounded-xl p-5 shadow-sm group flex flex-col justify-between">
                <div>
                  <div className="bg-[#881337]/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#881337]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 mb-1">
                    Medical Examination Form
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Print and take to a certified hospital for examination.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadMedicalForm}
                  disabled={
                    downloading === "medical_form" ||
                    !applicantStatus?.has_paid_tuition
                  }
                  className="w-full gap-2 bg-[#881337] hover:bg-[#70112c] text-white shadow-md shadow-rose-900/10 text-xs font-semibold py-4"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloading === "medical_form"
                    ? "Downloading..."
                    : "Download PDF"}
                </Button>
              </div>

              {/* Additional Forms Download */}
              <div className="bg-gradient-to-br from-[#6b21a8]/[0.01] to-[#881337]/[0.01] border border-slate-100 hover:border-slate-200 transition-all duration-300 rounded-xl p-5 shadow-sm group flex flex-col justify-between">
                <div>
                  <div className="bg-purple-100/60 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#6b21a8]">
                    <Settings className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 mb-1">Notice & Affidavit</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Official resumption notice and good conduct affidavit.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleDownloadNotice}
                    variant="outline"
                    size="sm"
                    disabled={downloading === "admission_notice"}
                    className="w-full gap-2 border-[#6b21a8]/25 text-[#6b21a8] hover:bg-[#6b21a8]/5 text-xs font-semibold py-4 justify-center"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloading === "admission_notice"
                      ? "..."
                      : "Admission Notice"}
                  </Button>
                  <Button
                    onClick={handleDownloadAffidavit}
                    variant="outline"
                    size="sm"
                    disabled={downloading === "affidavit"}
                    className="w-full gap-2 border-[#881337]/25 text-[#881337] hover:bg-[#881337]/5 text-xs font-semibold py-4 justify-center"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {downloading === "affidavit" ? "..." : "Conduct Affidavit"}
                  </Button>
                </div>
              </div>

              {/* Receipts Section */}
              <div className="bg-gradient-to-br from-slate-50/50 to-transparent border border-slate-100 hover:border-slate-200 transition-all duration-300 rounded-xl p-5 shadow-sm group flex flex-col justify-between">
                <div>
                  <div className="bg-rose-100/60 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 text-[#881337]">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 mb-1">Payment Receipts</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Download official receipts for your completed payments.
                  </p>
                </div>
                <div className="space-y-2">
                  {paymentHistory.map((pt) => (
                    <div
                      key={pt.transaction_id}
                      className="flex items-center justify-between p-2 bg-white hover:bg-slate-50 rounded-lg border border-slate-100 text-xs transition-colors duration-200"
                    >
                      <span className="capitalize font-semibold text-slate-600">
                        {pt.payment_type.replace("_", " ")}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[#6b21a8] hover:text-[#581c87] hover:bg-[#6b21a8]/5 font-bold"
                        onClick={() =>
                          handleDownloadReceipt(pt.receipt_no, pt.payment_type)
                        }
                        disabled={downloading === `receipt_${pt.receipt_no}`}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))}
                  {paymentHistory.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-2 italic bg-slate-50 rounded-lg border border-dashed">
                      No payment records found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {showLetter && (
              <div className="mt-8 border border-slate-100 rounded-xl overflow-hidden shadow-inner bg-slate-50 p-8">
                <div className="bg-white p-12 shadow-2xl mx-auto max-w-[850px]">
                  {admissionLetter ? (
                    <FsmsAdmissionLetter {...admissionLetter} />
                  ) : (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6b21a8] mx-auto mb-4" />
                      <p className="text-slate-500 text-sm mt-4">
                        Loading admission letter details...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
