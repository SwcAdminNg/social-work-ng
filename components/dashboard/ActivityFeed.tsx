"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  History,
  ListChecks,
  type LucideIcon,
  PenLine,
  ReceiptText,
  RotateCcw,
  Sparkles,
  Star,
  StarOff,
  Trophy,
} from "lucide-react";

export type ActivityItem = {
  id: string;
  user_id: string;
  activity_type: string;
  metadata_json?: Record<string, unknown> | null;
  created_at: string;
};

type ActivityResponse = {
  data?: ActivityItem[];
  items?: ActivityItem[];
  message?: string;
  meta?: {
    page?: number;
    page_size?: number;
    total_pages?: number;
    has_next?: boolean;
  };
  total_pages?: number;
};

type ActivityFeedProps = {
  initialActivities?: ActivityItem[];
  initialMeta?: ActivityResponse["meta"];
};

type Tone = "green" | "gold" | "clay" | "deep" | "quiet";

type Details = {
  icon: LucideIcon;
  tone: Tone;
  /** What happened, as a short verb phrase. */
  action: string;
  /** The thing it happened to, shown in bold. */
  subject: string;
  /** The course, when the subject is something inside it. */
  context?: string;
  chip?: { label: string; tone: Tone };
  href?: string;
};

const PAGE_SIZE = 5;
const ZONE = "Africa/Lagos";

const TONES: Record<Tone, string> = {
  green: "bg-[color-mix(in_srgb,var(--sw-green)_12%,transparent)] text-accent",
  gold: "bg-[color-mix(in_srgb,var(--sw-gold)_20%,transparent)] text-gold-ink",
  clay: "bg-clay-wash text-clay-ink",
  deep: "bg-deep text-white dark:bg-brand",
  quiet: "bg-ink/[0.06] text-ink-3 dark:bg-white/[0.07]",
};
const CHIP_TONES: Record<Tone, string> = {
  green: "bg-[color-mix(in_srgb,var(--sw-green)_12%,transparent)] text-accent",
  gold: "bg-[color-mix(in_srgb,var(--sw-gold)_20%,transparent)] text-gold-ink",
  clay: "bg-clay-wash text-clay-ink",
  deep: "bg-deep text-white",
  quiet: "bg-ink/[0.06] text-ink-2",
};

const text = (meta: Record<string, unknown>, key: string) => {
  const value = meta[key];
  return typeof value === "string" && value !== "Unknown" ? value : "";
};
const num = (meta: Record<string, unknown>, key: string): number | null => {
  const value = meta[key];
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;
const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function describe(item: ActivityItem): Details {
  const meta = item.metadata_json || {};
  const course = text(meta, "course_title");
  const courseId = text(meta, "course_id");
  const itemId = text(meta, "item_id");
  const itemTitle = text(meta, "item_title");
  const courseHref = courseId ? `/learn/${courseId}` : undefined;
  const itemHref = courseId && itemId ? `/learn/${courseId}/item/${itemId}` : courseHref;
  const score = num(meta, "score");
  const passed = meta.passed === true;
  const failed = meta.passed === false;
  const rating = num(meta, "rating");

  switch (item.activity_type) {
    case "COURSE_ENROLLED":
      return { icon: BookOpenCheck, tone: "green", action: "Enrolled in", subject: course || "a new course", href: courseHref };
    case "QUIZ_COMPLETED":
    case "QUIZ_GROUP_COMPLETED":
      return {
        icon: passed ? Trophy : failed ? RotateCcw : ListChecks,
        tone: passed ? "green" : failed ? "clay" : "quiet",
        action: passed ? "Passed" : failed ? "Attempted" : "Completed",
        subject:
          text(meta, "quiz_group_title") || itemTitle || (item.activity_type === "QUIZ_GROUP_COMPLETED" ? "a quiz group" : "a quiz"),
        context: course,
        chip:
          score !== null
            ? { label: passed || failed ? `${pct(score)} · ${passed ? "Passed" : "Retry"}` : pct(score), tone: passed ? "green" : failed ? "clay" : "quiet" }
            : undefined,
        href: itemHref,
      };
    case "ESSAY_SUBMITTED":
      return {
        icon: PenLine,
        tone: "gold",
        action: "Submitted",
        subject: itemTitle || "an essay",
        context: course,
        chip: { label: "Awaiting marking", tone: "quiet" },
        href: itemHref,
      };
    case "ESSAY_GRADED":
      return {
        icon: FileCheck2,
        tone: "green",
        action: "Result released for",
        subject: itemTitle || "an essay",
        context: course,
        chip: score !== null ? { label: pct(score), tone: "green" } : undefined,
        href: "/dashboard/assessments",
      };
    case "REVIEW_CREATED":
    case "REVIEW_EDITED":
      return {
        icon: Star,
        tone: "gold",
        action: item.activity_type === "REVIEW_CREATED" ? "Reviewed" : "Updated your review of",
        subject: course || "a course",
        chip: rating !== null ? { label: `★ ${rating} of 5`, tone: "gold" } : undefined,
        href: courseHref,
      };
    case "REVIEW_DELETED":
      return { icon: StarOff, tone: "quiet", action: "Removed your review of", subject: course || "a course" };
    case "PAYMENT_SUCCESSFUL": {
      const amount = num(meta, "amount");
      return {
        icon: ReceiptText,
        tone: "deep",
        action: "Paid for",
        subject: course || text(meta, "plan_name") || "a purchase",
        chip: amount && amount > 0 ? { label: naira(amount), tone: "quiet" } : undefined,
        href: "/dashboard/orders",
      };
    }
    default:
      return { icon: Sparkles, tone: "quiet", action: "Account activity", subject: "" };
  }
}

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, weekday: "long", day: "numeric", month: "short" });
const clock = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, hour: "numeric", minute: "2-digit", hour12: true });
const fullDate = new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, dateStyle: "full", timeStyle: "short" });

