import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { CourseSidebar } from "@/components/learning/CourseSidebar";
import { getCourseResources } from "@/lib/resources";

export default async function LearningLayout(props: { params: Promise<{ course_id: string }>, children: React.ReactNode }) {
  const params = await props.params;
  const [res, resourcesResult] = await Promise.all([
    fetchApi(`/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } }),
    getCourseResources(params.course_id, { pageSize: 8 }),
  ]);
  
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
    <div className="flex h-[100dvh] overflow-hidden bg-[#f5f5f7] text-slate-900 dark:bg-[#0a0c11] dark:text-slate-100">
      <CourseSidebar
        courseId={params.course_id}
        curriculum={curriculum}
        resources={resourcesResult.ok ? resourcesResult.items : []}
      />

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7] dark:bg-[#0a0c11]">
        {props.children}
      </main>
    </div>
  );
}
