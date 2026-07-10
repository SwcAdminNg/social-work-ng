import OrdersContainer from "@/components/dashboard/orders/OrdersContainer";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <OrdersContainer searchParams={searchParams} />;
}
