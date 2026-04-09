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
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LogOut,
  FileText,
  DollarSign,
  Download,
  Settings,
  Printer,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Lock
} from "lucide-react";
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

const APPLICATION_FORMS = [
  { id: 11, name: 'JUPEB', fee: 10000, color: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-200', icon: '📝', tag: 'Foundation' },
  { id: 2, name: 'UTME', fee: 10000, color: 'from-green-500/10 to-green-600/5', border: 'border-green-200', icon: '🎓', tag: 'Standard' },
  { id: 1, name: 'Direct Entry', fee: 10000, color: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-200', icon: '🚀', tag: 'Advanced' },
  { id: 12, name: 'HND Conversion', fee: 10000, color: 'from-orange-500/10 to-orange-600/5', border: 'border-orange-200', icon: '🖥️', tag: 'Fast-Track' },
  { id: 13, name: 'Postgraduate', fee: 20000, color: 'from-red-500/10 to-red-600/5', border: 'border-red-200', icon: '📖', tag: 'Graduate' },
];

export default function ApplicantDashboard() {
  const router = useRouter();
  const { user, applicant, isAuthenticated, logout, refreshStatus } = useAuth();
  const [status, setStatus] = useState<ApplicantStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [admissionLetter, setAdmissionLetter] = useState<AdmissionLetterData | null>(null);
  const [showLetter, setShowLetter] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Payment states
  const [selectedForm, setSelectedForm] = useState<typeof APPLICATION_FORMS[0] | null>(null);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'gateway' | 'processing' | 'success'>('selection');

  const loadStatus = async () => {
    try {
      const response = await ApiClient.getApplicantStatus();
      setStatus(response.applicant);

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

  useEffect(() => {
    if (!isAuthenticated) return;

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

  const handleFinalizePayment = async () => {
    if (!selectedForm) return;
    try {
      setPaymentStep('processing');
      
      // 1. Select the program
      await ApiClient.selectProgram(selectedForm.id);
      
      // 2. Simulate Payment (Delay for effect)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 3. Process payment on backend
      await ApiClient.processPayment('application_fee', selectedForm.fee, 'online', `APP-${Date.now()}`);
      
      setPaymentStep('success');
      
      // 4. Refresh status to unlock dashboard
      setTimeout(async () => {
        await refreshStatus();
        await loadStatus();
        setPaymentStep('selection');
        setSelectedForm(null);
      }, 2000);

    } catch (err) {
      console.error("Error starting application:", err);
      alert("Payment failed. Please try again.");
      setPaymentStep('gateway');
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
          <p className="text-muted-foreground font-medium">Authenticating e-portal session...</p>
        </div>
      </div>
    );
  }

  if (!status?.has_paid_application_fee) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {paymentStep === 'selection' && (
            <>
              <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl uppercase italic">
                  Admission Gateway
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                  Select your academic path to initialize your application profile.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {APPLICATION_FORMS.map((form) => (
                  <Card 
                    key={form.name} 
                    className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${form.border} bg-white`}
                  >
                    <div className={`absolute top-0 right-0 w-40 h-40 -mr-12 -mt-12 bg-gradient-to-br ${form.color} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
                    
                    <CardHeader className="relative z-10 space-y-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                          <span className="text-4xl">{form.icon}</span>
                        </div>
                        <Badge variant="outline" className="font-bold border-slate-200 bg-slate-50/50 text-slate-500">{form.tag}</Badge>
                      </div>
                      <CardTitle className="text-3xl font-black text-slate-800">{form.name}</CardTitle>
                      <CardDescription className="text-slate-400 font-bold tracking-tight uppercase text-xs">Path Selection Required</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 pt-4 pb-8">
                      <p className="text-slate-500 font-medium leading-relaxed mb-6">
                        Unlock your application forms, status indicators, and recommendation portal for the {form.name} session.
                      </p>
                      
                      <div className="flex items-end gap-2 mb-8">
                        <span className="text-4xl font-black text-slate-900 leading-none">₦{form.fee.toLocaleString()}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase mb-1">Total Fee</span>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedForm(form);
                          setPaymentStep('gateway');
                        }}
                        className="w-full h-14 text-lg font-black uppercase tracking-wider shadow-lg shadow-black/5 flex items-center justify-center gap-2 group/btn"
                      >
                        Get Started
                        <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {paymentStep === 'gateway' && selectedForm && (
             <div className="max-w-4xl mx-auto animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Summary */}
                  <div className="flex-1 space-y-6">
                    <Button variant="ghost" onClick={() => setPaymentStep('selection')} className="gap-2 font-bold mb-4">
                      &larr; Back to pathways
                    </Button>
                    <Card className="border-0 shadow-lg bg-slate-900 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CreditCard size={120} />
                      </div>
                      <CardHeader>
                        <CardDescription className="text-slate-400 font-bold uppercase tracking-wider">Payment Summary</CardDescription>
                        <CardTitle className="text-3xl font-black">{selectedForm.name} Admission</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-700/50">
                          <span className="text-slate-400 font-medium">Application Form Fee</span>
                          <span className="font-bold">₦{selectedForm.fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700/50">
                          <span className="text-slate-400 font-medium">Processing Fee</span>
                          <span className="font-bold text-green-400">FREE</span>
                        </div>
                        <div className="flex justify-between pt-4 text-2xl font-black">
                          <span>Total to Pay</span>
                          <span className="text-primary">₦{selectedForm.fee.toLocaleString()}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-slate-800/50 py-4 flex items-center gap-3">
                        <ShieldCheck className="text-green-400 h-5 w-5" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Secured by PCU Payment Gateway</span>
                      </CardFooter>
                    </Card>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                       <AlertCircle className="text-blue-600 h-5 w-5 shrink-0" />
                       <p className="text-xs text-blue-700 font-medium leading-relaxed">
                         Note: This is a simulated payment gateway. Clicking "Pay Securely" will authorize your application without charging a real card.
                       </p>
                    </div>
                  </div>

                  {/* Right: Card Inputs */}
                  <Card className="flex-1 shadow-2xl border-0">
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                         <Lock className="h-4 w-4 text-slate-400" />
                         Secure Card Payment
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-slate-500">Card Number</Label>
                        <div className="relative">
                          <Input placeholder="4444 4444 4444 4444" className="h-12 font-mono text-lg" defaultValue="5399 2100 0000 1234" readOnly />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-6 h-4 bg-orange-400 rounded-sm"></div>
                            <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase text-slate-500">Expiry Date</Label>
                          <Input placeholder="MM/YY" className="h-12" defaultValue="12/28" readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase text-slate-500">CVV</Label>
                          <Input placeholder="123" className="h-12" defaultValue="***" readOnly type="password" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Label className="font-bold text-xs uppercase text-slate-500">Cardholder Name</Label>
                        <Input placeholder="NAME ON CARD" className="h-12 uppercase font-bold" defaultValue={user?.name} readOnly />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                       <Button onClick={handleFinalizePayment} className="w-full h-14 text-lg font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20">
                         Pay Securely ₦{selectedForm.fee.toLocaleString()}
                       </Button>
                       <div className="flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                          <div className="font-black italic text-xl">VISA</div>
                          <div className="font-black italic text-xl">mastercard</div>
                          <div className="font-black italic text-xl">Verve</div>
                       </div>
                    </CardFooter>
                  </Card>
                </div>
             </div>
          )}

          {(paymentStep === 'processing' || paymentStep === 'success') && (
            <Card className="max-w-md mx-auto py-16 text-center border-none shadow-2xl bg-white animate-in zoom-in-95 duration-500">
              <CardContent className="space-y-8">
                {paymentStep === 'processing' ? (
                  <>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                      <div className="absolute inset-0 rounded-full border-8 border-t-primary animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <DollarSign className="h-12 w-12 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Authorizing</h3>
                      <p className="text-slate-500 font-medium">Verifying transaction with your bank...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 bg-green-100 rounded-full scale-100 animate-ping opacity-25"></div>
                      <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                        <CheckCircle2 className="h-16 w-16 text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Payment Secured</h3>
                      <p className="text-slate-500 font-medium text-lg">Redirecting to your application portal.</p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></div>
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {paymentStep === 'selection' && (
            <div className="mt-20 text-center border-t border-slate-200 pt-10">
              <div className="inline-flex flex-col sm:flex-row items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><ShieldCheck className="h-4 w-4" /> SSL Encrypted</div>
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><Lock className="h-4 w-4" /> Secure Auth</div>
                <div className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest"><DollarSign className="h-4 w-4" /> Instant Activation</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard View (Same as before but cleaned up)
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Pathway</CardTitle></CardHeader>
            <CardContent><p className="text-xl font-black text-slate-800">{status?.program_name || "Form Active"}</p></CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Application Progress</CardTitle></CardHeader>
            <CardContent>
              <Badge className={`font-bold px-3 py-1 ${statusColors[status?.application_status || "pending"]}`}>
                {(status?.application_status || "Pending").toUpperCase().replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Admission Decision</CardTitle></CardHeader>
            <CardContent>
              <Badge className={`font-bold px-3 py-1 ${admissionStatusColors[status?.admission_status || "not_admitted"]}`}>
                {(status?.admission_status || "Under Review").toUpperCase().replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
           {recommendations.length > 0 && (
            <div className="animate-in slide-in-from-top-4 duration-500">
               <h2 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight flex items-center gap-2">
                 <Settings className="h-6 w-6 text-primary" /> Recommended Courses
               </h2>
               <div className="grid gap-4">
                 {recommendations.map((rec) => (
                   <RecommendationCard key={rec.review_id} recommendation={rec} onRespond={async (rid, rs) => { 
                      await ApiClient.respondToRecommendation(rid, rs); 
                      loadStatus();
                      loadRecommendations();
                   }} loading={loadingRecommendations} />
                 ))}
               </div>
            </div>
           )}

           <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                 <div>
                    <CardTitle className="text-xl font-black text-slate-800">Application Milestones</CardTitle>
                    <p className="text-sm text-slate-400 font-medium">Complete each step to finalize your admission.</p>
                 </div>
                 <div className="p-3 bg-white rounded-xl shadow-sm">
                    <CheckCircle2 className={`h-6 w-6 ${applicationStep === 3 ? "text-green-500" : "text-slate-200"}`} />
                 </div>
              </div>
              <CardContent className="p-6 md:p-8 space-y-12">
                 {/* Step 1 */}
                 <div className="relative flex gap-6">
                    <div className="absolute top-10 left-5 bottom-0 w-0.5 bg-slate-100"></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 z-10 ${applicationStep >= 1 ? "bg-green-500" : "bg-slate-200"}`}>
                       {applicationStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                    </div>
                    <div className="flex-1 pb-10">
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                          <h4 className="font-black text-lg text-slate-800">Complete e-Application Form</h4>
                          <span className="bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-green-100 italic">Fee Verified</span>
                       </div>
                       <p className="text-slate-500 font-medium text-sm mb-4">Provide academic history, personal details, and upload certified documents for physical verification.</p>
                       <Link href="/applicant/application">
                          <Button size="sm" className="font-bold border-2 border-transparent hover:border-primary/20" variant={status?.application_status === "pending" ? "default" : "outline"}>
                            {status?.application_status === "pending" ? "Application Form" : "Manage Submission"}
                          </Button>
                       </Link>
                    </div>
                 </div>

                 {/* Step 2 */}
                 <div className="relative flex gap-6">
                    <div className="absolute top-10 left-5 bottom-0 w-0.5 bg-slate-100"></div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 z-10 ${applicationStep >= 2 ? "bg-primary" : "bg-slate-200"}`}>
                       2
                    </div>
                    <div className="flex-1 pb-10">
                       <h4 className="font-black text-lg text-slate-800 mb-2">Academic Panel Review</h4>
                       <p className="text-slate-500 font-medium text-sm">The admissions committee is evaluating your credentials based on PCU academic standards. This usually takes 3-5 working days.</p>
                    </div>
                 </div>

                 {/* Step 3 */}
                 <div className="flex gap-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 z-10 ${applicationStep >= 3 ? "bg-primary" : "bg-slate-200"}`}>
                       3
                    </div>
                    <div className="flex-1">
                       <h4 className="font-black text-lg text-slate-800 mb-2">Enrollment & Acceptance</h4>
                       <p className="text-slate-500 font-medium text-sm">Upon admission, secure your matriculation by completing the acceptance and tuition fees payments.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
