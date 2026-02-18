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

interface ApplicationDetail {
  applicant: any;
  form: any;
  documents: any[];
  reviews: any[];
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const applicantId = parseInt(params.id as string);
  const { user, isAuthenticated, logout } = useAuth();

  const [application, setApplication] = useState<ApplicationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [recommendation, setRecommendation] = useState<
    "accept" | "reject" | "recommend_other_program"
  >("accept");
  const [reviewNotes, setReviewNotes] = useState("");
  const [recommendedProgram, setRecommendedProgram] = useState<string>("");
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/auth/login");
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
      setPrograms((response as any).programs || []);
    } catch (err) {
      console.error("Error loading programs:", err);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    setError(null);

    try {
      await ApiClient.reviewApplication(
        applicantId,
        recommendation,
        reviewNotes,
        recommendation === "recommend_other_program"
          ? parseInt(recommendedProgram)
          : undefined,
      );

      // Refresh application
      await loadApplicationDetail();
      setReviewNotes("");
      setRecommendation("accept");
      setRecommendedProgram("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
    } finally {
      setReviewing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
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
            <Link href="/admin/applications">
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
    under_review: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    recommended: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={28}
              height={28}
              className="object-contain"
            />
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
        <Link
          href="/admin/applications"
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
            <Badge
              className={statusColors[application.applicant.application_status]}
            >
              {application.applicant.application_status.replace("_", " ")}
            </Badge>
          </div>
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
            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{application.applicant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{application.applicant.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {application.applicant.phone_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-medium">
                    {application.applicant.program_name}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Application Form Data */}
            {application.form && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Form</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  {Object.entries(application.form).map(([key, value]) => {
                    if (
                      key === "id" ||
                      key === "applicant_id" ||
                      key === "program_id" ||
                      key === "created_at" ||
                      key === "updated_at"
                    ) {
                      return null;
                    }
                    return (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="font-medium break-words">
                          {value ? String(value) : "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents">
            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{doc.original_filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type} |{" "}
                            {(doc.file_size / 1024).toFixed(2)}KB
                            {doc.is_compressed && (
                              <>
                                {" "}
                                (Compressed from{" "}
                                {(doc.file_size / 1024).toFixed(2)}KB)
                              </>
                            )}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" disabled>
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
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
                          <Badge variant="outline">
                            {review.recommendation.replace("_", " ")}
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

            {/* Add Review */}
            {application.applicant.application_status === "submitted" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Recommendation
                    </label>
                    <Select
                      value={recommendation}
                      onValueChange={(value: any) => setRecommendation(value)}
                      disabled={reviewing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accept">
                          Accept Application
                        </SelectItem>
                        <SelectItem value="reject">
                          Reject Application
                        </SelectItem>
                        <SelectItem value="recommend_other_program">
                          Recommend Other Program
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recommendation === "recommend_other_program" && (
                    <div>
                      <label className="text-sm font-medium">
                        Recommended Program
                      </label>
                      <Select
                        value={recommendedProgram}
                        onValueChange={setRecommendedProgram}
                        disabled={reviewing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs
                            .filter(
                              (p) => p.id !== application.applicant.program_id,
                            )
                            .map((program) => (
                              <SelectItem
                                key={program.id}
                                value={program.id.toString()}
                              >
                                {program.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Review Notes</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={reviewing}
                      className="w-full p-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={4}
                      placeholder="Add any comments or notes about this application..."
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    {recommendation === "accept" && (
                      <Button
                        onClick={handleReview}
                        disabled={reviewing}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        {reviewing ? "Accepting..." : "Accept Application"}
                      </Button>
                    )}
                    {recommendation === "reject" && (
                      <Button
                        onClick={handleReview}
                        disabled={reviewing}
                        className="gap-2 bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                        {reviewing ? "Rejecting..." : "Reject Application"}
                      </Button>
                    )}
                    {recommendation === "recommend_other_program" && (
                      <Button
                        onClick={handleReview}
                        disabled={reviewing || !recommendedProgram}
                        className="gap-2"
                      >
                        {reviewing ? "Submitting..." : "Submit Recommendation"}
                      </Button>
                    )}
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
