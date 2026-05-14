import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundLayout } from "@/components/BackgroundLayout";

import { Footer } from "@/components/Footer";
import PcuFooter from "./HomePage/PcuFooter";
import NavBar from "./HomePage/NavBar";
import { AdmissionHero } from "./HomePage/AdmissionHero";

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
        <AuthProvider>
          <BackgroundLayout>
            {/* <Header /> */}
            <NavBar />
            {/* main content pushed down to avoid fixed header */}
            <main>{children}</main>
<AdmissionHero/>
            <PcuFooter />
          </BackgroundLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
