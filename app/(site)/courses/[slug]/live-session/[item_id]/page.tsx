import { auth } from "@/auth";
import { fetchApi } from "@/lib/fetchApi";
import { LiveSessionJoinClient } from "@/components/learning/LiveSessionJoinClient";
import { redirect } from "next/navigation";

type CourseItem = {
  id?: string | null;
  live_session?: {
    scheduled_start_at?: string | null;
  } | null;
};

type CourseSection = {
  items?: CourseItem[] | null;
};

export default async function CourseLiveSessionPage(props: {
  params: Promise<{ slug: string; item_id: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/courses/${params.slug}/live-session/${params.item_id}`)}`,
    );
  }

  const courseRes = await fetchApi(`/courses/${params.slug}`, {
    cache: "no-store",
  });
  const courseJson = await courseRes.json().catch(() => ({}));
  const sections = (courseJson?.data?.sections || []) as CourseSection[];
  const scheduledStartAt = sections
    .flatMap((section) => section.items || [])
    .find((item) => item.id === params.item_id)
    ?.live_session?.scheduled_start_at;

  return (
    <LiveSessionJoinClient
      courseSlug={params.slug}
      itemId={params.item_id}
      scheduledStartAt={scheduledStartAt}
    />
  );
}
