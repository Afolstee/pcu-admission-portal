"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramModal } from "@/components/ProgramModal";
import { 
  FileText, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  ChevronDown, 
  AlertCircle,
  BookOpen,
  GraduationCap
} from "lucide-react";
import "./style.css";

const programs = [
  {
    name: "Undergraduate",
    icon: "🎓",
    description: "Begin your academic journey with our world-class undergraduate programmes.",
  },
  {
    name: "Postgraduate",
    icon: "📖",
    description: "Advance your expertise with research-driven postgraduate study.",
  },
  {
    name: "HND",
    icon: "🖥️",
    description: "Gain practical, industry-ready skills through our HND programmes.",
  },
  {
    name: "Part time",
    icon: "🕐",
    description: "Flexible learning designed to fit around your schedule and career.",
  },
  {
    name: "jupeb",
    icon: "📝",
    description: "A foundation programme bridging you to full university admission.",
  },
];

const cardGradients = [
  "linear-gradient(135deg, #e8d5f5 0%, #c9b8e8 50%, #b8a0d4 100%)", // soft purple
  "linear-gradient(135deg, #f0d6e8 0%, #d4a8c7 50%, #b87fa8 100%)", // pink/wine
  "linear-gradient(135deg, #d8c8f0 0%, #b8a0e0 50%, #9a7fd0 100%)", // violet
  "linear-gradient(135deg, #f5d0d8 0%, #d4869a 50%, #b85c72 100%)", // deep wine/rose
  "linear-gradient(135deg, #ddd0f0 0%, #b8a0d8 50%, #8a6bb8 100%)", // deep purple
];

const iconBg = [
  "rgba(130, 80, 200, 0.15)",
  "rgba(160, 60, 100, 0.15)",
  "rgba(100, 60, 180, 0.15)",
  "rgba(180, 60, 80, 0.15)",
  "rgba(110, 60, 170, 0.15)",
];

const btnColors = [
  { bg: "rgba(110, 60, 180, 0.85)", hover: "rgb(90,40,160)" },
  { bg: "rgba(160, 50, 90, 0.85)", hover: "rgb(130,30,70)" },
  { bg: "rgba(90, 50, 170, 0.85)", hover: "rgb(70,30,150)" },
  { bg: "rgba(150, 40, 70, 0.85)", hover: "rgb(120,20,50)" },
  { bg: "rgba(100, 50, 160, 0.85)", hover: "rgb(80,30,140)" },
];

