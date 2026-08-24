import SupportTicketsContainer from "@/components/dashboard/support/SupportTicketsContainer";

export default function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <SupportTicketsContainer searchParams={searchParams} />;
}
