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
import { LogOut, Users, Lock, Unlock, Settings, ShieldCheck, UserCog } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ICTDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/auth/login");
      return;
    }

    loadSettings();
  }, [isAuthenticated, user, router]);

  const loadSettings = async () => {
    try {
      const response = await ApiClient.fetch<any>("/settings/all");
      setSettings(response.settings || []);
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
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ICT Portal...</p>
        </div>
      </div>
    );
  }

  const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value === "true";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo new.png"
              alt="PCU Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-lg text-slate-800">
              PCU ICT Portal - Director
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ICT Management Dashboard
          </h1>
          <p className="text-slate-500">
            Control portal access, manage staff roles, and oversee system settings.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/ict/staff">
                <Card className="hover:shadow-md transition-all cursor-pointer h-full border-l-4 border-l-blue-500 group">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <Users className="h-6 w-6" />
                      Staff Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create staff accounts, assign roles (Lecturer, Admissions Officer, etc.), and manage status.
                    </p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Primary Control
                    </Badge>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/ict/students">
                <Card className="hover:shadow-md transition-all cursor-pointer h-full border-l-4 border-l-purple-500 group">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                      <UserCog className="h-6 w-6" />
                      Student Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Direct access to student profiles, matric numbers, and academic record management.
                    </p>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Portal Admin
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Portal Controls */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-orange-600" />
                  <CardTitle className="text-xl">Global Portal Controls</CardTitle>
                </div>
                <CardDescription>
                  Enable or disable major portal functionalities instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No settings found in system.</p>
                ) : (
                  settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold text-slate-900 capitalize">
                          {setting.key.replace(/_/g, " ")}
                        </Label>
                        <p className="text-sm text-slate-500">
                          {setting.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${setting.value === "true" ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"}`}>
                           {setting.value === "true" ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                           {setting.value === "true" ? "LOCKED" : "ACTIVE"}
                        </Badge>
                        <Switch
                          checked={setting.value === "true"}
                          onCheckedChange={() => handleToggleSetting(setting.key, setting.value)}
                          disabled={updating}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Settings className="h-24 w-24 rotate-12" />
              </div>
              <CardHeader>
                <CardTitle className="text-white">System Status</CardTitle>
                <CardDescription className="text-slate-400">Environment: Production</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Database:</span>
                  <span className="text-green-400 font-medium">Connected</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">API Gateway:</span>
                  <span className="text-green-400 font-medium">Healthy</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Mailing Service:</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-2">LAST SYSTEM UPDATE</p>
                  <p className="text-sm font-mono text-slate-300">Mar 11, 2026 - 15:30</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Admissions Officers:</span>
                      <span className="font-bold">2</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Lecturers:</span>
                      <span className="font-bold">48</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Deans / HODs:</span>
                      <span className="font-bold">12</span>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
