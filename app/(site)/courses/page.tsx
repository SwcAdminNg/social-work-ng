import { fetchApi } from "@/lib/fetchApi";
import { CourseCard } from "@/components/learning/CourseCard";
import Link from "next/link";

export const metadata = {
  title: "Courses | Social Work Nigeria",
  description: "Browse our catalog of professional courses and materials.",
};

export default async function CoursesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const search = searchParams.search as string | undefined;

  let url = `/courses?page=${page}&limit=20`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetchApi(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  const items = Array.isArray(data?.data) ? data.data : data?.data?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
          Accelerate Your{" "}
          <span className="text-[#2D6A4F] dark:text-[#52b788]">
            Professional Growth
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover our curated library of premium courses designed specifically
          for social workers, educators, and community leaders.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {items.map((course: any) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              thumbnail_url={course.thumbnail_url}
              is_free={course.is_free}
              is_exclusive={course.is_exclusive}
              is_enrolled={course.is_enrolled}
              href={`/courses/${course.slug || course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
