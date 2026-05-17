"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PureAppliedSciencesPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Welcome Message Section */}
        <div className="grid lg:grid-cols-3 gap-12 items-start mb-20">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-[#1a237e] mb-8 text-center lg:text-left">
              Welcome Message
            </h2>
            <div className="text-gray-700 leading-relaxed space-y-6 text-justify">
              <p>
                Welcome to the official web page of the Faculty of Pure and Applied Sciences, 
                Precious Cornerstone University, Ibadan, Nigeria. The Faculty was established 
                in 2017 as one of the foundation faculties of the University. The faculty houses 
                two departments with six undergraduate degree programmes in Biochemistry, 
                Computer Science, Industrial Chemistry, Industrial Mathematics, Microbiology 
                and Physics with Electronics. In line with the ultimate goal of the university, 
                the faculty fosters the growth and development of intellectuals and creativity 
                in both students and faculties of the university in the field of pure and applied 
                sciences; through the delivery of a well designed training curriculum tailored 
                to our degree and development programmes, with strong cordial emphasis on 
                academic research, discovery, inventions and publications for career advancement.
              </p>
              <p>
                As one of the primary objectives of the Faculty, the Faculty is saddled with the 
                responsibility to engage all its Academics in leading researches and inventions 
                that provokes change for growth and development relatively to the society. For 
                detailed information on degree and development programme and academic 
                activities offered by the Faculty, please take time to visit the corresponding 
                department web sites.
              </p>
              <p className="font-semibold text-[#1a237e]">
                Dean, Faculty of Pure and Applied Sciences.
              </p>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-40">
            {/* Faculty Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img 
                src="/e-portal/images/sciences.jpeg" 
                alt="Faculty of Pure and Applied Sciences" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Academic Calendar Component */}
            <div className="bg-white border-t-4 shadow-lg border border-gray-100 p-8 rounded-sm" style={{ borderTopColor: "#1a237e" }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Academic Calendar</h3>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-6" />
              <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">View all dates of key PCU academic activities and events.</p>
              <div className="flex justify-center">
                <a href="#" className="inline-flex items-center gap-2 border border-gray-300 px-6 py-2.5 text-sm font-bold rounded-sm hover:bg-gray-50 transition-colors">View Calendar &rarr;</a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ / Accordion Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1a237e] text-center mb-12">FAQ</h2>
          
          <Accordion type="single" collapsible className="w-full border border-gray-200 rounded-lg overflow-hidden">
            {/* Departments Item */}
            <AccordionItem value="departments" className="border-b border-gray-200 px-6">
              <AccordionTrigger className="text-lg font-bold text-gray-800 hover:no-underline py-6">
                + Departments
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-8">
                <p className="mb-4">The faculty houses two departments namely:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Department of Natural Sciences</li>
                  <li>Department of Physical Sciences</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* Degree Programs Item */}
            <AccordionItem value="programs" className="px-6 border-none">
              <AccordionTrigger className="text-lg font-bold text-gray-800 hover:no-underline py-6">
                + Degree Programs & Courses
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-8">
                <p className="mb-6">The faculty through the Departments runs several Degree Programmes & Courses namely:</p>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">1. Department of Natural Sciences</h4>
                    <ul className="list-none pl-6 space-y-2 text-red-600 font-medium">
                      <li>
                        <Link href="/Undergraduate/biochemistry" className="hover:underline">
                          A. Biochemistry (B.Sc in Biochemistry)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/microbiology" className="hover:underline">
                          B. Microbiology (B.Sc in Microbiology)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/microbiology-postgraduate" className="hover:underline">
                          C. M.Sc Microbiology
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/microbiology-postgraduate" className="hover:underline">
                          D. Ph.D Microbiology
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">2. Department of Physical Sciences</h4>
                    <ul className="list-none pl-6 space-y-2 text-red-600 font-medium">
                      <li>
                        <Link href="/Undergraduate/computer-science" className="hover:underline">
                          A. Computer Science (B.Sc in Computer Science)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/industrial-chemistry" className="hover:underline">
                          B. Industrial Chemistry (B.Sc in Industrial Chemistry)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/industrial-mathematics" className="hover:underline">
                          C. Industrial Mathematics (B.Sc in Industrial Mathematics)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/physics-with-electronics" className="hover:underline">
                          D. Physics with Electronics (B.Sc in Physics with Electronics)
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}

