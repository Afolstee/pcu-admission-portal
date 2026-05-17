"use client";

import { useEffect } from "react";
import { ApiClient } from "@/lib/api";

export function KeepAlive() {
  useEffect(() => {
    // Ping immediately when mounted
    ApiClient.healthCheck().catch((error) => {
      console.warn("Backend health check failed:", error);
    });

    // Ping every 10 minutes (10 * 60 * 1000 = 600,000 ms)
    const intervalId = setInterval(() => {
      ApiClient.healthCheck().catch((error) => {
        console.warn("Backend health check failed:", error);
      });
    }, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // This component handles logic only and renders nothing
  return null;
}