export default function UniversityLandingPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, portalStatus } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/applicant/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navbar (Newly Designed) */}
      <header className="fixed w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center rounded-xl overflow-hidden">
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={65}
              height={65}
              className="object-contain"
            />
          </div>
        </div>
        
        <nav className="hidden lg:flex gap-7 font-semibold text-[13px] uppercase tracking-wider text-gray-700 items-center">
          {/* E-portal Dropdown */}
          <div className="relative group cursor-pointer py-2">
            <div className="flex items-center gap-1 hover:text-[#d9251b] transition-colors">
              E-portal <ChevronDown className="h-4 w-4" />
            </div>
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <Link href="#" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors lowercase first-letter:uppercase">Library Portal</Link>
              <Link href="/staff/login" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors lowercase first-letter:uppercase">Staff Portal</Link>
              <Link href="/auth/signup" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors lowercase first-letter:uppercase">Admissions</Link>
            </div>
          </div>

          <Link href="/postgraduate" className="hover:text-[#d9251b] transition-colors">Postgraduate</Link>
          <Link href="/student/login" className="hover:text-[#d9251b] transition-colors">Undergraduate</Link>
          <Link href="/part-time" className="hover:text-[#d9251b] transition-colors whitespace-nowrap">Part Time</Link>

          {/* News & Event Dropdown */}
          <div className="relative group cursor-pointer py-2">
            <div className="flex items-center gap-1 hover:text-[#d9251b] transition-colors">
              News & Event <ChevronDown className="h-4 w-4" />
            </div>
            <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
              <Link href="/news" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors">University News</Link>
              <Link href="/events" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors">Upcoming Events</Link>
              <Link href="/calendar" className="block px-5 py-3 text-gray-700 hover:bg-gray-50 hover:text-[#d9251b] transition-colors">Academic Calendar</Link>
            </div>
          </div>
        </nav>
        
        <div className="flex gap-2 sm:gap-4">
          <Link href="/auth/signup">
            <Button className="bg-[#d9251b] hover:bg-red-800 text-white rounded-full px-4 sm:px-6">Apply</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section (from Admissions page) */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {/* Background Video/Image */}
        <img
          src="/images/school1.png"
          alt="Hero Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Shimmer line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "2px",
            height: "100%",
            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
            animation: heroVisible ? "shimmerLine 2.5s ease-in-out infinite 1.8s" : "none",
            zIndex: 5,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full text-left px-14">
          <p
            className="text-l text-gray-200 mt-4 font-semibold"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(-20px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            Welcome to PRECIOUS CORNERSTONE
          </p>

          <div
            style={{
              height: "2px",
              backgroundColor: "white",
              marginTop: "10px",
              width: heroVisible ? "300px" : "0px",
              transition: "width 0.8s ease 0.7s",
            }}
          />

          <div style={{ overflow: "hidden", marginTop: "24px" }}>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-white uppercase"
              style={{
                display: "inline-block",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0) skewY(0deg)" : "translateY(100%) skewY(4deg)",
                transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s",
              }}
            >
              UNIVERSITY&apos;S
            </h1>
          </div>

          <div style={{ overflow: "hidden" }}>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-white uppercase"
              style={{
                display: "inline-block",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0) skewY(0deg)" : "translateY(100%) skewY(4deg)",
                transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s",
              }}
            >
              ADMISSION PORTAL
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease 1s, transform 0.7s ease 1s",
              }}
            >
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto relative overflow-hidden bg-[#E5342C] hover:bg-red-700"
                  style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "60%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                      animation: heroVisible ? "btnShine 3s ease-in-out infinite 2.2s" : "none",
                      pointerEvents: "none",
                    }}
                  />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease 1.2s, transform 0.7s ease 1.2s",
              }}
            >
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-black border-white hover:bg-gray-100"
                  style={{ transition: "transform 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Resume Application
                </Button>
              </Link>
            </div> */}
          </div>
        </div>

        <style>{`
          @keyframes shimmerLine {
            0%   { transform: translateY(-100%); opacity: 0; }
            30%  { opacity: 1; }
            70%  { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes btnShine {
            0%   { left: -100%; }
            50%  { left: 150%; }
            100% { left: 150%; }
          }
        `}</style>
      </section>

      {/* Admission Alerts Section */}
      {portalStatus && (portalStatus.locked || portalStatus.programsLocked > 0) && (
        <section className="bg-white py-6">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start text-left gap-4">
              <div className="bg-red-100 p-2 rounded-full shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-bold text-lg">Admission Update</h3>
                {portalStatus.locked ? (
                  <p className="text-red-700 mt-1">
                    The general admission portal is currently <strong>closed</strong>. We are not accepting new applications at this time.
                  </p>
                ) : (
                  <p className="text-red-700 mt-1">
                    Please note that admission for <strong>{portalStatus.programsLocked} program(s)</strong> is currently closed. Other programs remain open.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Programs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-[#E5342C]">
              Our Programs
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the program that best fits your goals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {programs.map((program, index) => (
              <div
                key={program.name}
                onClick={() => setSelectedProgram(program.name)}
                className="relative flex flex-col justify-between p-5 rounded-2xl cursor-pointer"
                style={{
                  background: cardGradients[index % cardGradients.length],
                  minHeight: "220px",
                  boxShadow: "0 4px 24px rgba(120,60,160,0.10)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 12px 36px rgba(120,60,160,0.22)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(120,60,160,0.10)";
                }}
              >
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold" style={{ background: "rgba(255,255,255,0.55)" }}>
                  ›
                </div>

                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: iconBg[index % iconBg.length] }}>
                  {program.icon}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-base mb-1">
                    {program.name} Admission
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {program.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500 font-medium underline underline-offset-2 cursor-pointer hover:text-gray-700">
                    Learn More
                  </span>

                  <button
                    className="text-xs text-white font-semibold px-4 py-2 rounded-full"
                    style={{
                      background: btnColors[index % btnColors.length].bg,
                      transition: "background 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = btnColors[index % btnColors.length].hover;
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = btnColors[index % btnColors.length].bg;
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProgram(program.name);
                    }}
                  >
                    Start Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
