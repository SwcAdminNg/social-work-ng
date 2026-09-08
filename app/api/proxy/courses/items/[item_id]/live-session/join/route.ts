import { proxyApi } from "@/lib/proxyApi";

export async function POST(
  _req: Request,
  props: { params: Promise<{ item_id: string }> },
) {
  const params = await props.params;

  return proxyApi(`/courses/items/${params.item_id}/live-session/join`, {
    method: "POST",
    cache: "no-store",
  });
}
