import { auth } from "@/auth";
import { LiveSessionJoinClient } from "@/components/learning/LiveSessionJoinClient";
import { redirect } from "next/navigation";

export default async function CourseLiveSessionPage(props: {
  params: Promise<{ slug: string; item_id: string }>;
}) {
  const params = await props.params;
  const session = await auth();

  if (!session) {
    redirect(
      `/login?callbackUrl=/courses/${params.slug}/live-session/${params.item_id}`,
    );
  }

  return (
    <LiveSessionJoinClient
      courseSlug={params.slug}
      itemId={params.item_id}
    />
  );
}
