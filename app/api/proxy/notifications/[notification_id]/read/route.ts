import { proxyApi } from "@/lib/proxyApi";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ notification_id: string }> },
) {
  const params = await props.params;

  return proxyApi(`/notifications/${params.notification_id}/read`, {
    method: "PATCH",
  });
}
