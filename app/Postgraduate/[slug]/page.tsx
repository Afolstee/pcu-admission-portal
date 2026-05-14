import { coursesData } from "../coursesData";
import CourseDetailPage from "../CourseDetailPage";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generates static routes for all courses at build time
export function generateStaticParams() {
  return coursesData.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = coursesData.find((c) => c.slug === slug);

  if (!course) return notFound();

  return <CourseDetailPage course={course} />;
}
