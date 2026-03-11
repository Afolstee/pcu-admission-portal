"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * DEO has the same score-entry capabilities as a Lecturer.
 * We simply redirect to the Lecturer dashboard which already supports
 * the 'deo' role via the roles_required('lecturer','deo','admin') guard.
 */
export default function DEODashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/lecturer/dashboard");
  }, []);
  return null;
}
