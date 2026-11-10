import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { CoursePlayerShell } from "@/components/learning/CourseSidebar";
import { siteFonts } from "@/lib/fonts";
import "../../lms.css";
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
    return (
      <div className={`lms-root sw ${siteFonts} grid place-items-center p-10 text-center`}>
        <p className="m-0 text-ink-2">We could not load this course. Please try again.</p>
      </div>
    );
  }

  return (
    <div className={`lms-root sw ${siteFonts}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-[#10231a]"
      >
        Skip to lesson
      </a>
      <CoursePlayerShell
        courseId={params.course_id}
        curriculum={curriculum}
        resources={resourcesResult.ok ? resourcesResult.items : []}
      >
        {props.children}
      </CoursePlayerShell>
    </div>
  );
}
