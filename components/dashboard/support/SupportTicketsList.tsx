"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  LifeBuoy,
  MessageCircleQuestion,
  Plus,
} from "lucide-react";
import { ticketStatusInfo } from "./statusBadge";
import { NewTicketModal } from "./NewTicketModal";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at?: string;
};

type Filter = "open" | "resolved" | "all";

const TOPICS: { label: string; subject: string; icon: LucideIcon; tone: string }[] = [
  { label: "Course access", subject: "I can't access my course", icon: BookOpen, tone: "blue" },
  { label: "Payments & billing", subject: "Question about a payment", icon: CreditCard, tone: "green" },
  { label: "Certificates", subject: "Question about my certificate", icon: Award, tone: "gold" },
  { label: "Something else", subject: "", icon: MessageCircleQuestion, tone: "indigo" },
];

const STATUS_ICON: Record<string, LucideIcon> = {
  OPEN: LifeBuoy,
  IN_PROGRESS: Clock3,
  RESOLVED: CheckCircle2,
  CLOSED: Archive,
};

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(date);
}

function ago(value: string | undefined, now: number) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "yesterday" : `${days} days ago`;
  return `on ${formatDate(value)}`;
}

export default function SupportTicketsList({
  initialData,
  totalItems,
  currentPage,
  limit,
  error,
  openNewTicketOnLoad,
  initialSubject,
  initialMessage,
}: {
  initialData: Ticket[];
  totalItems: number;
  currentPage: number;
  limit: number;
  error: string | null;
  openNewTicketOnLoad?: boolean;
  initialSubject?: string;
  initialMessage?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(Boolean(openNewTicketOnLoad));
  const [draftSubject, setDraftSubject] = useState(initialSubject || "");
  const [filter, setFilter] = useState<Filter>("all");
  const [now] = useState(() => Date.now());

  const tickets = useMemo(() => initialData ?? [], [initialData]);
  const openCount = tickets.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status?.toUpperCase())).length;
  const visible = tickets.filter((ticket) => {
    const s = ticket.status?.toUpperCase();
    if (filter === "open") return s === "OPEN" || s === "IN_PROGRESS";
    if (filter === "resolved") return s === "RESOLVED" || s === "CLOSED";
    return true;
  });

  const total = totalItems || tickets.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const startRequest = (subject: string) => {
    setDraftSubject(subject);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col pb-10">
      <header className="lms-rise flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Support</h1>
          <p className="m-0 mt-2 text-[0.98rem] text-ink-2">
            {tickets.length === 0
              ? "Ask a question or report a problem and our Support Desk will reply here."
              : openCount > 0
                ? `${openCount} open request${openCount === 1 ? "" : "s"}. We’ll reply right here.`
                : "No open requests. Everything you’ve asked about has been handled."}
          </p>
        </div>
        <button type="button" onClick={() => startRequest("")} className="lms-btn flex-none self-start sm:self-auto">
          <Plus className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
          New Request
        </button>
      </header>

      {/* Quick topics, after the Support app: pick what it's about and start with the subject filled in */}
      <section aria-labelledby="topics-title" className="lms-rise mt-7" style={{ "--i": 1 } as React.CSSProperties}>
        <h2 id="topics-title" className="m-0 mb-2.5 px-1 text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
          Get help with
        </h2>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
          {TOPICS.map((topic) => (
            <li key={topic.label}>
              <button type="button" onClick={() => startRequest(topic.subject)} className="lms-milk lms-milk-hover flex h-full w-full cursor-pointer flex-col items-start gap-3 p-4 text-left">
                <span className={`lms-sym lms-sym--${topic.tone}`}>
                  <topic.icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
                </span>
                <span className="text-[0.9rem] font-semibold text-ink">{topic.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Requests */}
      <section aria-labelledby="requests-title" className="mt-9">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 id="requests-title" className="m-0 text-[1.25rem] font-bold tracking-[-0.02em] text-ink">
            Your requests
          </h2>
          {tickets.length > 0 && (
            <div role="tablist" aria-label="Show" className="lms-segmented">
              {(
                [
                  ["all", "All"],
                  ["open", "Open"],
                  ["resolved", "Resolved"],
                ] as const
              ).map(([key, label]) => (
                <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className="lms-segment !px-3.5">
                  {label}
                  {key === "open" && openCount > 0 && <span className="lms-segment-count">{openCount}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {error ? (
          <p role="alert" className="m-0 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <div className="lms-milk flex flex-col items-center px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
              <LifeBuoy className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h3 className="m-0 mt-4 text-[1.05rem] font-semibold text-ink">
              {tickets.length === 0 ? "No requests yet" : filter === "open" ? "Nothing open" : "Nothing resolved yet"}
            </h3>
            <p className="m-0 mt-1.5 max-w-sm text-[0.9rem] leading-relaxed text-ink-2">
              {tickets.length === 0
                ? "When you open a request, you can follow the conversation with our team here."
                : filter === "open"
                  ? "Every request you’ve made has been answered."
                  : "Requests move here once they are resolved or closed."}
            </p>
            {tickets.length === 0 && (
              <button type="button" onClick={() => startRequest("")} className="lms-btn mt-5">
                <Plus className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                New Request
              </button>
            )}
          </div>
        ) : (
          <ul className="lms-group m-0 list-none p-0">
            {visible.map((ticket) => {
              const info = ticketStatusInfo(ticket.status);
              const Icon = STATUS_ICON[ticket.status?.toUpperCase()] ?? LifeBuoy;
              const updated = ticket.updated_at && ticket.updated_at !== ticket.created_at ? ticket.updated_at : undefined;
              return (
                <li key={ticket.id}>
                  <div className="lms-row group">
                    <span className={`lms-sym lms-sym--lg lms-sym--${info.tone}`}>
                      <Icon className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="m-0 truncate text-[0.98rem] font-semibold tracking-[-0.01em] text-ink">
                        <Link href={`/dashboard/support-tickets/${ticket.id}`} className="lms-stretch text-inherit no-underline">
                          {ticket.subject}
                        </Link>
                      </h3>
                      <p className="m-0 mt-0.5 truncate text-[0.82rem] text-ink-3">
                        <span className="font-mono text-[0.76rem] tracking-[0.04em]">#{ticket.id.slice(0, 6).toUpperCase()}</span>
                        {" · "}Opened {formatDate(ticket.created_at)}
                        {updated ? ` · Updated ${ago(updated, now)}` : ""}
                      </p>
                    </div>
                    <span className={`lms-status lms-status--${info.tone} hidden flex-none text-[0.82rem] sm:inline-flex`}>{info.label}</span>
                    <span className={`lms-status lms-status--${info.tone} flex-none text-[0.75rem] sm:hidden`} aria-hidden="true" />
                    <ChevronRight className="h-4 w-4 flex-none text-ink-3" aria-hidden="true" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="m-0 text-sm text-ink-3">
              {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
            </p>
            <nav className="lms-pager" aria-label="Request pages">
              <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="lms-page">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="lms-page" aria-current="page">
                {currentPage}
              </span>
              <span className="px-1 text-sm text-ink-3">of {totalPages}</span>
              <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="lms-page">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        )}
      </section>

      <NewTicketModal
        key={`${draftSubject}:${initialMessage || ""}:${modalOpen}`}
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        initialSubject={draftSubject}
        initialMessage={initialMessage}
      />
    </div>
  );
}
