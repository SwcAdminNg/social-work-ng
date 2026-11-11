import Link from "next/link";
import { fetchApi } from "@/lib/fetchApi";
import {
  type LiveSession,
  LiveNowCard,
  SessionRow,
  TZ,
  dayHeading,
  groupByDay,
  relative,
  sessionState,
} from "./LiveSessionParts";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export const metadata = {
  title: "Live Sessions | Social Work Nigeria",
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
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
    params.set("start_date", new Date(Date.now() - 3 * 60 * 60_000).toISOString());
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
  // eslint-disable-next-line react-hooks/purity -- a server render reads the clock once
  const now = Date.now();

  const live = items.filter((session) => sessionState(session, now) === "live");
  // Upcoming fetches from a little before now so a class already in progress is included; anything finished stays in Past.
  const listed =
    view === "upcoming"
      ? items.filter((session) => !["live", "ended", "recording"].includes(sessionState(session, now)))
      : items;
  const groups = groupByDay(listed);
  const courseTitle = courseId ? items.find((session) => session.course_id === courseId)?.course_title : undefined;
  const nextUp = items.find((session) => sessionState(session, now) === "soon" || sessionState(session, now) === "upcoming");

  const summary =
    view === "upcoming"
      ? live.length > 0
        ? `${live.length} session${live.length === 1 ? " is" : "s are"} live now`
        : nextUp?.scheduled_start_at
          ? `Next: ${nextUp.title}, ${relative(new Date(nextUp.scheduled_start_at), now).toLowerCase()}`
          : "Classes from your courses, joined from here. Times are in West Africa Time."
      : view === "past"
        ? "Sessions that have already taken place, with recordings where available."
        : "Every live session from your courses. Times are in West Africa Time.";

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col pb-12">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Live Sessions</h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.98rem] text-ink-2">{summary}</p>
      </header>

      {/* Happening now: one large card per live session, after the Live banner in the TV app */}
      {view !== "past" && live.length > 0 && (
        <section aria-label="Live now" className="mt-6 grid gap-4">
          {live.map((session) => (
            <LiveNowCard key={session.item_id} session={session} />
          ))}
        </section>
      )}

      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-5 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-2.5">
          <div role="group" aria-label="Show" className="lms-segmented">
            {(
              [
                ["upcoming", "Upcoming"],
                ["past", "Past"],
                ["all", "All"],
              ] as const
            ).map(([key, label]) => (
              <Link
                key={key}
                href={buildPageUrl({ view: key, courseId })}
                aria-current={view === key ? "true" : undefined}
                className="lms-segment !px-4 no-underline"
                scroll={false}
              >
                {label}
              </Link>
            ))}
          </div>
          {courseId && (
            <span className="lms-filter-token">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="max-w-[14rem] truncate">{courseTitle ?? "One course"}</span>
              <Link href={buildPageUrl({ view })} aria-label="Show sessions from every course" className="lms-filter-token-x" scroll={false}>
                <X className="h-3 w-3" strokeWidth={2.6} />
              </Link>
            </span>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="m-0 mt-3 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          {error}
        </p>
      ) : listed.length === 0 && live.length === 0 ? (
        <div className="lms-milk mt-3 flex flex-col items-center px-6 py-14 text-center sm:py-20">
          <span className="lms-cal-icon" aria-hidden="true">
            <span className="lms-cal-icon-month">{new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" }).format(new Date(now))}</span>
            <span className="lms-cal-icon-day">{new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" }).format(new Date(now))}</span>
          </span>
          <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">
            {view === "upcoming" ? "Nothing scheduled" : view === "past" ? "No past sessions" : "No live sessions yet"}
          </h2>
          <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
            {view === "upcoming"
              ? "When a course you’re enrolled in schedules a live class, it appears here with a Join button when it starts."
              : courseId
                ? "This course has no sessions in this view. Try another view or show every course."
                : "Sessions you could have attended appear here once they have taken place."}
          </p>
          {view === "upcoming" && (
            <Link href={buildPageUrl({ view: "past", courseId })} className="lms-btn lms-btn--quiet mt-6" scroll={false}>
              See past sessions
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-6">
          {groups.map((group) => {
            const heading = dayHeading(group.date, now);
            return (
              <section key={group.key} aria-label={heading.title}>
                <h2 className="m-0 mb-2 flex items-baseline gap-2 px-1">
                  <span className={`text-[1.15rem] font-bold tracking-[-0.02em] ${heading.title === "Today" ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-ink"}`}>
                    {heading.title}
                  </span>
                  {heading.detail && <span className="text-[0.85rem] font-medium text-ink-3">{heading.detail}</span>}
                </h2>
                <ul className="lms-group m-0 list-none p-0">
                  {group.items.map((session) => (
                    <li key={session.item_id}>
                      <SessionRow session={session} now={now} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {(hasPrevious || hasNext) && (
        <div className="mt-8 flex justify-center sm:justify-end">
          <nav className="lms-pager" aria-label="Live session pages">
            {hasPrevious ? (
              <Link href={buildPageUrl({ view, page: page - 1, courseId })} aria-label="Previous page" className="lms-page no-underline">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden="true" className="lms-page opacity-35">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
            <span className="lms-page" aria-current="page">
              {page}
            </span>
            {totalPages > 1 && <span className="px-1 text-sm text-ink-3">of {totalPages}</span>}
            {hasNext ? (
              <Link href={buildPageUrl({ view, page: page + 1, courseId })} aria-label="Next page" className="lms-page no-underline">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden="true" className="lms-page opacity-35">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

