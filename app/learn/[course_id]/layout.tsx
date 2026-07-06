import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CourseSidebar } from "@/components/learning/CourseSidebar";

export default async function LearningLayout(props: { params: Promise<{ course_id: string }>, children: React.ReactNode }) {
  const params = await props.params;
  const res = await fetchApi(`/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } });
  
  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}`);
  }
  if (res.status === 404) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const curriculum = data?.data;

  if (!curriculum) {
    return <div className="p-20 text-center text-red-500">Failed to load curriculum.</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* Main Content Area - Render first so video is at top on mobile */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-100 dark:bg-gray-950 order-1 md:order-2">
        {props.children}
      </main>

      {/* Sidebar Curriculum - Bottom on mobile, Left on desktop */}
      <div className="order-2 md:order-1 h-[45vh] md:h-auto w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden flex flex-col">
        <CourseSidebar courseId={params.course_id} curriculum={curriculum} />
      </div>

    </div>
  );
}
