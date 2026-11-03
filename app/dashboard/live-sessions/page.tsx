import Link from "next/link";
import Form from "next/form";
import { fetchApi } from "@/lib/fetchApi";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Radio,
  Search,
  UserRound,
  Video,
} from "lucide-react";

export const metadata = {
  title: "Live Sessions | Social Work Nigeria",
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type LiveSession = {
  item_id: string;
  title: string;
  course_id: string;
  course_title?: string | null;
  course_slug?: string | null;
  section_id?: string | null;
  section_title?: string | null;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  duration_minutes?: number | null;
  guest_name?: string | null;
  guest_title?: string | null;
  status?: string | null;
  can_join?: boolean | null;
  is_completed?: boolean | null;
  recording_status?: string | null;
};

type Meta = {
  page?: number;
  page_size?: number;
  total_items?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
};

type LiveSessionsResult = {
  items: LiveSession[];
  meta: Meta;
  error: string | null;
};

const PAGE_SIZE = 12;

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asPositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(singleParam(value) || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function todayIso() {
  return new Date().toISOString();
}

function formatDateTime(value?: string | null) {
  if (!value) return "Schedule pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Schedule pending";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return formatDateTime(start);

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return formatDateTime(start);
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startLabel = formatDateTime(start);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(endDate);

  return sameDay ? `${startLabel} - ${endLabel}` : `${startLabel} - ${formatDateTime(end)}`;
}

function buildApiQuery({
  view,
  page,
  courseId,
}: {
  view: string;
  page: number;
  courseId?: string;
}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(PAGE_SIZE),
  });
  const now = todayIso();

  if (view === "upcoming") {
    params.set("start_date", now);
  } else if (view === "past") {
    params.set("end_date", now);
  }

  if (courseId) {
    params.set("course_id", courseId);
  }

  return params.toString();
}

function buildPageUrl({
  view,
  page,
  courseId,
}: {
  view: string;
  page?: number;
  courseId?: string;
}) {
  const params = new URLSearchParams();
  if (view !== "upcoming") params.set("view", view);
  if (page && page > 1) params.set("page", String(page));
  if (courseId) params.set("course_id", courseId);

  const query = params.toString();
  return `/dashboard/live-sessions${query ? `?${query}` : ""}`;
}

function normalizeItems(data: unknown) {
  const payload = data as {
    data?: unknown;
    items?: unknown;
    results?: unknown;
    sessions?: unknown;
    live_sessions?: unknown;
    upcoming_live_sessions?: unknown;
  };
  const nested =
    payload.data && typeof payload.data === "object"
      ? (payload.data as {
          items?: unknown;
          sessions?: unknown;
          live_sessions?: unknown;
          upcoming_live_sessions?: unknown;
        })
      : null;
  const candidates = [
    payload.data,
    nested?.items,
    nested?.sessions,
    nested?.live_sessions,
    nested?.upcoming_live_sessions,
    payload.items,
    payload.sessions,
    payload.live_sessions,
    payload.upcoming_live_sessions,
    payload.results,
  ];
  const source = candidates.find(Array.isArray) ?? [];

  return source.filter((item): item is LiveSession => {
    const session = item as Partial<LiveSession>;
    return Boolean(session?.item_id && session?.title && session?.course_id);
  });
}

function normalizeMeta(data: unknown): Meta {
  const payload = data as {
    meta?: Meta;
    data?: { meta?: Meta };
    total_pages?: number;
    has_next?: boolean;
  };

  return payload.meta ?? payload.data?.meta ?? {
    total_pages: payload.total_pages,
    has_next: payload.has_next,
  };
}

async function getLiveSessions({
  view,
  page,
  courseId,
}: {
  view: string;
  page: number;
  courseId?: string;
}): Promise<LiveSessionsResult> {
  const query = buildApiQuery({ view, page, courseId });

  try {
    const res = await fetchApi(`/learning/live-sessions?${query}`, {
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        items: [],
        meta: {},
        error: json?.message || "Unable to load live sessions.",
      };
    }

    return {
      items: normalizeItems(json),
      meta: normalizeMeta(json),
      error: null,
    };
  } catch {
    return {
      items: [],
      meta: {},
      error: "Unable to reach the live sessions service.",
    };
  }
}

function sessionHref(session: LiveSession) {
  return `/courses/${session.course_slug || session.course_id}/live-session/${session.item_id}`;
}

