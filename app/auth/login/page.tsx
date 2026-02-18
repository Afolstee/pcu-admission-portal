"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, user, applicant } =
    useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [showError, setShowError] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    // Applicant: must select a program before accessing dashboard/application
    if (!applicant?.program_id) {
      router.replace("/applicant/select-program");
    } else {
      router.replace("/applicant/dashboard");
    }
  }, [isAuthenticated, user, applicant, router]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setShowError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setShowError(false);

    if (!formData.email.includes("@")) {
      setLocalError("Valid email is required");
      setShowError(true);
      return;
    }
    if (!formData.password) {
      setLocalError("Password is required");
      setShowError(true);
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Toast Error Notification */}
      {showError && displayError && (
        <div
          className="fixed top-6 right-6 max-w-sm animate-in slide-in-from-top-2 fade-in duration-300 z-50"
          style={{
            animation: showError
              ? "slideInDown 0.4s ease-out forwards"
              : "slideOutUp 0.4s ease-out forwards",
          }}
        >
          <style>{`
            @keyframes slideInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideOutUp {
              from {
                opacity: 1;
                transform: translateY(0);
              }
              to {
                opacity: 0;
                transform: translateY(-20px);
              }
            }
          `}</style>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Error</p>
                <p className="text-sm mt-1 opacity-95">{displayError}</p>
              </div>
              <button
                onClick={() => setShowError(false)}
                className="flex-shrink-0 text-red-200 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Animated progress bar */}
            <div
              className="h-1 bg-red-400 opacity-50"
              style={{
                animation: "slideOutLeft 5s linear forwards",
                transformOrigin: "left",
              }}
            />
          </div>
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/logo new.png"
              alt="University Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Log in to your admission portal account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              href="/auth/signup"
              className="text-primary font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
