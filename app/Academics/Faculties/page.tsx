"use client";

import React from "react";
import Link from "next/link";

const faculties = [
  {
    title: "Pure And Applied Sciences",
    description: "The Faculty is saddled with the responsibility to engage all its Academics in leading researches and inventions that provokes change for growth and development relatively to the society.",
    href: "/Academics/Faculties/PureAppliedSciences",
    image: "e-portal/images/sciences.jpeg",
  },
  {
    title: "Social And Management Sciences",
    description: "The faculty fosters the growth and development of intellectuals and creativity in both students and faculties of the university in the field of social and management sciences",
    href: "/Academics/Faculties/SocialManagementSciences",
    image: "e-portal/images/social-sciences.jpeg",
  },
];

export default function FacultiesPage() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[#1a1a1a]/80 z-10" />
        <img 
          src="e-portal/images/school1.png" 
          alt="Faculties Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            Faculties
          </h1>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a237e] mb-6">
          Explore Our Programs
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          The University currently has two faculties offering 13 different courses cut across different specialisations.
        </p>
      </section>

      {/* Faculty Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10">
          {faculties.map((faculty, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col"
            >
              {/* Faculty Image */}
              <div className="h-64 bg-gray-200 relative">
                <img 
                  src={faculty.image} 
                  alt={faculty.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-[#1a237e] mb-4">
                  {faculty.title}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed flex-1">
                  {faculty.description}
                </p>
                <Link 
                  href={faculty.href}
                  className="inline-flex items-center text-sm font-bold tracking-widest text-[#1a237e] hover:text-red-600 transition-colors group"
                >
                  LEARN MORE 
                  <svg 
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2.5} 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

