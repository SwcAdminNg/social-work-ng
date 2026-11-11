export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

/** Label and colour for a ticket status, shared by the list and the conversation. */
export function ticketStatusInfo(status: string): { label: string; tone: "blue" | "orange" | "green" | "gray" } {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return { label: "Open", tone: "blue" };
    case "IN_PROGRESS":
      return { label: "In progress", tone: "orange" };
    case "RESOLVED":
      return { label: "Resolved", tone: "green" };
    case "CLOSED":
      return { label: "Closed", tone: "gray" };
    default:
      return { label: status ? status.charAt(0) + status.slice(1).toLowerCase().replaceAll("_", " ") : "Unknown", tone: "gray" };
  }
}

/** A coloured dot and label, as status reads in Apple's lists. */
export function getTicketStatusBadge(status: string) {
  const { label, tone } = ticketStatusInfo(status);
  return <span className={`lms-status lms-status--${tone} text-[0.82rem]`}>{label}</span>;
}

export function isTicketTerminal(status: string) {
  const s = status?.toUpperCase();
  return s === "RESOLVED" || s === "CLOSED";
}
