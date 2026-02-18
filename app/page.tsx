"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramModal } from "@/components/ProgramModal";
import { FileText, CheckCircle2, Users } from "lucide-react";

const programs = ["Undergraduate", "Postgraduate", "HND", "Part time", "Jupeb"];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/applicant/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-bold text-lg">PCU Admission Portal</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Create Account</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground">
              Start Your Academic Journey
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Submit your application, upload documents, and track your
              admission status.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Apply Now
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
              >
                Already Applying?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Programs
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the program that best fits your goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {programs.map((program) => (
              <button
                key={program}
                onClick={() => setSelectedProgram(program)}
                className="p-4 rounded-lg border border-primary/20 bg-primary/5 text-center hover:bg-primary/10 transition-colors cursor-pointer hover:border-primary/40"
              >
                <p className="font-medium text-foreground">{program}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; PCU Admission Portal. All rights reserved.</p>
        </div>
      </footer>

      {/* Program Modal */}
      {selectedProgram && (
        <ProgramModal
          isOpen={!!selectedProgram}
          onClose={() => setSelectedProgram(null)}
          program={selectedProgram}
        />
      )}
    </div>
  );
}