"use client";

import React from "react";
import Image from "next/image";

interface BackgroundLayoutProps {
  children: React.ReactNode;
}

export function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Fixed background logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <Image
          src="/images/logo new.png"
          alt="Background Logo"
          width={400}
          height={400}
          className="opacity-20 object-contain"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}