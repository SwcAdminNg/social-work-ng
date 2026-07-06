import { fetchApi } from "@/lib/fetchApi";
import { EnrollButton } from "./EnrollButton";
import { IconBookOpen } from "@/components/dashboard/icons";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(`/courses/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const course = data?.data;

  if (!course) {
    return (
      <div className="p-20 text-center text-red-500">
        Failed to load course details.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column: Course Info & Curriculum */}
        <div className="flex-1 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {course.is_free ? (
                <span className="px-3 py-1 text-xs font-bold bg-[#F4A261] text-white rounded-lg shadow-sm">
                  FREE COURSE
                </span>
              ) : course.price !== undefined ? (
                <span className="px-3 py-1 text-sm font-bold bg-[#2D6A4F] text-white rounded-lg shadow-sm">
                  ₦{course.price.toLocaleString()}
                </span>
              ) : null}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {course.description ||
                "Unlock premium insights, structured learning, and actionable strategies tailored for you."}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Curriculum
            </h2>
            <div className="space-y-4">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section: any, idx: number) => (
                  <div
                    key={section.id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Section {idx + 1}: {section.title}
                      </h3>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {section.items?.map((item: any) => (
                        <li
                          key={item.id}
                          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <IconBookOpen />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {item.item_type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No curriculum available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar with Enroll Button */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <IconBookOpen />
                </div>
              )}
            </div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {course.is_free ? "Free" : course.price !== undefined ? `₦${course.price.toLocaleString()}` : "Premium"}
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              {course.is_enrolled
                ? "You are already enrolled. Jump back in and continue your progress."
                : "Join thousands of professionals already learning."}
            </p>

            <EnrollButton
              courseId={course.id}
              isEnrolled={course.is_enrolled}
              isFree={course.is_free}
              price={course.price}
              hasAccess={course.has_access}
            />

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Full
                lifetime access
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Access on
                mobile and TV
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />{" "}
                Certificate of completion
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
