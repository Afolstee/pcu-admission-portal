import React from "react";
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundLayout } from "@/components/BackgroundLayout";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { KeepAlive } from "@/components/KeepAlive";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PCU Admission Portal",
  description: "Submit your application and track your admission status",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <KeepAlive />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <BackgroundLayout>
              <NavBar />
              {/* main content pushed down to avoid fixed header */}
              <main className="pt-14">{children}</main>
              <Footer />
            </BackgroundLayout>
          </ThemeProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
