import { proxyApi } from "@/lib/proxyApi";

export async function GET() {
  return proxyApi("/cart", { method: "GET", cache: "no-store" });
}

export async function DELETE() {
  return proxyApi("/cart", { method: "DELETE", cache: "no-store" });
}
