import Link from "next/link";
import { coursesData } from "./coursesData";

export default function AccreditedCourses() {
  return (
    <div id="accredited-courses" className="px-6 md:px-10 py-10 scroll-mt-40">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Accredited Postgraduate Courses
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coursesData.map((course) => (
          <div
            key={course.slug}
            className="border border-gray-100 shadow-sm rounded-sm overflow-hidden"
          >
            {/* Top accent line */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-24 h-0.5 bg-gray-800" />
            </div>

            {/* Course image */}
            <div className="px-4">
              <img
                src={course.heroImage}
                alt={course.heroTitle}
                className="w-full h-44 object-cover"
              />
            </div>

            {/* Title — strip the "PGD - " prefix for display */}
            <h3 className="text-center text-lg font-semibold text-gray-800 mt-4 mb-4">
              {course.heroTitle.replace(/^PGD\s*-\s*/i, "")}
            </h3>

            {/* Learn More button */}
            <div className="flex justify-center pb-6">
              <Link
                href={`/Postgraduate/${course.slug}`}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-8 py-2.5 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

