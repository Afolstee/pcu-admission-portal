"use client";

import { useState } from "react";
import Link from "next/link";
import { UndergraduateCourse } from "./undergraduateData";
import PageSidebar from "../components/PageSidebar";

interface Props {
  course: UndergraduateCourse;
}

// ── Accordion ────────────────────────────────────────────────────────────────

function Accordion({
  title,
  content,
  isOpen,
  onToggle,
}: {
  title: string;
  content: string | string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 mb-2 overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {/* + / – icon */}
        <span className="ml-4 shrink-0 text-gray-600 text-xl leading-none font-light select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Collapsible body */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-6 pt-1 bg-white border-t border-gray-100 text-sm text-gray-700 leading-relaxed">
          {Array.isArray(content) ? (
            <div className="space-y-2">
              {content.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          ) : (
            /* Preserve newlines from the requirements string */
            <div className="space-y-3">
              {content.split("\n\n").map((block, i) => (
                <p key={i} className={i === 0 ? "" : "mt-3"}>
                  {block}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UndergraduateCourseDetailPage({ course }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div className="w-full font-sans text-gray-800">

      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src={course.heroImage}
          alt={course.heroTitle}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(123,36,66,0.82) 0%, rgba(91,44,126,0.78) 100%)" }} />
        <div className="relative z-10 flex items-end justify-start h-full px-10 pb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {course.heroTitle}
          </h1>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        className="flex justify-center"
        // style={{
        //   backgroundImage: "url('/images/dot-bg-mono.jpg')",
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        // }}
      >
        <div className="flex w-full max-w-5xl py-10 px-4 md:px-6 gap-10">

          {/* Left: Sidebar */}
          <PageSidebar variant="undergraduate" activePath="/Undergraduate" />

          {/* Right: Content */}
          <div className="flex-1 min-w-0">

            {/* Short summary — shown above accordions */}
            <p className="text-sm text-gray-700 leading-relaxed mb-8">
              {course.shortSummary}
            </p>

            {/* ── ACCORDIONS ── */}
            <div>
              {course.accordions.map((acc, i) => (
                <Accordion
                  key={i}
                  title={acc.title}
                  content={acc.content}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>

            {/* Apply button below accordions */}
            <div className="mt-10">
              <Link
                href={course.applyLink}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3 transition-colors"
              >
                Apply for this course
                <span className="text-lg">➔</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

