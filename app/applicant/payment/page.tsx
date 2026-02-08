'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, LogOut, AlertCircle, DollarSign } from 'lucide-react';

interface PaymentInfo {
  applicant_id: number;
  program_name: string;
  admission_status: string;
  acceptance_fee: number;
  tuition_fee: number;
  has_paid_acceptance_fee: boolean;
  has_paid_tuition: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user, applicant, isAuthenticated, logout } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'applicant') {
      router.replace('/auth/login');
      return;
    }

    if (applicant?.admission_status !== 'admitted') {
      router.replace('/applicant/dashboard');
      return;
    }

    // Load payment info (mock for now)
    loadPaymentInfo();
  }, [isAuthenticated, user, applicant, router]);

  const loadPaymentInfo = async () => {
    try {
      // Mock payment info - in production this would come from API
      setPaymentInfo({
        applicant_id: applicant?.id || 0,
        program_name: applicant ? 'Your Program' : 'Unknown',
        admission_status: 'admitted',
        acceptance_fee: 50000,
        tuition_fee: 500000,
        has_paid_acceptance_fee: false,
        has_paid_tuition: false,
      });
    } catch (err) {
      console.error('Error loading payment info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-semibold mb-2">Error Loading Payment</p>
            <p className="text-sm text-muted-foreground mb-6">
              Unable to load payment information. Please try again later.
            </p>
            <Link href="/applicant/dashboard">
              <Button>Go Back</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="bg-background border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Admission Portal</span>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-4 bg-transparent"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment</h1>
          <p className="text-muted-foreground">
            Complete your payment to finalize your admission
          </p>
        </div>

        {/* Admission Status */}
        <Card className="mb-8 border-green-500/50 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium">Admission Status</p>
                <p className="text-lg font-semibold text-green-900">Congratulations! You have been admitted.</p>
              </div>
              <Badge className="bg-green-600">Admitted</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Acceptance Fee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Acceptance Fee
              </CardTitle>
              <CardDescription>Required to confirm your admission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold">${paymentInfo.acceptance_fee.toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Status:</span>
                  {paymentInfo.has_paid_acceptance_fee ? (
                    <Badge className="bg-green-600">Paid</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <Button
                  disabled
                  className="w-full gap-2"
                  variant={paymentInfo.has_paid_acceptance_fee ? 'outline' : 'default'}
                >
                  <DollarSign className="h-4 w-4" />
                  {paymentInfo.has_paid_acceptance_fee ? 'Payment Completed' : 'Pay Now (Coming Soon)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tuition Fee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tuition Fee
              </CardTitle>
              <CardDescription>For your first year of study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold">${paymentInfo.tuition_fee.toLocaleString()}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Status:</span>
                  {paymentInfo.has_paid_tuition ? (
                    <Badge className="bg-green-600">Paid</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <Button
                  disabled
                  className="w-full gap-2"
                  variant={paymentInfo.has_paid_tuition ? 'outline' : 'default'}
                >
                  <DollarSign className="h-4 w-4" />
                  {paymentInfo.has_paid_tuition ? 'Payment Completed' : 'Pay Now (Coming Soon)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Summary */}
        <Card className="bg-primary/5 border-primary/20 mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Acceptance Fee:</span>
                <span>${paymentInfo.acceptance_fee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tuition Fee:</span>
                <span>${paymentInfo.tuition_fee.toLocaleString()}</span>
              </div>
              <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between items-center font-bold">
                <span>Total Amount:</span>
                <span className="text-lg">
                  ${(paymentInfo.acceptance_fee + paymentInfo.tuition_fee).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Coming Soon */}
        <Card className="border-yellow-500/50 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Payment Methods Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <p className="mb-3">
              The payment system is currently under development. Available payment methods will include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Credit Card (Visa, Mastercard)</li>
              <li>Bank Transfer</li>
              <li>Mobile Money (Coming Soon)</li>
              <li>PayPal (Optional)</li>
            </ul>
            <p className="mt-4 text-sm">
              Payment processing will be enabled shortly. Please check back later or contact the admissions office for more information.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/applicant/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
