"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Lock, Unlock, ShieldCheck, ArrowLeft, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SETTING_LABELS: Record<string, string> = {
  admission_registration_locked: "Admissions",
  undergraduate_admission_locked: "Undergraduate",
  postgraduate_admission_locked: "Postgraduate",
  part_time_admission_locked: "Part Time",
  jupeb_admission_locked: "JUPEB",
  course_registration_locked: "Course Registration",
  result_upload_locked: "Result Upload",
};

export default function ICTSettings() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "ict_director")) {
      router.replace("/staff/login");
      return;
    }

    loadSettings();
  }, [isAuthenticated, user, router]);

  const loadSettings = async () => {
    try {
      const response = await ApiClient.fetch<any>("/settings/all");
      const fetched = response.data?.settings || [];
      // Only include settings defined in SETTING_LABELS and in that order
      const ordered = Object.keys(SETTING_LABELS)
        .map(key => fetched.find((s: any) => s.key === key))
        .filter(Boolean);
      setSettings(ordered);
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (key: string, currentValue: string) => {
    setUpdating(true);
    const newValue = currentValue === "true" ? "false" : "true";
    try {
      await ApiClient.fetch<any>("/settings/update", {
        method: "POST",
        body: JSON.stringify({ key, value: newValue }),
      });
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
    } catch (err) {
      console.error("Error updating setting:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/staff/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/ict/dashboard" className="mr-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-lg text-slate-800">
              Control Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm border-r pr-4 border-slate-200">
              <p className="text-slate-500 text-right">ICT Director</p>
              <p className="font-medium text-slate-900 text-right">{user?.name}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
             <Settings className="h-8 w-8 text-slate-700" />
             System Settings & Locks
          </h1>
          <p className="text-slate-500">
            Globally enable or disable portal functionalities. Changes take effect immediately.
          </p>
        </div>

        <Card className="border-l-4 border-l-orange-500 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-orange-600" />
              <CardTitle className="text-xl">Global Portal Controls</CardTitle>
            </div>
            <CardDescription>
              Major system switches for admissions, registration, and result uploads.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            <div className="divide-y divide-slate-100">
              {settings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No settings found in system.</p>
              ) : (
                settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1 pr-8">
                      <Label className="text-base font-bold text-slate-900 block">
                        {SETTING_LABELS[setting.key] || setting.key.replace(/_/g, " ")}
                      </Label>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                        {setting.description || "No description provided for this system setting."}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Badge className={`${setting.value === "true" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"} px-3 py-1`}>
                           {setting.value === "true" ? <Lock className="h-3.5 w-3.5 mr-1.5" /> : <Unlock className="h-3.5 w-3.5 mr-1.5" />}
                           {setting.value === "true" ? "LOCKED" : "ACTIVE"}
                        </Badge>
                      </div>
                      <Switch
                        checked={setting.value === "true"}
                        onCheckedChange={() => handleToggleSetting(setting.key, setting.value)}
                        disabled={updating}
                        className="data-[state=checked]:bg-red-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl flex gap-4">
           <div className="text-blue-600">
             <ShieldCheck className="h-6 w-6" />
           </div>
           <div>
             <h4 className="font-bold text-blue-900 mb-1">Security Audit Note</h4>
             <p className="text-sm text-blue-700 leading-relaxed">
               All changes made here are logged with your administrative ID. Toggling these settings affects all users across their respective portals (Applicant, Student, and Staff).
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
