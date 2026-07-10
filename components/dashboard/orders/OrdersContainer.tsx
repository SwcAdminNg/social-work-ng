import { fetchApi } from "@/lib/fetchApi";
import OrdersList from "./OrdersList";

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
  } catch (err: any) {
    error = err.message || "An error occurred while fetching your orders.";
  }

  return (
    <div className="w-full h-full max-w-8xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View your course purchases and subscription payments.
        </p>
      </div>

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
