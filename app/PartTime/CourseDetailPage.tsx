import Link from "next/link";
import { CourseData } from "./coursesData";

interface CourseDetailPageProps {
  course: CourseData;
}

export default function CourseDetailPage({ course }: CourseDetailPageProps) {
  return (
    <div className="w-full bg-white font-sans text-gray-800">
      {/* ── HERO BANNER ── */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src={course.heroImage}
          alt={course.heroTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide text-center px-6">
            {course.heroTitle}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT: Sidebar (left) + Detail (right) ── */}
      <div className="flex justify-center">
        <div className="flex w-full max-w-5xl py-10 px-4 md:px-6 gap-10">
          {/* Right: Course detail */}
          <div className="flex-1 min-w-0 w-full">
            {/* Description */}
            <p className="text-sm md:text-base text-gray-700 leading-relaxed text-justify pb-8">
              {course.description}
            </p>

            {/* Apply Button */}
            <Link
              href={course.applyLink}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-7 py-3 transition-colors mb-10"
            >
              Apply for this course
              <span className="text-lg">➔</span>
            </Link>

            {/* ── BASIC ADMISSION REQUIREMENTS ── */}
            <section className="mb-12 mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Basic Admission Requirements
              </h2>

              {course.admissionRequirements.intro && (
                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  {course.admissionRequirements.intro}
                </p>
              )}

              <div className="space-y-6">
                {course.admissionRequirements.sections.map((section, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.points.map((point, j) => (
                        <p
                          key={j}
                          className="text-sm text-gray-700 leading-relaxed text-justify"
                        >
                          {point}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── AREA OF SPECIALIZATION (light bg) — full width ── */}
      <section className="bg-rose-50 py-10">
        <div className="flex justify-center">
          <div className="flex w-full max-w-5xl px-4 md:px-6 gap-10">
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Area of Specialization
              </h2>
              <p className="text-sm text-gray-700 mb-5">
                {course.areaOfSpecialization.intro}
              </p>
              <div className="space-y-1">
                {course.areaOfSpecialization.areas.map((area, i) => (
                  <p key={i} className="text-sm text-gray-700">
                    – {area}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMMES DURATION ── */}
      <section className="py-10">
        <div className="flex justify-center">
          <div className="flex w-full max-w-5xl px-4 md:px-6 gap-10">
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Programmes Duration
              </h2>
              {course.programmesDuration.intro && (
                <p className="text-sm text-gray-700 mb-6">
                  {course.programmesDuration.intro}
                </p>
              )}
              <div className="space-y-6">
                {course.programmesDuration.sections.map((section, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.points.map((point, j) => (
                        <p key={j} className="text-sm text-gray-700">
                          {point}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

