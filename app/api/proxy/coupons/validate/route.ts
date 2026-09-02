import { proxyApi } from "@/lib/proxyApi";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return proxyApi("/coupons/validate", {
    method: "POST",
    body,
    cache: "no-store",
  });
}
