import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";

export default async function LearnCourseRootPage(props: { params: Promise<{ course_id: string }> }) {
  const params = await props.params;
  
  // Fetch curriculum to find the first item
  const res = await fetchApi(`/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } });
  
  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}`);
  }
  if (!res.ok) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const curriculum = data?.data;

  if (!curriculum || !curriculum.sections || curriculum.sections.length === 0) {
    return <div className="p-20 text-center text-gray-500">This course has no content yet.</div>;
  }

  // Find the first item in the first section
  const firstSection = curriculum.sections.find((s: any) => s.items && s.items.length > 0);
  if (!firstSection) {
    return <div className="p-20 text-center text-gray-500">This course has no items to view.</div>;
  }

  const firstItem = firstSection.items[0];
  redirect(`/learn/${params.course_id}/item/${firstItem.id}`);
}
