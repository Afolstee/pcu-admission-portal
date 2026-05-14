"use client";

import Link from "next/link";

interface SidebarLink {
  label: string;
  href: string;
}

const postgraduateLinks: SidebarLink[] = [
  { label: "Postgraduate School", href: "/Postgraduate" },
  { label: "Academic Calendar", href: "#academic-calendar" },
  { label: "Undergraduate Programs", href: "/Undergraduate" },
];

const undergraduateLinks: SidebarLink[] = [
  { label: "Foundation Program", href: "/FoundationProgram" },
  { label: "Undergraduate Programs", href: "/Undergraduate" },
  { label: "Life at PCU", href: "#life-at-pcu" },
];

const partTimeLinks: SidebarLink[] = [
  { label: "Part Time School", href: "/PartTime" },
  { label: "Academic Calendar", href: "#academic-calendar" },
  { label: "Postgraduate Programs", href: "/Postgraduate" },
];

const aboutLinks: SidebarLink[] = [
  { label: "Our History", href: "/AboutUs/OurHistory" },
  { label: "Vision & Mission", href: "/AboutUs/VisionMission" },
  { label: "Spirituality in PCU", href: "/AboutUs/Spirituality" },
  { label: "Leadership and Organization", href: "/AboutUs/Leadership" },
  { label: "PCU at a Glance", href: "/AboutUs/AtAGlance" },
];

interface PageSidebarProps {
  variant?: "postgraduate" | "undergraduate" | "parttime" | "about";
  activePath?: string;
}

export default function PageSidebar({
  variant = "postgraduate",
  activePath,
}: PageSidebarProps) {
  const links =
    variant === "undergraduate"
      ? undergraduateLinks
      : variant === "parttime"
        ? partTimeLinks
        : variant === "about"
          ? aboutLinks
          : postgraduateLinks;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-52 shrink-0 pt-6 sticky top-24 h-fit space-y-8">
        <nav>
          {links.map((link) => {
            const isActive = activePath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2.5 px-4 text-sm transition-all duration-300 rounded-lg mb-1 ${
                  isActive
                    ? "bg-[#B91C1C] text-white font-bold shadow-md shadow-red-900/20"
                    : "text-gray-600 hover:bg-gray-50 border-transparent"
                }`}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#54255F";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLAnchorElement).style.color = "";
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Quick Links */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 border-b pb-2 text-xs uppercase tracking-widest">
            Quick Links
          </h4>
          <ul className="space-y-3">
            <li>
              <Link
                href="/FoundationProgram"
                className="text-sm hover:underline flex items-center gap-2 transition-colors"
                style={{ color: "#54255F" }}
              >
                <span>&bull;</span> Foundation Program
              </Link>
            </li>
            <li>
              <Link
                href="/Undergraduate"
                className="text-sm hover:underline flex items-center gap-2 transition-colors"
                style={{ color: "#54255F" }}
              >
                <span>&bull;</span> Undergraduate Programs
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-sm hover:underline flex items-center gap-2 transition-colors"
                style={{ color: "#54255F" }}
              >
                <span>&bull;</span> Research & Collections
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm hover:underline flex items-center gap-2 transition-colors"
                style={{ color: "#54255F" }}
              >
                <span>&bull;</span> Life at PCU
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Mobile Quick Links (Appears at bottom of content) */}
      <div className="md:hidden w-full mt-12 pt-8 border-t border-gray-100">
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-4 border-b pb-2 text-sm uppercase tracking-widest text-center">
            Quick Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/FoundationProgram"
              className="text-sm p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center"
              style={{ color: "#54255F" }}
            >
              Foundation Program
            </Link>
            <Link
              href="/Undergraduate"
              className="text-sm p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center"
              style={{ color: "#54255F" }}
            >
              Undergraduate Programs
            </Link>
            <a
              href="#"
              className="text-sm p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center"
              style={{ color: "#54255F" }}
            >
              Research & Collections
            </a>
            <a
              href="#"
              className="text-sm p-3 bg-white rounded-lg border border-gray-100 shadow-sm text-center"
              style={{ color: "#54255F" }}
            >
              Life at PCU
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

