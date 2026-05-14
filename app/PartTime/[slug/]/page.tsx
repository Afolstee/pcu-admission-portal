import { notFound } from "next/navigation";
import CourseDetailPage from "../CourseDetailPage";
import { coursesData } from "../coursesData";

export async function generateStaticParams() {
  return coursesData.map((course) => ({
    slug: course.slug,
  }));
}

export default function Page({ params }: { params: { slug: string } }) {
  const course = coursesData.find((c) => c.slug === params.slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailPage course={course} />;
}
