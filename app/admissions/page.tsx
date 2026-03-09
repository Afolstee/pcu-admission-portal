"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramModal } from "@/components/ProgramModal";
import "../style.css";
import { FileText, CheckCircle2, Users } from "lucide-react";

const programs = [
  {
    name: "Undergraduate",
    icon: "🎓",
    description:
      "Begin your academic journey with our world-class undergraduate programmes.",
  },
  {
    name: "Postgraduate",
    icon: "📖",
    description:
      "Advance your expertise with research-driven postgraduate study.",
  },
  {
    name: "HND",
    icon: "🖥️",
    description:
      "Gain practical, industry-ready skills through our HND programmes.",
  },
  {
    name: "Part time",
    icon: "🕐",
    description:
      "Flexible learning designed to fit around your schedule and career.",
  },
  {
    name: "jupeb",
    icon: "📝",
    description:
      "A foundation programme bridging you to full university admission.",
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

const getCardStyle = (index: number) => {
  const styles = [
    {
      card: "bg-[#2d3748] text-white",
      btn: "bg-[#f5a623] text-white hover:bg-[#e09612]",
    }, // dark (01)
    {
      card: "bg-[#1a202c] text-white",
      btn: "bg-transparent text-white border border-white hover:bg-white/10",
    }, // darker (02)
    {
      card: "bg-[#f5a623] text-white",
      btn: "bg-white text-[#f5a623] hover:bg-gray-100",
    }, // orange (03)
    {
      card: "bg-[#c0392b] text-white",
      btn: "bg-[#f5a623] text-white hover:bg-[#e09612]",
    }, // red (04)
    {
      card: "bg-[#e0e0e0] text-gray-700",
      btn: "bg-[#d0d0d0] text-gray-500 cursor-not-allowed",
    }, // gray/disabled (05)
  ];
  return styles[index % styles.length];
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();
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
    <div className="min-h-screen bg-[#d9251b]">
      <div className="bg-[white] w-full md:w-[100%] mx-auto">
        {/* Hero Section */}
        <section className="relative h-[85vh] w-full overflow-hidden">
          {/* Background Video */}
          <img
            src="/images/school1.png"
            alt="Hero Background"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Animated shimmer line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "2px",
              height: "100%",
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
              animation: heroVisible
                ? "shimmerLine 2.5s ease-in-out infinite 1.8s"
                : "none",
              zIndex: 5,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full text-left px-14">
            {/* Welcome line */}
            <p
              className="text-l text-gray-200 mt-4 font-semibold text-white"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(-20px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}
            >
              Welcome to PRECIOUS CORNERSTONE
            </p>

            {/* Animated underline */}
            <div
              style={{
                height: "2px",
                backgroundColor: "white",
                marginTop: "10px",
                width: heroVisible ? "300px" : "0px",
                transition: "width 0.8s ease 0.7s",
              }}
            />

            {/* UNIVERSITY'S */}
            <div style={{ overflow: "hidden", marginTop: "24px" }}>
              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
                style={{
                  display: "inline-block",
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible
                    ? "translateY(0) skewY(0deg)"
                    : "translateY(100%) skewY(4deg)",
                  transition:
                    "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s",
                }}
              >
                UNIVERSITY&apos;S
              </h1>
            </div>

            {/* ADMISSION PORTAL */}
            <div style={{ overflow: "hidden" }}>
              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-white"
                style={{
                  display: "inline-block",
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible
                    ? "translateY(0) skewY(0deg)"
                    : "translateY(100%) skewY(4deg)",
                  transition:
                    "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s",
                }}
              >
                ADMISSION PORTAL
              </h1>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4  pt-8">
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
                    className="w-full sm:w-auto relative overflow-hidden"
                    style={{
                      transition: "transform 0.3s, box-shadow 0.3s",
                      backgroundColor: "#E5342C",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 25px rgba(0,0,0,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Shine sweep */}
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "60%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                        animation: heroVisible
                          ? "btnShine 3s ease-in-out infinite 2.2s"
                          : "none",
                        pointerEvents: "none",
                      }}
                    />
                    Apply Now
                  </Button>
                </Link>
              </div>

              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(30px)",
                  transition:
                    "opacity 0.7s ease 1.2s, transform 0.7s ease 1.2s",
                }}
              >
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent text-black border-white"
                    style={{
                      transition: "transform 0.3s, box-shadow 0.3s,",
                      backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 25px rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    Resume Application
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Keyframes */}
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

        {/* Programs Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: "rgb(229, 52, 44)" }}
              >
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
                    background: cardGradients[index],
                    minHeight: "220px",
                    boxShadow: "0 4px 24px rgba(120,60,160,0.10)",
                    transition: "transform 0.25s, box-shadow 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-5px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 12px 36px rgba(120,60,160,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 24px rgba(120,60,160,0.10)";
                  }}
                >
                  {/* Arrow badge top-right */}
                  <div
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.55)" }}
                  >
                    ›
                  </div>

                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3"
                    style={{ background: iconBg[index] }}
                  >
                    {program.icon}
                  </div>

                  {/* Title + description */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-base mb-1">
                      {program.name} Admission
                    </p>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {program.description}
                    </p>
                  </div>

                  {/* Footer row */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 font-medium underline underline-offset-2 cursor-pointer hover:text-gray-700">
                      Learn More
                    </span>

                    <button
                      className="text-xs text-white font-semibold px-4 py-2 rounded-full"
                      style={{
                        background: btnColors[index].bg,
                        transition: "background 0.2s, transform 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          btnColors[index].hover;
                        (e.currentTarget as HTMLElement).style.transform =
                          "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          btnColors[index].bg;
                        (e.currentTarget as HTMLElement).style.transform =
                          "scale(1)";
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
    </div>
  );
}
