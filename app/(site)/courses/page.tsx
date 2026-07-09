import { fetchApi } from "@/lib/fetchApi";
import { SiteCourseCard } from "@/components/courses/SiteCourseCard";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";

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

  let url = `/courses?page=${page}&limit=12`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetchApi(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  const items = Array.isArray(data?.data) ? data.data : data?.data?.items || [];

  const hasNextPage = items.length === 12;

  // Fetch enrolled courses if the user is logged in
  const session = await auth();
  const enrolledCourseIds = new Set<string>();
  
  if (session && (session as any).accessToken) {
    const enrolledRes = await fetchApi(`/learning/courses`, { next: { revalidate: 0 } });
    if (enrolledRes.ok) {
      const enrolledData = await enrolledRes.json().catch(() => ({}));
      const enrolledCourses = Array.isArray(enrolledData?.data) ? enrolledData.data : enrolledData?.data?.items || [];
      enrolledCourses.forEach((c: any) => {
        if (c.id) enrolledCourseIds.add(c.id);
        if (c.course?.id) enrolledCourseIds.add(c.course.id);
      });
    }
  }

  return (
    <div className="w-full bg-white dark:bg-gray-950">
      <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 z-10 bg-black/50 dark:bg-black/60" />
        <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-12 lg:mt-0">
          <nav className="flex items-center text-sm text-gray-200 mb-4 tracking-wide font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-white">Our Courses</span>
          </nav>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Courses
          </h1>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 md:py-24">
        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No courses found for this page.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10">
              {items.map((course: any) => (
                <SiteCourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  thumbnail_url={course.thumbnail_url}
                  is_free={course.is_free}
                  price={course.price}
                  href={`/courses/${course.slug || course.id}`}
                  level={course.level || "Beginner"}
                  category={course.category || "Professional Development"}
                  is_enrolled={enrolledCourseIds.has(course.id)}
                />
              ))}
            </div>
            <div className="mt-16 flex items-center justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={`/courses?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50 rounded-full font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
              )}

              <span className="font-semibold text-gray-600 dark:text-gray-400 px-4">
                Page {page}
              </span>

              {hasNextPage ? (
                <Link
                  href={`/courses?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/50 rounded-full font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
