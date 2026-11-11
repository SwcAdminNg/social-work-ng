import { fetchApi } from "@/lib/fetchApi";
import OrderDetail, { OrderMissing, type OrderDetailData } from "@/components/dashboard/orders/OrderDetail";

export const metadata = {
  title: "Order details | Social Work Consultancy Ltd",
  description: "Everything about one of your purchases: what you bought, what you paid and how.",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  let order: OrderDetailData | null = null;
  let problem: "missing" | "error" | null = null;
  try {
    const res = await fetchApi(`/payments/transactions/me/${encodeURIComponent(reference)}`, { cache: "no-store" });
    if (res.status === 404) problem = "missing";
    else if (!res.ok) problem = "error";
    else order = (await res.json().catch(() => null))?.data ?? null;
    if (!order && !problem) problem = "error";
  } catch {
    problem = "error";
  }

  if (!order) return <OrderMissing reason={problem ?? "error"} />;
  return <OrderDetail order={order} />;
}
