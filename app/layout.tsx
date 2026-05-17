import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundLayout } from "@/components/BackgroundLayout";
import { KeepAlive } from "@/components/KeepAlive";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/context/SidebarContext";
import { NavWrapper } from "./NavWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRECIOUS CORNERSTONE UNIVERSITY",
  description: "Submit your application and track your admission status",
  icons: {
    icon: "/e-portal/images/logo new.png",
  },
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
                <NavWrapper>{children}</NavWrapper>
              </BackgroundLayout>
            </ThemeProvider>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}