import { notFound } from "next/navigation";
import CourseDetailPage from "../../../PartTime/CourseDetailPage";
import { coursesData } from "../../../PartTime/coursesData";

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
