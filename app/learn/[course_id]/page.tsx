import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";

type CurriculumItem = {
  id: string;
  is_completed?: boolean | null;
};

type CurriculumSection = {
  is_locked?: boolean | null;
  items?: CurriculumItem[] | null;
};

/**
 * The lesson to open when a learner enters a course: the first item they have
 * not finished, in the first module that is open to them. Items unlock in
 * order, so that item is always reachable. A finished course opens at its
 * first lesson for review.
 */
function findResumeItem(sections: CurriculumSection[]) {
  const all = sections.flatMap((section) => section.items ?? []);
  if (all.length === 0) return null;

  for (const section of sections) {
    if (section.is_locked) continue;
    const next = (section.items ?? []).find((item) => !item.is_completed);
    if (next) return next;
  }

  return all[0];
}

function EmptyCourse({ message }: { message: string }) {
  return (
    <div className="grid h-full place-items-center p-10 text-center">
      <p className="m-0 max-w-sm text-ink-2">{message}</p>
    </div>
  );
}

export default async function LearnCourseRootPage(props: { params: Promise<{ course_id: string }> }) {
  const params = await props.params;

  const res = await fetchApi(`/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } });

  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}`);
  }
  if (!res.ok) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const sections: CurriculumSection[] = data?.data?.sections ?? [];

  if (sections.length === 0) {
    return <EmptyCourse message="This course has no content yet." />;
  }

  const resumeItem = findResumeItem(sections);
  if (!resumeItem) {
    return <EmptyCourse message="This course has no lessons to view yet." />;
  }

  redirect(`/learn/${params.course_id}/item/${resumeItem.id}`);
}
