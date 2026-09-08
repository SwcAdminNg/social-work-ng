import { fetchApi } from "@/lib/fetchApi";
import { LiveSessionJoinClient } from "@/components/learning/LiveSessionJoinClient";
import { notFound, redirect } from "next/navigation";

export default async function LearningLiveSessionPage(props: {
  params: Promise<{ course_id: string; item_id: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(`/learning/courses/${params.course_id}/items/${params.item_id}`, {
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}/item/${params.item_id}/live-session`);
  }

  if (res.status === 404) {
    notFound();
  }

  const json = await res.json().catch(() => ({}));
  const item = json?.data;

  if (!res.ok || item?.item_type !== "LIVE_SESSION") {
    notFound();
  }

  return (
    <LiveSessionJoinClient
      courseSlug={params.course_id}
      itemId={params.item_id}
      backHref={`/learn/${params.course_id}/item/${params.item_id}`}
    />
  );
}
