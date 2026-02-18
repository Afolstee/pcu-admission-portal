import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BackgroundLayout } from "@/components/BackgroundLayout";

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
          <BackgroundLayout>{children}</BackgroundLayout>
        </AuthProvider>
      </body>
    </html>
  );
}