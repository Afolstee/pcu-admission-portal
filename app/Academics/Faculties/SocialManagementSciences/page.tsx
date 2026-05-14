"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SocialManagementSciencesPage() {
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
                Welcome to the Faculty of Social and Management Sciences at Precious Cornerstone University. 
                Our faculty is committed to excellence in teaching, research, and community service. 
                We aim to produce graduates who are not only academically sound but also ethically 
                conscious and ready to take on leadership roles in the global economy.
              </p>
              <p>
                The faculty fosters the growth and development of intellectuals and creativity in 
                both students and faculties of the university in the field of social and management 
                sciences. We offer a range of undergraduate programmes designed to equip students 
                with the skills and knowledge needed for successful careers in business, finance, 
                economics, and management.
              </p>
              <p className="font-semibold text-[#1a237e]">
                Dean, Faculty of Social and Management Sciences.
              </p>
            </div>
          </div>

          <div className="space-y-8 lg:sticky lg:top-40">
            {/* Faculty Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
              <img 
                src="/e-portal/images/social-sciences.jpeg" 
                alt="Faculty of Social and Management Sciences" 
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
                <p className="mb-4">The faculty houses several departments namely:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Department of Accounting and Finance</li>
                  <li>Department of Business Administration</li>
                  <li>Department of Economics</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* Degree Programs Item */}
            <AccordionItem value="programs" className="px-6 border-none">
              <AccordionTrigger className="text-lg font-bold text-gray-800 hover:no-underline py-6">
                + Degree Programs & Courses
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-8">
                <p className="mb-6">The faculty offers the following Degree Programmes & Courses:</p>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">1. Department of Accounting and Finance</h4>
                    <ul className="list-none pl-6 space-y-2 text-red-600 font-medium">
                      <li>
                        <Link href="/Undergraduate/accounting" className="hover:underline">
                          A. Accounting (B.Sc in Accounting)
                        </Link>
                      </li>
                      
                      <li>
                        <Link href="/Undergraduate/actuarial-science" className="hover:underline">
                          B. Actuarial Science (B.Sc in Actuarial Science)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/accounting-postgraduate" className="hover:underline">
                          C. M.Sc Accounting
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/accounting-postgraduate" className="hover:underline">
                          D. Ph.D Accounting
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">2. Department of Business Administration</h4>
                    <ul className="list-none pl-6 space-y-2 text-red-600 font-medium">
                      <li>
                        <Link href="/Undergraduate/business-administration" className="hover:underline">
                          A. Business Administration (B.Sc in Business Administration)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/business-administration-postgraduate" className="hover:underline">
                          B. MBA
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/business-administration-postgraduate" className="hover:underline">
                          C. M.Sc Business Admin
                        </Link>
                      </li>
                      <li>
                        <Link href="/Postgraduate/business-administration-postgraduate" className="hover:underline">
                          D. Ph.D Business Admin
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/banking-and-finance" className="hover:underline">
                          E. Banking and Finance (B.Sc In Banking and Finance)
                        </Link>
                      </li>
                      <li>
                        <Link href="/Undergraduate/Marketing" className="hover:underline">
                          F. Marketing (B.Sc In Marketing)

                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">3. Department of Economics</h4>
                    <ul className="list-none pl-6 space-y-2 text-red-600 font-medium">
                      <li>
                        <Link href="/Undergraduate/economics" className="hover:underline">
                          A. Economics (B.Sc in Economics)
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

