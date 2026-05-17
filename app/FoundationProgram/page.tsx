"use client";

import { useState } from "react";
import Link from "next/link";
import PageSidebar from "../components/PageSidebar";

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
    <div className="border border-[#54255f]/10 mb-2 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-[15px] font-semibold text-[#54255f]">{title}</span>
        <span className="ml-4 shrink-0 text-[#b91c1c] text-xl leading-none font-light select-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-6 pt-1 bg-white border-t border-gray-100 text-[14px] text-gray-700 leading-relaxed">
          {Array.isArray(content) ? (
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 mt-2">
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

export default function FoundationProgramPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const faqs = [
    {
      title: "What are the requirements for admission into the JUPEB Programmes?",
      content: [
        "Candidate must have 5 O-Level Credits in Senior Secondary School Certificate Examination at one sitting or 6 O-Level Credits in not more than two sittings.",
        "Candidate must apply."
      ]
    },
    {
      title: "Is UTME required for admission into JUPEB Programme?",
      content: "No, UTME is not strictly required for admission into the JUPEB programme, as JUPEB is a direct-entry preparatory program. However, candidates must meet the O-Level requirements."
    },
    {
      title: "Is JUPEB Programme designed for Science, Social Sciences or Art students?",
      content: "The JUPEB Programme is designed for all disciplines. There are subject combinations available for Science, Social Sciences, and Art students."
    },
    {
      title: "How do I apply?",
      content: "You can apply online by clicking the 'Apply for this course' button below or visiting our e-portal. Follow the instructions to fill out the application form and make the necessary payments."
    },
    {
      title: "Need Help?",
      content: "Contact our admissions office at admissions@pcu.edu.ng or call our help desk for immediate assistance."
    }
  ];

  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src="/e-portal/images/school1.png"
          alt="Foundation Program at PCU"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(185,28,28,0.8) 0%, rgba(84,37,95,0.8) 100%)" }} />
        <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-10 pb-10 max-w-5xl mx-auto">
          <span className="text-xs uppercase tracking-[0.4em] text-white/80 mb-3">
            Admissions
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl">
            Foundation Program
          </h1>
        </div>
      </div>

      <div className="flex justify-center bg-white">
        <div className="flex flex-col md:flex-row w-full max-w-6xl py-16 px-6 gap-12">
          
          {/* Left Sidebar */}
          <div className="order-last md:order-first w-full md:w-1/4">
            <PageSidebar variant="undergraduate" activePath="/FoundationProgram" />
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 md:w-3/4">
            
            {/* Get Started Section */}
            <div className="flex flex-col md:flex-row gap-10 mb-16">
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-[#54255f] mb-6 text-center md:text-left">
                  Get Started
                </h2>
                <div className="space-y-5 text-[15px] text-gray-700 leading-relaxed text-justify">
                  <p>
                    Joint Universities Preliminaries Examination Board (JUPEB) Preliminary Programmes is a year preparatory advanced level programme, conducted by the Joint Universities Preliminaries Examination Board to prepare students for Direct-Entry Admissions into the University.
                  </p>
                  <p>
                    Students who have been exposed to a minimum of one-year approved preparatory courses in Precious Cornerstone University and subsequently have passed can seek Direct-Entry Admission into the University Degree Programmes at 200 level.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src="/e-portal/images/social-sciences.jpeg"
                    alt="Foundation Program Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#54255f] mb-8 text-center">
                FAQ
              </h2>
              <div>
                {faqs.map((faq, i) => (
                  <Accordion
                    key={i}
                    title={faq.title}
                    content={faq.content}
                    isOpen={openIndex === i}
                    onToggle={() => toggle(i)}
                  />
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-8 flex justify-start">
              <Link
                href="/Admissions"
                className="inline-flex items-center gap-2 bg-[#b91c1c] hover:bg-[#8e1515] text-white font-semibold px-8 py-3.5 transition-colors"
              >
                Apply for this course
                <span className="text-lg leading-none">➔</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
