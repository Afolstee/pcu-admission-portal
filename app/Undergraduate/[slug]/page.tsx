import { undergraduateCourses } from "../undergraduateData";
import UndergraduateCourseDetailPage from "../CourseDetailPage";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return undergraduateCourses.map((course) => ({ slug: course.slug }));
}

export default async function UndergraduateCoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = undergraduateCourses.find((c) => c.slug === slug);

  if (!course) return notFound();

  return <UndergraduateCourseDetailPage course={course} />;
}
