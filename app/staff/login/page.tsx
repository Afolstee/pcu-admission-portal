"use client";

import Image from "next/image";
import { useState } from "react";
import { ApiClient } from "@/lib/api";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/e-portal/ict/dashboard",
  ictdirector: "/e-portal/ict/dashboard",
  admissionofficer: "/e-portal/admission_officer/dashboard",
  lecturer: "/e-portal/lecturer/dashboard",
  deo: "/e-portal/deo/dashboard",
  hod: "/e-portal/hod/dashboard",
  dean: "/e-portal/dean/dashboard",
  registrar: "/e-portal/registrar/dashboard",
  pgdean: "/e-portal/pgadmin/dashboard",
  pgadmin: "/e-portal/pgadmin/dashboard",
  ptadmin: "/e-portal/ptadmin/dashboard",
};

const APPLICANT_ROLES = ["applicant", "freshapplicant"];

export default function StaffLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await ApiClient.login(form.email, form.password);
      const role: string = data?.user?.role ?? "";

      if (APPLICANT_ROLES.includes(role) || role === "student") {
        setError("Access denied.");
        return;
      }

      if (!ROLE_REDIRECTS[role]) {
        setError("Access denied.");
        return;
      }

      ApiClient.setToken(data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      window.location.href = ROLE_REDIRECTS[role];
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-900 p-4 font-sans">
      <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-white/5 px-8 py-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex w-fit justify-center rounded-2xl bg-white p-1.5 shadow-md">
            <Image
              src="/e-portal/images/logo new.png"
              alt="University Logo"
              width={120}
              height={120}
              className="h-[72px] w-[72px] object-contain"
            />
          </div>
          <h1 className="mb-1 text-2xl font-bold text-white">Staff Portal</h1>
          <p className="text-xs text-white/50">
            Precious Cornerstone University
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="staff-email"
              className="text-sm font-medium text-white/70"
            >
              Email / Username
            </label>
            <input
              id="staff-email"
              type="text"
              autoComplete="username"
              placeholder="your@pcu.edu.ng"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="staff-password"
              className="text-sm font-medium text-white/70"
            >
              Password
            </label>
            <input
              id="staff-password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
