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
     

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}