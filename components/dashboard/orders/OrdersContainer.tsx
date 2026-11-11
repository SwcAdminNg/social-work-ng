import { fetchApi } from "@/lib/fetchApi";
import OrdersList from "./OrdersList";
import PaymentMethodsPanel from "./PaymentMethodsPanel";

export default async function OrdersContainer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const limit = 20;

  let transactions = [];
  let totalItems = 0;
  let error = null;

  try {
    const res = await fetchApi(
      `/payments/transactions/me?page=${page}&page_size=${limit}`,
      {
        next: { revalidate: 0 },
      },
    );

    if (!res.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const json = await res.json().catch(() => ({}));
    if (json && json.data) {
      transactions = json.data;
      totalItems = json.meta?.total_items || 0;
    }
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "An error occurred while fetching your orders.";
  }

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 pb-12">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Payment &amp; Billing</h1>
        <p className="m-0 mt-2 text-[0.98rem] text-ink-2">Your saved cards, purchases and receipts.</p>
      </header>

      <PaymentMethodsPanel />

      <OrdersList
        initialData={transactions}
        totalItems={totalItems}
        currentPage={page}
        limit={limit}
        error={error}
      />
    </div>
  );
}
