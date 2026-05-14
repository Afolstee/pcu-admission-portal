"use client";

import PostgraduateHero from "./PostgraduateHero";
import DeansSpeech from "./DeansSpeech";
import OurMission from "./OurMission";
import AccreditedCourses from "./AccreditedCourses";
import PageSidebar from "../components/PageSidebar";
import { useEffect } from "react";

export default function PostgraduatePage() {
  useEffect(() => {
    // Handle scrolling to anchor on page load or when hash changes
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    // Scroll on initial load
    handleHashScroll();

    // Listen for hash changes (when clicking links from same page)
    window.addEventListener("hashchange", handleHashScroll);

    return () => {
      window.removeEventListener("hashchange", handleHashScroll);
    };
  }, []);

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* Hero banner — full width */}
      <PostgraduateHero />

      {/* Body: Sidebar (left) + Content (right) */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-5xl py-10 px-4 gap-10 items-stretch">
          {/* Left: Sidebar nav */}
          <PageSidebar activePath="/Postgraduate" />

          {/* Right: Main content stacked */}
          <div className="flex-1 min-w-0">
            <DeansSpeech />
            <OurMission />
            <AccreditedCourses />
          </div>
        </div>
      </div>
    </div>
  );
}