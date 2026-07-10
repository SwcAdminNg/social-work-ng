import { fetchApi } from "@/lib/fetchApi";
import { CourseCard } from "@/components/learning/CourseCard";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IconBookOpen } from "@/components/dashboard/icons";

export const metadata = {
  title: "My Courses | Dashboard",
};

export default async function EnrolledCoursesPage() {
  const res = await fetchApi(`/learning/courses`, { next: { revalidate: 0 } });

  if (res.status === 401) {
    redirect("/logout?callbackUrl=/dashboard/courses");
  }

  const data = await res.json().catch(() => ({}));
  const courses = Array.isArray(data?.data)
    ? data.data
    : data?.data?.items || [];

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-0 py-8 lg:py-1">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Enrolled Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pick up where you left off and track your progress.
          </p>
        </div>
        {courses.length > 0 && (
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl transition-transform hover:-translate-y-0.5"
          >
            Explore More Courses
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mb-4">
            <IconBookOpen />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            No active enrollments
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            You aren't enrolled in any courses yet. Browse our catalog to start
            learning.
          </p>
          <Link
            href="/courses"
            className="inline-flex px-6 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] text-white font-bold rounded-xl transition-colors shadow-lg shadow-[#2D6A4F]/20"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              thumbnail_url={course.thumbnail_url}
              progress_percent={course.progress_percent}
              is_completed={course.is_completed}
              price={course.price}
              average_rating={course.average_rating}
              total_reviews={course.total_reviews}
              is_enrolled={course.is_enrolled ?? true}
              has_access={course.has_access}
              href={`/learn/${course.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