function dayHeading(date: Date, now: number) {
  const key = dayKey.format(date);
  if (key === dayKey.format(now)) return "Today";
  if (key === dayKey.format(now - 86_400_000)) return "Yesterday";
  return dayLabel.format(date);
}

function shortTime(date: Date, now: number) {
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 6) return `${hours} hr ago`;
  return clock.format(date).replace(" ", " ");
}

async function fetchActivities(page: number): Promise<ActivityResponse> {
  const res = await fetch(`/api/proxy/users/me/dashboard/activity?page=${page}&page_size=${PAGE_SIZE}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to fetch activities");
  return data;
}

export function ActivityFeed({ initialActivities = [], initialMeta }: ActivityFeedProps) {
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const { data, isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ["dashboard-activities", page],
    queryFn: () => fetchActivities(page),
    placeholderData: keepPreviousData,
    initialData:
      page === 1 && initialActivities.length > 0 ? { data: initialActivities, meta: initialMeta } : undefined,
    // The overview's items show at once, but it does not know how many pages
    // there are: treat them as stale so page 1 is fetched with its real paging.
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60 * 1000,
  });

  const activities: ActivityItem[] = data?.data || data?.items || [];
  const totalPages = Math.max(1, data?.meta?.total_pages || data?.total_pages || 1);
  const busy = isFetching && !isPending;

  // Consecutive items on the same day share one heading.
  const days: { label: string; items: ActivityItem[] }[] = [];
  for (const item of activities) {
    const label = dayHeading(new Date(item.created_at), now);
    const last = days[days.length - 1];
    if (last && last.label === label) last.items.push(item);
    else days.push({ label, items: [item] });
  }

  return (
    <section aria-labelledby="activity-title" className="lms-card relative overflow-hidden">
      <header className="flex items-end justify-between gap-4 px-5 pb-2 pt-5 sm:px-7 sm:pt-7">
        <div className="min-w-0">
          <p className="lms-kicker m-0">Timeline</p>
          <h2 id="activity-title" className="sw-title m-0 mt-2.5 text-[1.45rem] text-ink sm:text-[1.6rem]">
            Recent activity
          </h2>
        </div>

        {totalPages > 1 && (
          <nav aria-label="Activity pages" className="flex flex-none items-center gap-1 rounded-full bg-ink/[0.05] p-1 dark:bg-white/[0.06]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isPending}
              aria-label="Newer activity"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:bg-card hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              role="status"
              aria-live="polite"
              className="min-w-[3.25rem] text-center text-xs font-semibold tabular-nums text-ink-2"
            >
              <span className="sr-only">Page </span>
              {page}
              <span className="text-ink-3"> / {totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPending}
              aria-label="Older activity"
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:bg-card hover:text-ink disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </header>

      {isPending && activities.length === 0 ? (
        <Skeleton />
      ) : isError && activities.length === 0 ? (
        <Empty
          icon={RotateCcw}
          title="We couldn’t load your activity"
          body="Check your connection and try again."
          action={
            <button type="button" onClick={() => refetch()} className="lms-btn lms-btn--quiet mt-4">
              Try again
            </button>
          }
        />
      ) : activities.length === 0 ? (
        <Empty
          icon={History}
          title="Nothing here yet"
          body="Enrolments, quiz results, essays and payments will show up here as you learn."
          action={
            <Link href="/dashboard/course-catalogue" className="lms-btn mt-4">
              Browse courses
            </Link>
          }
        />
      ) : (
        <div
          aria-busy={busy || undefined}
          className={`px-3 pb-4 transition-opacity duration-300 sm:px-4 sm:pb-5 ${busy ? "opacity-50" : ""}`}
        >
          {days.map((day) => (
            <div key={day.label} className="mt-3 first:mt-2">
              <h3 className="m-0 px-2 pb-1.5 text-[0.72rem] font-semibold tracking-[0.01em] text-ink-3 sm:px-3">
                {day.label}
              </h3>
              <ol className="relative m-0 list-none p-0">
                {day.items.map((item, i) => (
                  <Row key={item.id} item={item} now={now} last={i === day.items.length - 1} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Row({ item, now, last }: { item: ActivityItem; now: number; last: boolean }) {
  const d = describe(item);
  const Icon = d.icon;
  const date = new Date(item.created_at);

  const body = (
    <>
      <span className="relative flex flex-none flex-col items-center self-stretch">
        <span className={`relative z-[1] grid h-10 w-10 place-items-center rounded-[13px] ${TONES[d.tone]}`}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} aria-hidden="true" />
        </span>
        {/* A thread joins the items of one day. */}
        {!last && <span aria-hidden="true" className="-mb-2 mt-1 w-px flex-1 bg-line" />}
      </span>

      <span className="min-w-0 flex-1 pb-1 pt-0.5">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-[0.9rem] leading-snug text-ink-2">
            {d.action}
            {d.subject && (
              <>
                {" "}
                <span className="font-semibold text-ink">{d.subject}</span>
              </>
            )}
          </span>
          <time
            dateTime={item.created_at}
            title={fullDate.format(date)}
            suppressHydrationWarning
            className="mt-0.5 flex-none whitespace-nowrap text-[0.75rem] tabular-nums text-ink-3"
          >
            {shortTime(date, now)}
          </time>
        </span>
        {(d.context || d.chip) && (
          <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            {d.chip && (
              <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[0.72rem] font-semibold tabular-nums ${CHIP_TONES[d.chip.tone]}`}>
                {d.chip.label}
              </span>
            )}
            {d.context && <span className="min-w-0 truncate text-[0.78rem] text-ink-3">{d.context}</span>}
          </span>
        )}
      </span>

      {d.href && (
        <ChevronRight
          aria-hidden="true"
          className="mt-3 h-4 w-4 flex-none text-ink-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 max-sm:hidden"
        />
      )}
    </>
  );

  const rowClass = "group flex gap-3.5 rounded-[16px] px-2 py-2.5 sm:px-3";

  return (
    <li>
      {d.href ? (
        <Link
          href={d.href}
          className={`${rowClass} text-inherit no-underline transition-colors duration-200 hover:bg-ink/[0.04] dark:hover:bg-white/[0.04]`}
        >
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 pb-9 pt-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-mint text-accent">
        <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <p className="m-0 mt-4 font-semibold text-ink">{title}</p>
      <p className="m-0 mt-1 max-w-[34ch] text-sm leading-relaxed text-ink-3">{body}</p>
      {action}
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="px-5 pb-6 pt-3 sm:px-7">
      <span className="lms-skel block h-3 w-16" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mt-4 flex gap-3.5">
          <span className="lms-skel h-10 w-10 flex-none rounded-[13px]" />
          <span className="flex-1 pt-1">
            <span className="lms-skel block h-3.5" style={{ width: `${82 - i * 11}%` }} />
            <span className="lms-skel mt-2.5 block h-3 w-24" />
          </span>
        </div>
      ))}
    </div>
  );
}
