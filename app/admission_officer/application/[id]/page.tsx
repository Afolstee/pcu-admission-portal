"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  Download,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ApplicantInfoTab({ applicant, form, documents }: { applicant: any; form: any; documents: any[] }) {
  const [passportUrl, setPassportUrl] = useState<string | null>(null);

  const passportDoc = documents?.find(d => 
    d.document_type?.toLowerCase().includes('passport') || 
    d.original_filename?.toLowerCase().includes('passport')
  );

  useEffect(() => {
    if (passportDoc?.id) {
      const fetchPassport = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/e-portal/api";
          const response = await fetch(`${baseUrl}/applicant/download-document/${passportDoc.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPassportUrl(url);
          }
        } catch (e) {
          console.error("Failed to fetch passport", e);
        }
      };
      fetchPassport();
    }
    return () => {
      if (passportUrl) URL.revokeObjectURL(passportUrl);
    };
  }, [passportDoc?.id]);

  let olevelResults = form?.olevel_results || [];

  return (
    <div className="space-y-8 bg-white border border-slate-100 p-8 shadow-sm rounded-lg">
      {/* Top Header Section with Passport */}
      <div className="flex flex-col md:flex-row items-start gap-8 border-b border-slate-100 pb-8">
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 shrink-0">
          {passportUrl ? (
            <img src={passportUrl} alt="Passport" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-slate-400 text-sm">No Photo</span>
            </div>
          )}
        </div>
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-bold text-slate-800 uppercase">{form?.full_name || applicant?.name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <p><strong>Email:</strong> {form?.email || applicant?.email}</p>
            <p><strong>Phone:</strong> {form?.phone_number || applicant?.phone_number}</p>
            <p><strong>Gender:</strong> {form?.gender || 'N/A'}</p>
          </div>
          <div className="pt-2">
             <Badge className="bg-[#6b357d] text-white">
                {form?.first_choice_program_name || applicant?.program_name}
             </Badge>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-6">
         <h3 className="text-lg font-medium text-slate-700 border-b border-slate-100 pb-2">Personal Details</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <p className="text-sm"><span className="text-slate-500 block">Date of Birth</span> {form?.date_of_birth || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Place of Birth</span> {form?.place_of_birth || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Nationality</span> {form?.nationality || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">State of Origin</span> {form?.state || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">LGA</span> {form?.lga || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Religion</span> {form?.religion || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Blood Group</span> {form?.blood_group || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Genotype</span> {form?.genotype || 'N/A'}</p>
            <p className="text-sm md:col-span-2"><span className="text-slate-500 block">Address</span> {form?.address || form?.contact_address || 'N/A'}</p>
         </div>
      </div>

      {/* Sponsor Details */}
      <div className="space-y-6">
         <h3 className="text-lg font-medium text-slate-700 border-b border-slate-100 pb-2">Sponsor Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <p className="text-sm"><span className="text-slate-500 block">Name</span> {form?.sponsor_name || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Phone</span> {form?.sponsor_phone_number || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Relationship</span> {form?.sponsor_relationship || 'N/A'}</p>
            <p className="text-sm md:col-span-2"><span className="text-slate-500 block">Address</span> {form?.sponsor_address || 'N/A'}</p>
         </div>
      </div>

      {/* Next of Kin Details */}
      <div className="space-y-6">
         <h3 className="text-lg font-medium text-slate-700 border-b border-slate-100 pb-2">Next of Kin Information</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <p className="text-sm"><span className="text-slate-500 block">Name</span> {form?.next_of_kin_name || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Phone</span> {form?.next_of_kin_phone_number || 'N/A'}</p>
            <p className="text-sm md:col-span-1"><span className="text-slate-500 block">Address</span> {form?.next_of_kin_address || 'N/A'}</p>
         </div>
      </div>

      {/* Program Choices */}
      <div className="space-y-6">
         <h3 className="text-lg font-medium text-slate-700 border-b border-slate-100 pb-2">Programme Choices</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p className="text-sm"><span className="text-slate-500 block">First Choice</span> {form?.first_choice_program_name || 'N/A'}</p>
            <p className="text-sm"><span className="text-slate-500 block">Second Choice</span> {form?.second_choice_program_name || 'N/A'}</p>
         </div>
      </div>

      {/* O'Level Results */}
      <div className="space-y-6">
         <h3 className="text-lg font-medium text-slate-700 border-b border-slate-100 pb-2">O'Level Results</h3>
         {olevelResults.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {olevelResults.map((exam: any, idx: number) => (
               <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                 <div className="flex justify-between items-center mb-3">
                   <h4 className="font-bold text-[#6b357d]">{exam.name || 'WAEC'} - Sitting {idx + 1}</h4>
                 </div>
                 <div className="text-xs text-slate-600 mb-3 space-y-1">
                   <p><strong>Reg Number:</strong> {exam.number}</p>
                   <p><strong>Exam Year:</strong> {exam.year}</p>
                 </div>
                 <table className="w-full text-left text-sm border-collapse">
                   <tbody>
                     {exam.subjects?.filter((s: any) => s.subject).map((s: any, sIdx: number) => (
                       <tr key={sIdx} className="border-b border-slate-200 last:border-0">
                         <td className="py-2 text-slate-700 uppercase">{s.subject}</td>
                         <td className="py-2 text-right font-bold">{s.grade || '-'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ))}
           </div>
         ) : (
           <p className="text-sm text-slate-500 italic">No O'Level results uploaded.</p>
         )}
      </div>

    </div>
  );
}

interface ApplicationDetail {
  applicant: any;
  form: any;
  documents: any[];
  reviews: any[];
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicantId = params?.id ? parseInt(params.id as string) : 0;
  const { user, isAuthenticated, logout } = useAuth();

  const [application, setApplication] = useState<ApplicationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [decision, setDecision] = useState<"accept" | "reject" | "recommend">("accept");
  const [reviewNotes, setReviewNotes] = useState("");
  const [recommendedProgram, setRecommendedProgram] = useState<string>("");
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [sendingLetter, setSendingLetter] = useState(false);
  const [letterSent, setLetterSent] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admissions_officer") {
      router.replace("/staff/login");
      return;
    }

    loadApplicationDetail();
    loadPrograms();
  }, [isAuthenticated, user, router]);

  const loadApplicationDetail = async () => {
    try {
      const response = await ApiClient.getApplicationDetails(applicantId);
      setApplication(response as ApplicationDetail);
    } catch (err) {
      setError("Failed to load application. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await ApiClient.getPrograms();
      // Build a unique department list for the recommendation dropdown
      const depts = response.programs || [];
      const seen = new Set<number>();
      const unique = depts.filter((d: any) => {
        if (seen.has(d.department_id)) return false;
        seen.add(d.department_id);
        return true;
      }).map((d: any) => ({ id: d.department_id, name: d.course }));
      setPrograms(unique);
    } catch (err) {
      console.error("Error loading programs:", err);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    setError(null);
    setReviewSuccess(null);

    try {
      const result = await ApiClient.reviewApplication(
        applicantId,
        decision,
        reviewNotes,
        decision === "recommend" ? parseInt(recommendedProgram) : undefined,
      );

      const labels: Record<string, string> = { accept: 'Accepted', reject: 'Rejected', recommend: 'Recommended for another program' };
      setReviewSuccess(`Application ${labels[decision] || 'reviewed'} successfully.`);

      // Refresh application
      await loadApplicationDetail();
      setReviewNotes("");
      setDecision("accept");
      setRecommendedProgram("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
    } finally {
      setReviewing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/staff/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-semibold mb-2">
              Application Not Found
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The application you're looking for could not be found.
            </p>
            <Link href="/admission_officer/applications">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    screening: "bg-purple-100 text-purple-800",
    admitted: "bg-green-100 text-green-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  const handleSendLetter = async () => {
    setSendingLetter(true);
    setError(null);
    try {
      await ApiClient.sendAdmissionLetter(applicantId);
      setLetterSent(true);
      await loadApplicationDetail();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send admission letter');
    } finally {
      setSendingLetter(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Link
          href="/admission_officer/applications"
          className="text-primary hover:underline text-sm mb-4 block"
        >
          ← Back to Applications
        </Link>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {application.applicant.name}
              </h1>
              <p className="text-muted-foreground">
                {application.applicant.email}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={statusColors[application.applicant.application_status] || 'bg-slate-100 text-slate-700'}>
                {application.applicant.application_status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Acceptance Fee Status Banner — shown for admitted or accepted applicants */}
          {(application.applicant.application_status === 'admitted' ||
            application.applicant.application_status === 'accepted') && (
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              application.applicant.has_paid_acceptance_fee
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  application.applicant.has_paid_acceptance_fee ? 'bg-green-500' : 'bg-amber-500'
                }`} />
                <div>
                  <p className={`font-semibold text-sm ${
                    application.applicant.has_paid_acceptance_fee ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {application.applicant.has_paid_acceptance_fee
                      ? 'Acceptance Fee Paid'
                      : 'Awaiting Acceptance Fee Payment'}
                  </p>
                  <p className={`text-xs ${
                    application.applicant.has_paid_acceptance_fee ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {application.applicant.has_paid_acceptance_fee
                      ? 'Admission letter can now be sent to this applicant.'
                      : 'The admission letter will be available once the applicant pays the acceptance fee.'}
                  </p>
                </div>
              </div>
              {application.applicant.has_paid_acceptance_fee && (
                <Button
                  onClick={handleSendLetter}
                  disabled={sendingLetter || letterSent}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  {sendingLetter ? (
                    <><span className="animate-spin">⟳</span> Sending...</>
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

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Applicant Info & Review Tabs */}
        <Tabs defaultValue="info" className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <ApplicantInfoTab applicant={application.applicant} form={application.form} documents={application.documents} />
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
                <p className="text-sm text-muted-foreground">{application.documents?.length || 0} document(s) uploaded</p>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.original_filename}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {(doc.document_type || '').replace(/_/g, ' ')}
                            {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ''}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-4 gap-1.5 shrink-0"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('auth_token');
                              const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/e-portal/api";
                              const res = await fetch(`${baseUrl}/applicant/download-document/${doc.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (!res.ok) throw new Error('Download failed');
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = doc.original_filename || 'document';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            } catch (e) {
                              console.error('Download failed', e);
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No documents uploaded
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            {/* Review History */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Review History</CardTitle>
              </CardHeader>
              <CardContent>
                {application.reviews && application.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {application.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.reviewed_by_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.reviewed_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              review.decision === 'accept' ? 'border-green-500 text-green-700' :
                              review.decision === 'reject' ? 'border-red-500 text-red-700' :
                              'border-blue-500 text-blue-700'
                            }
                          >
                            {review.decision === 'accept' ? 'Accepted' : review.decision === 'reject' ? 'Rejected' : 'Recommended'}
                          </Badge>
                        </div>
                        {review.review_notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {review.review_notes}
                          </p>
                        )}
                        {review.recommended_program && (
                          <p className="text-sm text-blue-600 mt-2">
                            Recommended Program: {review.recommended_program}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Success banner */}
            {reviewSuccess && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">{reviewSuccess}</p>
                </CardContent>
              </Card>
            )}

            {/* Add Review — visible for submitted or screening applications */}
            {(application.applicant.application_status === "submitted" ||
              application.applicant.application_status === "screening") && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Review Decision</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Current status: <span className="font-medium capitalize">{application.applicant.application_status}</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-5">

                  {/* Decision selector */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'accept', label: 'Accept', icon: '✓', cls: 'border-green-300 bg-green-50 text-green-800 ring-green-400' },
                      { value: 'reject', label: 'Reject', icon: '✗', cls: 'border-red-300 bg-red-50 text-red-800 ring-red-400' },
                      { value: 'recommend', label: 'Recommend', icon: '→', cls: 'border-blue-300 bg-blue-50 text-blue-800 ring-blue-400' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={reviewing}
                        onClick={() => setDecision(opt.value as any)}
                        className={`flex flex-col items-center gap-1 p-4 rounded-lg border-2 font-semibold text-sm transition-all ${
                          decision === opt.value
                            ? `${opt.cls} ring-2 ring-offset-1 shadow-sm`
                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Recommended program picker — only shown for 'recommend' */}
                  {decision === "recommend" && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Recommended Program</label>
                      <Select
                        value={recommendedProgram}
                        onValueChange={setRecommendedProgram}
                        disabled={reviewing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program to recommend" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Review Notes <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={reviewing}
                      className="w-full p-3 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={4}
                      placeholder="Add comments or observations about this application..."
                    />
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleReview}
                      disabled={reviewing || (decision === 'recommend' && !recommendedProgram)}
                      className={`gap-2 min-w-[180px] ${
                        decision === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                        decision === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {reviewing ? (
                        <><span className="animate-spin mr-1">⟳</span> Processing...</>
                      ) : decision === 'accept' ? (
                        <><Check className="h-4 w-4" /> Accept Application</>
                      ) : decision === 'reject' ? (
                        <><X className="h-4 w-4" /> Reject Application</>
                      ) : (
                        <>→ Submit Recommendation</>
                      )}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
