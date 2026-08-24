import TicketContainer from "@/components/dashboard/support/TicketContainer";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const { ticket_id } = await params;
  return <TicketContainer ticketId={ticket_id} />;
}
