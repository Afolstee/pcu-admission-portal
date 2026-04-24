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
  Lock,
  X,
  Smartphone,
  Wallet
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
  { id: 11, name: 'JUPEB', fee: 10000, color: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-200'},
  { id: 2, name: 'UTME', fee: 10000, color: 'from-green-500/10 to-green-600/5', border: 'border-green-200'},
  { id: 1, name: 'Direct Entry', fee: 10000, color: 'from-purple-500/10 to-purple-600/5', border: 'border-purple-200'},
  { id: 12, name: 'HND Conversion', fee: 10000, color: 'from-orange-500/10 to-orange-600/5', border: 'border-orange-200'},
  { id: 13, name: 'Postgraduate', fee: 20000, color: 'from-red-500/10 to-red-600/5', border: 'border-red-200'},
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

  const [downloading, setDownloading] = useState<string | null>(null);
  
  // Payment states
  const [selectedForm, setSelectedForm] = useState<typeof APPLICATION_FORMS[0] | null>(null);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'confirmation' | 'gateway' | 'processing' | 'success' | 'cancelled'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const TRANSACTION_FEE = 300;

  const PAYMENT_METHODS = [
    { id: 'transfer', title: 'Pay with Transfer', desc: 'Make a transfer directly from your bank account to complete a transaction', icon: 'transfer' },
    { id: 'opay', title: 'Pay With OPay', desc: 'Complete trasaction with OPay', icon: 'opay' },
    { id: 'quickteller', title: 'Pay with Quickteller', desc: 'Login to your quickteller wallet to get access to your saved cards.', icon: 'quickteller' },
    { id: 'ussd', title: 'Pay with USSD', desc: 'Dial a USSD string from any of 17+ banks to complete a transaction', icon: Smartphone },
    { id: 'wallet', title: 'Pay with Wallet', desc: 'Make secure payments using third-party payment solutions.', icon: Wallet },
    { id: 'googlepay', title: 'Google Pay', desc: 'Make secure payments using your instruments saved with Google.', icon: 'googlepay' },
  ];

  const generateReferenceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ADM';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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

    loadStatus();
    loadRecommendations();
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
      await ApiClient.selectProgram(selectedForm.id, selectedForm.name);
      
      // 2. Simulate Payment (Delay for effect)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 3. Process payment on backend
      await ApiClient.processPayment('application_fee', selectedForm.fee, 'online', referenceId, 'completed', selectedForm.name);
      
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

  const handleCancelPayment = async () => {
    try {
      setPaymentStep('cancelled');
      setShowCancelModal(false);
      
      if (selectedForm && referenceId) {
        // Record cancellation in background
        ApiClient.processPayment('application_fee', selectedForm.fee, 'online', referenceId, 'cancelled', selectedForm.name)
          .catch(e => console.error("Error recording cancellation:", e));
      }
      
      setTimeout(() => {
        setPaymentStep('selection');
        setSelectedForm(null);
        setReferenceId('');
        setPaymentMethod(null);
      }, 4000);
    } catch (err) {
      console.error("Error in cancellation flow:", err);
      setShowCancelModal(false);
      setPaymentStep('selection');
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
                    
                    <CardHeader className="relative z-10 space-y-1 pt-8">
                      <CardTitle className="text-3xl font-black text-slate-800">{form.name}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 pt-4 pb-8">
                      
                      <div className="flex items-end gap-2 mb-8">
                        <span className="text-4xl font-black text-slate-900 leading-none">₦{form.fee.toLocaleString()}</span>
                        <span className="text-slate-400 font-bold text-xs uppercase mb-1">Total Fee</span>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          const ref = generateReferenceId();
                          setReferenceId(ref);
                          setSelectedForm(form);
                          setPaymentStep('confirmation');
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

          {paymentStep === 'confirmation' && selectedForm && (
            <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-300">
              <Card className="border-0 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="text-center space-y-2 pb-0">
                  <div className="space-y-1">
                    <p className="text-slate-500 font-bold text-sm">Reference ID:</p>
                    <p className="text-xl font-black text-slate-800 break-all px-4">{referenceId}</p>
                  </div>
                  <div className="pt-4 px-4">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Programme:</p>
                    <p className="text-xl font-black text-[#433878] uppercase leading-tight">
                      {selectedForm.name} DIRECT ENTRY CONVERSION
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="text-center pt-8 space-y-6">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Application Form</p>
                    <p className="text-4xl font-light text-slate-600 tracking-tight">
                      ₦{selectedForm.fee.toLocaleString()}.00
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl font-light text-slate-600 tracking-tight">
                      Transaction Fee: ₦{TRANSACTION_FEE.toLocaleString()}.00
                    </p>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-4xl font-light text-slate-600 tracking-tight">
                      Total: ₦{(selectedForm.fee + TRANSACTION_FEE).toLocaleString()}.00
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 pb-8 px-6">
                  <Button 
                    onClick={async () => {
                      setPaymentStep('gateway');
                      
                      try {
                        if (selectedForm && referenceId) {
                          await ApiClient.selectProgram(selectedForm.id, selectedForm.name);
                          await ApiClient.processPayment('application_fee', selectedForm.fee, 'online', referenceId, 'pending', selectedForm.name);
                        }
                      } catch (err) {
                        console.error("Error initializing transaction:", err);
                        alert("Transaction could not be initialized. Please refresh and try again.");
                      }
                    }}
                    className="w-full h-16 bg-[#6B2E70] hover:bg-[#5a275e] text-white font-black uppercase tracking-[0.15em] text-sm shadow-xl shadow-[#6B2E70]/20 rounded-md"
                  >
                    Pay Now
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="text-center mt-6">
                <Button variant="ghost" onClick={() => setShowCancelModal(true)} className="text-slate-400 font-bold hover:text-slate-600">
                  Cancel Transaction
                </Button>
              </div>
            </div>
          )}

          {paymentStep === 'gateway' && selectedForm && (
            <div className="max-w-xl mx-auto shadow-sm border border-slate-100 bg-white min-h-[600px] flex flex-col animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-4 text-slate-600 bg-slate-50/50">
                <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(true)} className="h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium">Cancel payment and return to Precious Cornerstone University</span>
              </div>

              {/* Subheader with Amount */}
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-400">logo</div>
                <div>
                  <p className="text-lg font-medium text-slate-800 tracking-tight">{user?.email}</p>
                  <p className="text-2xl font-black text-slate-900 leading-tight">NGN {(selectedForm.fee + TRANSACTION_FEE).toLocaleString()}.00</p>
                </div>
              </div>

              {/* Multi-step content */}
              {!paymentMethod ? (
                <div className="flex-1">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className="w-full p-6 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center">
                           {method.id === 'transfer' ? (
                             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                               <div className="w-4 h-4 border-t-2 border-r-2 border-white rotate-45 translate-x-[1px] translate-y-[-1px]"></div>
                             </div>
                           ) : method.id === 'opay' ? (
                             <div className="w-7 h-7 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin-slow"></div>
                           ) : method.id === 'quickteller' ? (
                             <div className="w-8 h-8 flex items-center justify-center">
                               <span className="text-blue-500 font-black italic text-xl">i</span>
                             </div>
                           ) : method.id === 'ussd' ? (
                             <div className="w-9 h-9 bg-blue-500 rounded-md flex items-center justify-center text-white">
                               <Smartphone className="h-6 w-6" />
                             </div>
                           ) : method.id === 'wallet' ? (
                             <div className="w-9 h-9 bg-blue-400 rounded-md flex items-center justify-center text-white">
                               <Wallet className="h-6 w-6" />
                             </div>
                           ) : method.id === 'googlepay' ? (
                             <div className="px-2 py-1 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 flex items-center gap-1">
                               <span className="text-blue-500">G</span> Pay
                             </div>
                           ) : (
                             <CreditCard className="h-6 w-6 text-blue-500" />
                           )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 text-lg leading-tight">{method.title}</p>
                          <p className="text-sm text-slate-400 leading-snug max-w-xs">{method.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-900 font-bold" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 p-6 space-y-6">
                  <Button variant="ghost" onClick={() => setPaymentMethod(null)} className="h-8 p-0 text-slate-400 hover:text-slate-600 font-bold gap-2">
                    &larr; Change Payment Method
                  </Button>
                  
                  {paymentMethod === 'card' ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-2 mb-2">
                         <Lock className="h-4 w-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-600">Secure Card Payment</span>
                      </div>
                      <div className="space-y-4">
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
                        <Button onClick={handleFinalizePayment} className="w-full h-14 bg-[#6B2E70] hover:bg-[#5a275e] text-white font-black uppercase tracking-widest mt-4">
                          Pay NGN {(selectedForm.fee + TRANSACTION_FEE).toLocaleString()}.00
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                       <div className="p-4 bg-slate-50 rounded-full">
                          <AlertCircle className="h-12 w-12 text-slate-300" />
                       </div>
                       <div className="space-y-1">
                          <p className="font-bold text-slate-800">Coming Soon</p>
                          <p className="text-sm text-slate-500 max-w-xs">{paymentMethod.toUpperCase()} integration is finalizing. Please use Card Payment for now.</p>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="p-6 border-t border-slate-50 flex flex-col items-center">
                <div className="flex items-center gap-1.5 opacity-40">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secured by SSL Encryption</span>
                </div>
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

          {paymentStep === 'cancelled' && (
            <div className="max-w-xl mx-auto min-h-[600px] flex flex-col items-center justify-center text-center bg-white animate-in zoom-in-95 duration-500 relative">
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                <div className="relative">
                  {/* Diamond Icon */}
                  <div className="w-16 h-16 bg-[#FFD700] rounded-xl rotate-45 flex items-center justify-center shadow-lg shadow-yellow-200">
                    <span className="text-white text-4xl font-black -rotate-45 mb-1">!</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">Payment Cancelled</h3>
                  <p className="text-slate-600 font-medium text-xl max-w-sm mx-auto leading-normal px-4">
                    The payment could not be completed. You will now be redirected to <span className="text-slate-800 font-bold">Precious Cornerstone University</span>
                  </p>
                </div>
              </div>

              {/* Interswitch Footer */}
              <div className="w-full p-8 flex flex-col items-center justify-end bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500">powered by</span>
                  <div className="flex items-center">
                    <span className="text-xl font-black text-[#00425F] tracking-tight">Interswitch</span>
                    <div className="relative w-6 h-6 ml-1">
                      <div className="absolute inset-0 bg-[#E31E24] rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-white rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCancelModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Cancel Payment?</h3>
                  <p className="text-slate-500 font-medium text-lg leading-tight px-4">Are you sure you want to cancel this payment?</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="border-t border-slate-100 -mx-8"></div>
                  <button 
                    onClick={handleCancelPayment}
                    className="w-full h-16 text-[#00AEEF] font-bold text-xl hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Cancel Payment
                  </button>
                  <div className="border-t border-slate-100 -mx-8"></div>
                  <button 
                    onClick={() => setShowCancelModal(false)}
                    className="w-full h-16 text-slate-900 font-bold text-xl hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    Close
                  </button>
                </div>
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
