"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient, CourseData } from "@/lib/api";
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
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  LogOut, 
  ShieldCheck, 
  Search, 
  AlertCircle,
  Clock
} from "lucide-react";
import { useProgramGuard } from "@/hooks/useProgramGuard";

export default function CourseRegistration() {
  const router = useRouter();
  const { user, student, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [registeredIds, setRegisteredIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [semester, setSemester] = useState("First");
  const [error, setError] = useState<string | null>(null);

  useProgramGuard();

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiClient.getStudentCourses(semester);
      setCourses(data.courses);
      setStatus(data.registration_status);
      setRegisteredIds(data.registered_course_ids);
      setDeadline(data.registration_deadline);
      
      // Auto-select compulsory/core courses & existing registered ones
      const initialSelected = [
        ...data.registered_course_ids,
        ...data.courses
          .filter(c => c.category.toLowerCase() === 'compulsory' || c.category.toLowerCase() === 'core')
          .map(c => c.id)
      ];
      setSelectedIds(Array.from(new Set(initialSelected)));
    } catch (err) {
      console.error("Error loading courses:", err);
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadCourses();
    }
  }, [authLoading, isAuthenticated, semester]);

  const isDeadlinePassed = deadline ? new Date(deadline) < new Date() : false;
  const isLocked = status === 'submitted' || isDeadlinePassed;

  const toggleCourse = (courseId: number, isCompulsory: boolean) => {
    if (isCompulsory || isLocked) return;
    
    setSelectedIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const calculateTotalCredits = () => {
    return courses
      .filter(c => selectedIds.includes(c.id))
      .reduce((sum, c) => sum + (c.credit_units || 0), 0);
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await ApiClient.registerCourses(selectedIds, semester);
      // Reload to lock the status
      await loadCourses();
      alert("Course registration submitted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit registration");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (loading && !courses.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <nav className="bg-background border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Course Registration</span>
              <Badge variant="outline" className="hidden sm:inline-flex">{student?.current_level}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold">{user?.name}</p>
               <p className="text-xs text-muted-foreground">{student?.matric_number}</p>
             </div>
             <Button variant="ghost" size="sm" onClick={() => logout()} className="text-destructive font-medium">Log Out</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Top Info Bar */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-md bg-white border-none flex items-center p-6 gap-4">
              <div className="bg-primary/10 p-3 rounded-xl h-fit">
                <BookOpen className="text-primary h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Credit Load</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-primary">{calculateTotalCredits()}</p>
                  <p className="text-sm text-muted-foreground mb-1">Units Selected</p>
                </div>
              </div>
          </Card>

          <Card className="shadow-md bg-white border-none flex items-center p-6 gap-4">
              <div className="bg-orange-100 p-3 rounded-xl h-fit">
                <Clock className="text-orange-600 h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Semester</p>
                <select 
                  className="text-lg font-bold bg-transparent outline-none cursor-pointer hover:text-primary transition-colors"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  disabled={loading || isLocked}
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
          </Card>

          <Card className="shadow-md border-none flex items-center p-6 gap-4 bg-primary text-primary-foreground group overflow-hidden relative">
              <div className="bg-white/10 p-3 rounded-xl h-fit relative z-10">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-sm text-primary-foreground/70 font-medium uppercase tracking-wider">Status</p>
                <p className="text-xl font-bold uppercase tracking-tight">
                  {isLocked ? "Submitted & Locked" : "Registration Open"}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground/20 opacity-50 pointer-events-none" />
          </Card>
        </div>

        {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl border border-destructive/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle className="h-5 w-5 fill-destructive/10" />
              <div className="flex-1 font-medium">{error}</div>
              <Button size="sm" variant="ghost" onClick={() => setError(null)}>Dismiss</Button>
            </div>
        )}

        {isDeadlinePassed && !isLocked && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center gap-3 mb-6">
            <AlertCircle className="h-5 w-5 fill-destructive/10" />
            <p className="font-medium uppercase tracking-tight text-xs">The registration deadline ({deadline ? new Date(deadline).toLocaleDateString() : 'passed'}) has expired. You can no longer modify your courses.</p>
          </div>
        )}

        {isLocked && status === 'submitted' && (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl border border-green-200 flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="font-medium">Your course registration for {semester} Semester has been submitted and is currently locked.</p>
          </div>
        )}

        {/* Selection Interface */}
        <div className="grid md:grid-cols-4 gap-8">
           <div className="md:col-span-3 space-y-4">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-xl font-black text-slate-800 tracking-tight">Available Courses</h2>
                 <div className="flex items-center gap-2 text-sm">
                   <div className="w-3 h-3 rounded-full bg-slate-200" />
                   <span className="text-muted-foreground mr-4">Elective</span>
                   <div className="w-3 h-3 rounded-full bg-primary" />
                   <span className="text-muted-foreground">Compulsory/Core</span>
                 </div>
              </div>

              {courses.length === 0 && !loading && (
                <Card className="p-12 text-center bg-white shadow-xl border-none">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No courses available</h3>
                  <p className="text-muted-foreground">We couldn't find any courses for your program and level for this semester.</p>
                </Card>
              )}

              <div className="grid gap-3">
                 {courses.map(course => {
                   const isCompulsory = course.category.toLowerCase() === 'compulsory' || course.category.toLowerCase() === 'core';
                   const isSelected = selectedIds.includes(course.id);
                   
                   return (
                     <div 
                      key={course.id} 
                      onClick={() => toggleCourse(course.id, isCompulsory)}
                      className={`group relative overflow-hidden transition-all duration-300 p-5 rounded-2xl border-2 cursor-pointer
                        ${isSelected ? 'bg-white border-primary/40 shadow-xl shadow-primary/5 -translate-y-1' : 'bg-white border-slate-100 hover:border-slate-300'}
                        ${isLocked ? 'opacity-80 cursor-not-allowed translate-y-0 shadow-none' : ''}
                      `}
                     >
                       {isCompulsory && (
                         <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
                       )}
                       
                       <div className="flex items-center justify-between relative z-10">
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{course.course_code}</span>
                                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{course.course_title}</h4>
                             </div>
                             <div className="flex items-center gap-3 pt-1">
                                <span className="text-sm font-bold text-slate-500">{course.credit_units} UNITS</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <Badge variant="secondary" className={`text-[10px] font-black uppercase ${isCompulsory ? 'bg-primary/5 text-primary border-primary/20' : 'bg-slate-100 text-slate-600'}`}>
                                  {course.category}
                                </Badge>
                             </div>
                          </div>
                          
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                             ${isSelected ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30' : 'border-slate-200'}
                             ${isCompulsory ? 'border-primary/50 opacity-50' : ''}
                          `}>
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-white stroke-[3px]" />}
                          </div>
                       </div>
                       
                       {isSelected && !isCompulsory && !isLocked && (
                         <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-destructive">CLICK TO DESELECT</span>
                         </div>
                       )}
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="space-y-6">
              <Card className="shadow-2xl border-none overflow-hidden sticky top-24">
                 <div className="h-2 bg-primary" />
                 <CardHeader className="bg-slate-50 px-6 py-4">
                    <CardTitle className="text-base font-black uppercase text-slate-800 tracking-wider">Registration Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm items-center">
                        <span className="font-medium text-slate-500">Selected Count</span>
                        <span className="font-black text-slate-800">{selectedIds.length}</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="font-medium text-slate-500">Total Credits</span>
                        <span className="font-black text-primary text-xl">
                          {calculateTotalCredits()} <span className="text-xs text-slate-400 font-bold">UNITS</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                       <Button 
                         onClick={handleRegister} 
                         disabled={submitting || isLocked || selectedIds.length === 0}
                         className="w-full font-black py-7 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                       >
                         {submitting ? "SUBMITTING..." : (isLocked ? "SUBMITTED" : "SUBMIT REGISTRATION")}
                       </Button>
                       <p className="text-[10px] text-center text-muted-foreground font-bold mt-4 px-2 uppercase tracking-tight">
                         By clicking submit, your course registration will be finalized and locked for the current semester.
                       </p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
