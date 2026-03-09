"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Users } from "lucide-react";

export default function UniversityLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <header className="fixed w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo new.png"
            alt="PCU Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-bold text-xl text-[#d9251b] tracking-tight hidden sm:inline-block">
            Precious Cornerstone University
          </span>
          <span className="font-bold text-xl text-[#d9251b] tracking-tight sm:hidden">
            PCU
          </span>
        </div>
        
        <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
          <Link href="#" className="hover:text-[#d9251b] transition-colors">About PCU</Link>
          <Link href="#" className="hover:text-[#d9251b] transition-colors">Academics</Link>
          <Link href="/admissions" className="text-[#d9251b] hover:text-red-800 transition-colors font-semibold">Admissions</Link>
          <Link href="/auth/login" className="hover:text-[#d9251b] transition-colors">Student Life</Link>
        </nav>
        
        <div className="flex gap-2 sm:gap-4">
          <Link href="/admissions">
            <Button className="bg-[#d9251b] hover:bg-red-800 text-white rounded-full px-4 sm:px-6">Apply</Button>
          </Link>
          <Link href="/student/login">
            <Button variant="outline" className="border-[#d9251b] text-[#d9251b] hover:bg-red-50 rounded-full px-4 sm:px-6 shadow-sm hidden sm:flex">
              <Users className="h-4 w-4 mr-2" />
              Student Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-red-100 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 rounded-full bg-orange-100 blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Discover Your <span className="text-[#d9251b]">True Potential</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A world-class university committed to academic excellence, innovation, and shaping the future leaders of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
            <Link href="/admissions">
              <Button className="bg-[#d9251b] hover:bg-red-800 text-white shadow-lg text-lg h-14 px-8 rounded-full transition-transform hover:-translate-y-1">
                Explore Admissions
              </Button>
            </Link>
            <Link href="#">
              <Button variant="outline" className="text-lg h-14 px-8 rounded-full border-gray-300 hover:border-gray-400 bg-white shadow-sm transition-transform hover:-translate-y-1">
                Take a Virtual Tour
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9251b] transition-colors">
                <BookOpen className="h-8 w-8 text-[#d9251b] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Academic Excellence</h3>
              <p className="text-gray-600">Explore over 50+ accredited undergraduate and postgraduate academic programs.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group text-center relative overflow-hidden">
               <div className="absolute inset-0 border-2 border-[#d9251b]/10 rounded-2xl scale-105 pointer-events-none transition-transform opacity-0 group-hover:opacity-100 group-hover:scale-100" />
               <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9251b] transition-colors relative z-10">
                <GraduationCap className="h-8 w-8 text-[#d9251b] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Admissions</h3>
              <p className="text-gray-600 relative z-10">Start your journey today. Apply online and join a thriving community of scholars.</p>
              <Link href="/admissions" className="absolute inset-0 z-20">
                 <span className="sr-only">Go to Admissions portal</span>
              </Link>
            </div>
            
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group text-center relative overflow-hidden">
               <div className="absolute inset-0 border-2 border-[#d9251b]/10 rounded-2xl scale-105 pointer-events-none transition-transform opacity-0 group-hover:opacity-100 group-hover:scale-100" />
               <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d9251b] transition-colors relative z-10">
                <Users className="h-8 w-8 text-[#d9251b] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Student portal</h3>
              <p className="text-gray-600 relative z-10">Log in to register courses, check results, and manage your student profile.</p>
              <Link href="/student/login" className="absolute inset-0 z-20">
                 <span className="sr-only">Go to Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        <div className="mb-4">
           <Image src="/images/logo new.png" alt="Logo" width={32} height={32} className="mx-auto grayscale opacity-50" />
        </div>
        <p>© {new Date().getFullYear()} Precious Cornerstone University. All rights reserved.</p>
      </footer>
    </div>
  );
}
