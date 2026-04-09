import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundLayout } from "@/components/BackgroundLayout";
import { GlobalNav } from "@/components/GlobalNav";
import { Footer } from "@/components/Footer";
import { KeepAlive } from "@/components/KeepAlive";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/context/SidebarContext";

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
          <SidebarProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <BackgroundLayout>
                <GlobalNav />
                <main className="transition-all duration-300 ease-in-out pl-[var(--sidebar-width)] pt-16 min-h-screen flex flex-col">
                  <div className="flex-grow">
                    {children}
                  </div>
                  <Footer />
                </main>
              </BackgroundLayout>
            </ThemeProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
