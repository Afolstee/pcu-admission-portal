"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface Program {
  id: number;
  name: string;
  description: string;
  level?: string;
  session?: string;
  department?: string;
  faculty?: string;
  mode?: string;
  is_locked?: boolean;
}

const INITIAL_PROGRAM_TYPES = [
  { id: "undergraduate", name: "Undergraduate", enabled: true },
  { id: "postgraduate", name: "Postgraduate", enabled: false },
  { id: "part-time", name: "Part-Time", enabled: false },
  { id: "jupeb", name: "JUPEB", enabled: false },
];

export default function SelectProgramPage() {
  const router = useRouter();
  const { isAuthenticated, user, refreshStatus } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programTypes, setProgramTypes] = useState(INITIAL_PROGRAM_TYPES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "applicant") {
      router.replace("/auth/login");
      return;
    }

    const loadPrograms = async () => {
      try {
        const response = await ApiClient.getApplicantPrograms();
        setPrograms(response.programs || []);
        if (response.program_types_status) {
           setProgramTypes(INITIAL_PROGRAM_TYPES.map(pt => ({
              ...pt,
              enabled: !!response.program_types_status[pt.id]
           })));
        }
      } catch (err) {
        setError("Failed to load programs. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, [isAuthenticated, user, router]);

  const handleNext = () => {
    setError(null);
    if (step === 1 && !selectedType) {
      setError("Please select a program type.");
      return;
    }
    if (step === 2 && !selectedFaculty) {
      setError("Please select a faculty.");
      return;
    }
    if (step === 3 && !selectedProgram) {
      setError("Please select a program.");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleConfirm = async () => {
    if (!selectedProgram) return;
    setSubmitting(true);
    setError(null);

    try {
      await ApiClient.selectProgram(selectedProgram.id);
      await refreshStatus(); // Refresh auth status to get new program ID
      router.push("/applicant/application");
    } catch (err) {
      setError("Failed to select program. Please try again.");
      console.error(err);
      setSubmitting(false);
    }
  };

  // Filtered lists for the wizard
  // The 'mode' is usually stored exactly with Title Casing from the backend (e.g. "Undergraduate")
  const uniqueFaculties = Array.from(
    new Set(
      programs
        .filter((p) => selectedType && p.mode?.toLowerCase() === selectedType)
        .map((p) => p.faculty)
    )
  ).filter(Boolean) as string[];

  const availablePrograms = programs.filter(
    (p) =>
      selectedType &&
      p.mode?.toLowerCase() === selectedType &&
      selectedFaculty &&
      p.faculty === selectedFaculty
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-lg hidden sm:inline-block">Admission Portal</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome,{" "}
            <span className="font-medium text-foreground">{user?.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {step === 1 && "Select Program Type"}
            {step === 2 && "Select Faculty"}
            {step === 3 && "Select Department & Program"}
            {step === 4 && "Confirm Selection"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {step === 1 && "Choose the level of study you are applying for."}
            {step === 2 && "Choose the faculty that houses your intended discipline."}
            {step === 3 && "Choose the specific program you want to study."}
            {step === 4 && "Please review your selection before continuing to the application form."}
          </p>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${s === step ? 'bg-primary text-white' : s < step ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-8 sm:w-16 h-1 mx-1 rounded-full ${s < step ? 'bg-primary/20' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Program Type */}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {programTypes.map((type) => (
              <Card
                key={type.id}
                className={`transition-all ${
                  !type.enabled
                    ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                    : "cursor-pointer hover:border-primary/50"
                } ${
                  selectedType === type.id
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => {
                  if (type.enabled) setSelectedType(type.id);
                }}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{type.name}</CardTitle>
                    {!type.enabled && (
                      <p className="text-sm text-muted-foreground mt-1">Currently unavailable</p>
                    )}
                  </div>
                  {selectedType === type.id && (
                    <CheckCircle className="text-primary h-6 w-6" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Faculty */}
        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {uniqueFaculties.length > 0 ? (
              uniqueFaculties.map((faculty) => (
                <Card
                  key={faculty}
                  className={`cursor-pointer transition-all ${
                    selectedFaculty === faculty
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedFaculty(faculty)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <CardTitle className="text-xl leading-tight">{faculty}</CardTitle>
                    {selectedFaculty === faculty && (
                      <CheckCircle className="text-primary h-6 w-6 shrink-0 ml-4" />
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground bg-white rounded-xl border">
                No faculties found for this program type.
              </div>
            )}
          </div>
        )}

        {/* Step 3: Specific Program */}
        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {availablePrograms.length > 0 ? (
              availablePrograms.map((program) => {
                const isLocked = program.is_locked;
                return (
                  <Card
                    key={program.id}
                    className={`transition-all ${
                      isLocked 
                        ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200' 
                        : selectedProgram?.id === program.id
                          ? "cursor-pointer ring-2 ring-primary border-primary bg-primary/5"
                          : "cursor-pointer hover:border-primary/50"
                    }`}
                    onClick={() => {
                      if (!isLocked) setSelectedProgram(program);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <CardTitle className="text-lg leading-tight">{program.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {isLocked && <Badge variant="destructive" className="text-[10px] leading-tight px-1.5 py-0">Closed</Badge>}
                            <p className="text-sm font-medium text-muted-foreground">
                              {program.department} 
                            </p>
                          </div>
                        </div>
                        {selectedProgram?.id === program.id && !isLocked && (
                        <CheckCircle className="text-primary h-6 w-6 shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {isLocked ? (
                         "Registration for this program is currently closed."
                      ) : (
                         program.description || 'No description available for this program.'
                      )}
                    </p>
                  </CardContent>
                </Card>
              )})
            ) : (
              <div className="col-span-2 text-center py-12 text-muted-foreground bg-white rounded-xl border">
                No programs found in this faculty.
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && selectedProgram && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Ready to Apply?</CardTitle>
                <p className="text-muted-foreground">Please review your selected program details</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div className="text-sm font-medium text-muted-foreground col-span-1">Program Type</div>
                  <div className="text-sm font-semibold col-span-2 capitalize">{selectedType} Program</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div className="text-sm font-medium text-muted-foreground col-span-1">Faculty</div>
                  <div className="text-sm font-semibold col-span-2">{selectedFaculty}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div className="text-sm font-medium text-muted-foreground col-span-1">Department</div>
                  <div className="text-sm font-semibold col-span-2">{selectedProgram.department}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground col-span-1">Course of Study</div>
                  <div className="text-lg font-bold text-primary col-span-2">{selectedProgram.name}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-4 items-center justify-between pt-6 border-t">
          {step === 1 ? (
             <Button
                variant="outline"
                className="text-gray-600"
                onClick={() => router.push("/")}
              >
                Cancel Application
             </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={submitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="px-8"
              disabled={
                (step === 1 && !selectedType) ||
                (step === 2 && !selectedFaculty) ||
                (step === 3 && !selectedProgram)
              }
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
              disabled={submitting}
            >
              {submitting ? "Confirming..." : "Confirm & Apply"}
              {!submitting && <CheckCircle className="h-4 w-4 ml-2" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