export default async function LiveSessionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const viewParam = singleParam(resolvedParams.view);
  const view = viewParam === "past" || viewParam === "all" ? viewParam : "upcoming";
  const page = asPositiveInt(resolvedParams.page, 1);
  const courseId = singleParam(resolvedParams.course_id)?.trim() || undefined;
  const { items, meta, error } = await getLiveSessions({ view, page, courseId });
  const totalPages = Math.max(1, meta.total_pages || (meta.has_next ? page + 1 : page));
  const hasNext = Boolean(meta.has_next ?? page < totalPages);
  const hasPrevious = Boolean(meta.has_previous ?? page > 1);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 pb-12">
      <section className="rounded-xl border border-[#dbeee4] bg-white p-5 shadow-sm dark:border-[#26384d] dark:bg-[#111525] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e7f6ee] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
              <Radio className="h-3.5 w-3.5" />
              Live learning
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Live sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              Browse scheduled classes, join active sessions, and review past
              live learning events from your enrolled courses.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#0f1726]">
            <ViewTab href={buildPageUrl({ view: "upcoming", courseId })} active={view === "upcoming"}>
              Upcoming
            </ViewTab>
            <ViewTab href={buildPageUrl({ view: "past", courseId })} active={view === "past"}>
              Past
            </ViewTab>
            <ViewTab href={buildPageUrl({ view: "all", courseId })} active={view === "all"}>
              All
            </ViewTab>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e5e3ee] bg-white p-4 shadow-sm dark:border-[#262a3d] dark:bg-[#111525]">
        <Form
          action="/dashboard/live-sessions"
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
        >
          <input type="hidden" name="view" value={view} />
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="course_id"
              defaultValue={courseId}
              placeholder="Filter by course ID"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-slate-800 dark:bg-[#0f1726] dark:text-slate-100 dark:focus:border-[#52b788]"
            />
          </label>
          <button
            type="submit"
            className="h-11 rounded-lg bg-[#2D6A4F] px-4 text-sm font-extrabold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d]"
          >
            Apply
          </button>
          {courseId && (
            <Link
              href={buildPageUrl({ view })}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-extrabold text-slate-600 no-underline transition hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] dark:border-slate-800 dark:text-slate-300 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
            >
              Clear
            </Link>
          )}
        </Form>
      </section>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {error}
        </div>
      ) : items.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#111525] sm:p-14">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            <CalendarDays className="h-7 w-7" />
          </div>
          <p className="text-lg font-extrabold text-slate-800 dark:text-white">
            No live sessions found.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">
            {view === "upcoming"
              ? "Upcoming sessions from your enrolled courses will appear here as soon as they are scheduled."
              : "Try another view or remove the course filter."}
          </p>
        </section>
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((session) => (
            <LiveSessionCard key={session.item_id} session={session} />
          ))}
        </section>
      )}

      {(hasPrevious || hasNext) && (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Live session pages">
          <PageLink
            href={buildPageUrl({ view, page: page - 1, courseId })}
            disabled={!hasPrevious}
            label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </PageLink>

          <span className="inline-flex h-10 items-center rounded-md bg-slate-50 px-4 text-sm font-extrabold text-slate-600 dark:bg-[#0f1726] dark:text-slate-300">
            Page {page}
            {totalPages > 1 ? ` of ${totalPages}` : ""}
          </span>

          <PageLink
            href={buildPageUrl({ view, page: page + 1, courseId })}
            disabled={!hasNext}
            label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-extrabold no-underline transition ${
        active
          ? "bg-white text-[#2D6A4F] shadow-sm dark:bg-[#111525] dark:text-[#74c69d]"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function LiveSessionCard({ session }: { session: LiveSession }) {
  const canJoin = Boolean(session.can_join);
  const guest = [session.guest_name, session.guest_title].filter(Boolean).join(", ");

  return (
    <article className="flex min-h-72 flex-col justify-between rounded-xl border border-[#e5e3ee] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#95d5b2] hover:shadow-md dark:border-[#262a3d] dark:bg-[#111525]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            <Video className="h-5 w-5" />
          </span>
          <span
            className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
              canJoin
                ? "bg-[#2D6A4F] text-white dark:bg-[#74c69d] dark:text-slate-950"
                : session.is_completed
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-400/15 dark:text-blue-200"
            }`}
          >
            {canJoin ? "Join now" : session.is_completed ? "Completed" : session.status || "Scheduled"}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-2 text-base font-extrabold leading-6 text-slate-950 dark:text-white">
          {session.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300">
          {session.course_title || "Course session"}
        </p>

        <div className="mt-4 space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <p className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#2D6A4F] dark:text-[#74c69d]" />
            <span>{formatTimeRange(session.scheduled_start_at, session.scheduled_end_at)}</span>
          </p>
          {session.duration_minutes ? (
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0 text-[#2D6A4F] dark:text-[#74c69d]" />
              <span>{session.duration_minutes} minutes</span>
            </p>
          ) : null}
          {guest ? (
            <p className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 text-[#2D6A4F] dark:text-[#74c69d]" />
              <span className="truncate">{guest}</span>
            </p>
          ) : null}
        </div>
      </div>

      <Link
        href={sessionHref(session)}
        className={`mt-5 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-extrabold no-underline transition ${
          canJoin
            ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d]"
            : "border border-slate-200 text-slate-700 hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] dark:border-slate-800 dark:text-slate-300 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
        }`}
      >
        {canJoin ? "Join session" : "View details"}
      </Link>
    </article>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-300 dark:border-slate-800 dark:bg-[#111525] dark:text-slate-700"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 no-underline transition hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] dark:border-slate-800 dark:bg-[#111525] dark:text-slate-300 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
    >
      {children}
    </Link>
  );
}
