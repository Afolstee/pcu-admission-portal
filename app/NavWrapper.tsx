"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import NavBar from "./HomePage/NavBar";
import PcuFooter from "./HomePage/PcuFooter";

// All public/unauthenticated pages — no GlobalNav sidebar here
const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/about",
  "/academics",
  "/admissions",
  "/research",
  "/library",
  "/contact",
  "/postgraduate",
  "/part-time",
  "/news",
];

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublicPage || (!isAuthenticated && !isLoading)) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen flex flex-col">
          <div className="flex-grow">{children}</div>
        </main>
        <PcuFooter />
      </>
    );
  }

  return (
    <>
      <GlobalNav />
      <main className="transition-all duration-300 ease-in-out pl-[var(--sidebar-width)] pt-16 min-h-screen flex flex-col">
        <div className="flex-grow">{children}</div>
        <Footer />
      </main>
    </>
  );
}