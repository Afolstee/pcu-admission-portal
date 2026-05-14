"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ProgramModal } from "@/components/ProgramModal";

import { FileText, CheckCircle2, Users } from "lucide-react";

import { AboutSection } from "./HomePage/about";
import CampusLife from "./HomePage/CampusLife";
import PCUPrograms from "./HomePage/PCUPrograms";
import OurPartners from "./HomePage/OurPartners";
import OtherNews from "./HomePage/OtherNews";
import UpcomingEvents from "./HomePage/UpcomingEvents";
import { AdmissionHero } from "./HomePage/AdmissionHero";
import PcuFooter from "./HomePage/PcuFooter";

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
            src="images/school1.png"
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

            {/* Animated underline */}

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
                Welcome to Precious
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
                Cornerstone University
              </h1>
            </div>
            <div
              style={{
                height: "2px",
                backgroundColor: "white",
                marginTop: "10px",
                width: heroVisible ? "300px" : "0px",
                transition: "width 0.8s ease 0.7s",
              }}
            />

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
      </div>
      <AboutSection />
     
      {/* LEFT: Campus Life + Our Partners | RIGHT: PCU Programs + Other News */}
      <div className="flex justify-center bg-white">
        <div className="flex flex-col md:flex-row w-full max-w-5xl">
          {/* Left column */}
          <div className="w-full md:w-[35%] shrink-0">
            <CampusLife />
            <OurPartners />
          </div>

          {/* Right column */}
          <div className="w-full md:w-[65%]">
            <PCUPrograms />
            <OtherNews />
            <UpcomingEvents />
          </div>
        </div>
      </div>

      {/* Row 3: Upcoming Events (full width) */}
    </div>
  );
}
