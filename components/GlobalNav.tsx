"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  UserPlus,
  Bell,
  Users,
  BookOpen,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
  Briefcase,
  History,
  Lock,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const LANDING_NAV_ITEMS = [
  { label: 'Undergraduate', href: '/student/login', icon: GraduationCap },
  { label: 'Postgraduate', href: '/postgraduate', icon: BookOpen },
  { label: 'Part Time', href: '/part-time', icon: Briefcase },
  { label: 'Admissions', href: '/auth/signup', icon: UserPlus },
  { label: 'News & Events', href: '/news', icon: Bell },
  { label: 'Staff Portal', href: '/staff/login', icon: Users },
];

const APPLICANT_NAV_ITEMS = [
  { label: 'Dashboard', href: '/applicant/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/applicant/transactions', icon: CreditCard },
  { label: 'Change Password', href: '/applicant/change-password', icon: Lock },
];

export function GlobalNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { isOpen, toggle } = useSidebar();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const isApplicantPortal = isAuthenticated && user?.role === 'applicant';
  
  // Perceived performance: if we have a user (even while loading), show their nav items immediately
  const navItems = (isLoading && !user) ? [] : (isApplicantPortal ? APPLICANT_NAV_ITEMS : LANDING_NAV_ITEMS);

  return (
    <>
      {/* Top Header - "Only the name of the authenticated user" */}
      <header 
        className="fixed top-0 right-0 h-16 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 z-[90] transition-all duration-300 ease-in-out flex items-center justify-end px-8"
        style={{ left: "var(--sidebar-width)" }}
      >
        {isLoading ? null : (isAuthenticated ? (
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700 capitalize">{user?.first_name} {user?.last_name}</span>
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                  <User size={14} className="text-[#6b21a8]" />
                </div>
              </div>
            </div>
            {/* Sign Out removed from TopBar per user request for Admissions Portal */}
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <Link href="/staff/login" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
              Add other links
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#d9251b] hover:bg-red-800 text-white rounded-full px-6 h-9 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/10">
                Apply Now
              </Button>
            </Link>
          </div>
        ))}
      </header>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-100 border-r border-slate-200 z-[100] transition-all duration-300 ease-in-out shadow-2xl flex flex-col justify-between",
          isOpen ? "w-[280px]" : "w-[80px]"
        )}
      >
        <div>
          {/* Logo Area */}
          <div className="flex items-center h-16 px-4 border-b border-slate-200/50 relative bg-slate-100/50">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/images/logo new.png"
                alt="PCU Logo"
                width={35}
                height={35}
                className="object-contain"
              />
              <span className={cn(
                "font-black text-sm text-slate-800 tracking-tighter uppercase transition-all duration-300 overflow-hidden",
                isOpen ? "opacity-100 w-auto ml-2" : "opacity-0 w-0"
              )}>
                PCU Portal
              </span>
            </Link>
            
            <button 
              onClick={toggle}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 bg-white border border-slate-100 shadow-lg rounded-xl p-1.5 text-slate-500 hover:text-purple-600 hover:border-purple-100 transition-all z-[110]",
                isOpen ? "right-4" : "-right-4"
              )}
            >
              {isOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-3 py-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.label} 
                  href={item.href}
                  className={cn(
                    "flex items-center transition-all duration-200 group relative",
                    isOpen ? "px-4 py-2 rounded-xl" : "justify-center py-2 rounded-2xl mx-1",
                    !isActive && "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-300 shrink-0",
                    "w-11 h-11 rounded-xl border shadow-sm",
                    isActive 
                      ? "bg-[#6b21a8] border-[#6b21a8] text-white shadow-[#6b21a8]/20" 
                      : "bg-white border-slate-100 text-slate-500 group-hover:border-purple-200 group-hover:scale-105"
                  )}>
                    <item.icon size={20} className={cn(isActive && "animate-pulse")} />
                  </div>
                  
                  <span className={cn(
                    "font-bold text-[12px] tracking-tight whitespace-nowrap transition-all duration-300 overflow-hidden",
                    isOpen ? "opacity-100 w-auto ml-4" : "opacity-0 w-0",
                    isActive ? "text-[#6b21a8]" : "text-slate-500 group-hover:text-slate-900"
                  )}>
                    {item.label}
                  </span>

                  {!isOpen && (
                    <div className="absolute left-full ml-6 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (Logout for Admissions) */}
        <div className="px-3 pb-8 space-y-3">
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center transition-all duration-200 text-slate-500 hover:text-red-600 rounded-xl group relative",
                isOpen ? "px-4 py-2" : "justify-center py-2"
              )}
            >
              <div className={cn(
                "flex items-center justify-center transition-all duration-300 shrink-0",
                "w-11 h-11 rounded-xl border border-slate-100 bg-white shadow-sm",
                "group-hover:border-red-200 group-hover:bg-red-50 group-hover:scale-105 group-hover:text-red-600"
              )}>
                <LogOut size={20} />
              </div>
              <span className={cn(
                "font-bold text-[12px] tracking-tight ml-4 transition-all duration-300 overflow-hidden",
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                Sign Out
              </span>
              {!isOpen && (
                <div className="absolute left-full ml-6 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  Sign Out
                </div>
              )}
            </button>
          )}

          <div className="px-1">
            <div className={cn(
               "bg-slate-200/50 rounded-2xl p-4 transition-all duration-300 border border-slate-200",
               isOpen ? "opacity-100" : "sr-only opacity-0 pointer-events-none"
            )}>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
