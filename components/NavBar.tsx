"use client";

import React from "react";

export function NavBar() {
  return (
    <nav
      className="fixed top-0 w-full z-50 text-white"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* Gradient bar at very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#f5a623] via-white/40 to-[#c0392b]" />

      <div
        className="w-full px-6 lg:px-12 h-14 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(90deg, #3d2b3d 0%, #5a3f5a 40%, #6b4f6b 70%, #4a3050 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.35)",
        }}
      >
        {/* LEFT — Contact info */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors duration-200 group">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#f5a623]/30 transition-colors duration-200">
              <img
                src="/images/phone-call (2).png"
                alt="phone"
                className="w-3.5 h-3.5"
              />
            </span>
            <span className="hidden sm:inline tracking-wide">
              09133516780, 08060051554
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-white/20" />

          <div className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors duration-200 group">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#f5a623]/30 transition-colors duration-200">
              <img
                src="/images/email (1).png"
                alt="email"
                className="w-3.5 h-3.5"
              />
            </span>
            <span className="hidden md:inline tracking-wide">
              admissionspcu@gmail.com
            </span>
          </div>
        </div>

        {/* CENTER — Social icons */}
        <div className="flex items-center gap-2">
          {[
            {
              src: "/images/facebook (2).png",
              alt: "Facebook",
              label: "Facebook",
            },
            {
              src: "/images/instagram (4).png",
              alt: "Instagram",
              label: "Instagram",
            },
            {
              src: "/images/linkedin.png",
              alt: "LinkedIn",
              label: "LinkedIn",
            },
          ].map(({ src, alt, label }) => (
            <a
              key={label}
              href="#"
              target="_blank"
              title={label}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(245,166,35,0.35)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0)";
              }}
            >
              <img src={src} alt={alt} className="w-4 h-4" />
            </a>
          ))}
        </div>

        {/* RIGHT — Main website link */}
        <a
          href="#"
          className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/25 transition-all duration-300"
          style={{
            background: "rgba(255,255,255,0.07)",
            letterSpacing: "0.08em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(245,166,35,0.25)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(245,166,35,0.6)";
            (e.currentTarget as HTMLElement).style.transform =
              "translateX(2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(255,255,255,0.25)";
            (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
          }}
        >
          <span className="hidden sm:inline">Main PCU Website</span>
          <img
            src="/images/right-arrow (6).png"
            alt="arrow"
            className="w-3.5 h-3.5"
          />
        </a>
      </div>
    </nav>
  );
}
