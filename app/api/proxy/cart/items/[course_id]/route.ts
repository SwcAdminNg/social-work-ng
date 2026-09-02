import { proxyApi } from "@/lib/proxyApi";

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ course_id: string }> },
) {
  const params = await props.params;
  return proxyApi(`/cart/items/${params.course_id}`, {
    method: "DELETE",
    cache: "no-store",
  });
}
