"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient, ApplicantStatus, AdmissionLetterData, PaymentTransaction } from "@/lib/api";
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
  FileText,
  DollarSign,
  Download,
  Settings,
  Printer,
} from "lucide-react";
import { useProgramGuard } from "@/hooks/useProgramGuard";
import FsmsAdmissionLetter from "@/components/FsmsAdmissionLetter";
import RecommendationCard from "@/components/RecommendationCard";
import { Recommendation } from "@/lib/api";

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
  const [admissionLetter, setAdmissionLetter] =
    useState<AdmissionLetterData | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  useProgramGuard();

  const handlePrintPDF = async () => {
    try {
      setPrintLoading(true);
      const pdfBlob = await ApiClient.printAdmissionLetterPDF();

      // Create a temporary URL for the blob
      const url = URL.createObjectURL(pdfBlob);

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `admission_letter_${admissionLetter?.reference || "letter"}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setPrintLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingRecommendations(true);
      const response = await ApiClient.getRecommendations();
      setRecommendations(response.recommendations || []);
      setRecommendationError(null);
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setRecommendationError("Failed to load recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleRespondToRecommendation = async (
    review_id: number,
    response: "accepted" | "declined"
  ) => {
    try {
      await ApiClient.respondToRecommendation(review_id, response);
      // Reload recommendations to update the UI
      await loadRecommendations();
      // Also refresh status in case program changed
      const updatedStatus = await ApiClient.getApplicantStatus();
      setStatus(updatedStatus.applicant);
    } catch (err) {
      console.error("Error responding to recommendation:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadStatus = async () => {
      try {
        const response = await ApiClient.getApplicantStatus();
        setStatus(response.applicant);

        // If admitted, fetch admission letter data
        if (response.applicant.admission_status === "admitted") {
          try {
            const letterResponse = await ApiClient.getAdmissionLetter();
            setAdmissionLetter(letterResponse);
          } catch (err) {
            console.error("Error loading admission letter:", err);
          }
        }
      } catch (err) {
        console.error("Error loading status:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadPaymentHistory = async () => {
      try {
        const response = await ApiClient.getPaymentHistory();
        setPaymentHistory(response.payment_history);
      } catch (err) {
        console.error("Error loading payment history:", err);
      }
    };

    loadStatus();
    loadRecommendations();
    loadPaymentHistory();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
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
      alert(err instanceof Error ? err.message : "Failed to download medical form");
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

  const handleDownloadReceipt = async (transactionId: number, type: string) => {
    try {
      setDownloading(`receipt_${transactionId}`);
      const blob = await ApiClient.downloadPaymentReceipt(transactionId);
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

  const applicationStep = status
    ? {
        pending: 1,
        submitted: 2,
        under_review: 2,
        accepted: 3,
        rejected: 1,
        recommended: 2,
      }[status.application_status] || 1
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Course Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.review_id}
                  recommendation={rec}
                  onRespond={handleRespondToRecommendation}
                  loading={loadingRecommendations}
                />
              ))}
            </div>
          </div>
        )}

        {recommendationError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-sm text-red-800">{recommendationError}</p>
            </CardContent>
          </Card>
        )}

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
                          className="w-full gap-2"
                          onClick={() => router.push("/applicant/payment?type=acceptance_fee")}
                        >
                          <DollarSign className="h-4 w-4" />
                          Pay Acceptance Fee
                        </Button>
                      )}
                      {!status?.has_paid_tuition && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => router.push("/applicant/payment?type=tuition")}
                        >
                          <DollarSign className="h-4 w-4" />
                          Pay Tuition
                        </Button>
                      )}
                      {status?.has_paid_acceptance_fee &&
                        status?.has_paid_tuition && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                            onClick={() => {
                              const el = document.getElementById('admission-documents');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Access Admission Documents
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admission Letter */}
        {status?.admission_status === "admitted" && (
          <Card id="admission-documents" className="mb-8 overflow-hidden border-2 border-primary/20 shadow-xl">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-primary">Official Admission Documents</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Congratulations! You have completed all requirements. Download your official documents below.
                  </CardDescription>
                </div>
                <div className="hidden sm:block">
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <LogOut className="h-4 w-4 rotate-180" />
                    Enrolled Successfully
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Admission Letter Download */}
                <div className="bg-background border rounded-xl p-5 hover:border-primary/50 transition-all group shadow-sm">
                  <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-blue-600 h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Provisional Admission Letter</h4>
                  <p className="text-sm text-muted-foreground mb-4">Your official letter of admission for {status.program_name}.</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setShowLetter(!showLetter)} 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      disabled={!admissionLetter}
                    >
                      {showLetter ? "Close Preview" : "Preview"}
                    </Button>
                    <Button onClick={handlePrintPDF} size="sm" className="flex-1 gap-2" disabled={printLoading}>
                      <Download className="h-4 w-4" />
                      {printLoading ? "..." : "PDF"}
                    </Button>
                  </div>
                </div>

                {/* Medical Form Download */}
                <div className="bg-background border rounded-xl p-5 hover:border-primary/50 transition-all group shadow-sm">
                  <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-green-600 h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Medical Examination Form</h4>
                  <p className="text-sm text-muted-foreground mb-4">Print and take to a certified hospital for examination.</p>
                  <Button 
                    onClick={handleDownloadMedicalForm} 
                    disabled={downloading === "medical_form" || !status?.has_paid_tuition} 
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {downloading === "medical_form" ? "Downloading..." : "Download PDF"}
                  </Button>
                </div>

                {/* Additional Forms Download */}
                <div className="bg-background border rounded-xl p-5 hover:border-primary/50 transition-all group shadow-sm">
                  <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="text-orange-600 h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Notice & Affidavit</h4>
                  <p className="text-sm text-muted-foreground mb-4">Official resumption notice and good conduct affidavit.</p>
                  <div className="space-y-2">
                    <Button 
                      onClick={handleDownloadNotice} 
                      variant="outline"
                      size="sm"
                      disabled={downloading === "admission_notice"} 
                      className="w-full gap-2 justify-start"
                    >
                      <Download className="h-4 w-4 text-orange-600" />
                      {downloading === "admission_notice" ? "..." : "Admission Notice"}
                    </Button>
                    <Button 
                      onClick={handleDownloadAffidavit} 
                      variant="outline"
                      size="sm"
                      disabled={downloading === "affidavit"} 
                      className="w-full gap-2 justify-start"
                    >
                      <Download className="h-4 w-4 text-orange-600" />
                      {downloading === "affidavit" ? "..." : "Conduct Affidavit"}
                    </Button>
                  </div>
                </div>

                {/* Receipts Section */}
                <div className="bg-background border rounded-xl p-5 hover:border-primary/50 transition-all group shadow-sm">
                  <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="text-purple-600 h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Payment Receipts</h4>
                  <p className="text-sm text-muted-foreground mb-4">Download official receipts for your completed payments.</p>
                  <div className="space-y-2">
                    {paymentHistory.map((pt) => (
                      <div key={pt.transaction_id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border text-sm">
                        <span className="capitalize">{pt.payment_type.replace('_', ' ')}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleDownloadReceipt(pt.transaction_id, pt.payment_type)}
                          disabled={downloading === `receipt_${pt.transaction_id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    ))}
                    {paymentHistory.length === 0 && (
                      <p className="text-xs text-center text-muted-foreground py-2 italic">No payment records found.</p>
                    )}
                  </div>
                </div>
              </div>

              {showLetter && (
                <div className="mt-8 border rounded-xl overflow-hidden shadow-inner bg-slate-50 p-8">
                  <div className="bg-white p-12 shadow-2xl mx-auto max-w-[850px]">
                    {admissionLetter ? (
                      <FsmsAdmissionLetter {...admissionLetter} />
                    ) : (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-muted-foreground mt-4">Loading admission letter details...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
