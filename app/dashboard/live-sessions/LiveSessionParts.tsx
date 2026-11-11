import Link from "next/link";
import { ChevronRight, Clock3, UserRound, Video } from "lucide-react";
import { SessionOpener } from "./SessionAlert";

export type LiveSession = {
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

export function sessionHref(session: LiveSession) {
  return `/courses/${session.course_slug || session.course_id}/live-session/${session.item_id}`;
}

export const TZ = "Africa/Lagos";
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });

export function parse(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type SessionState = "live" | "soon" | "upcoming" | "ended" | "recording" | "cancelled" | "unscheduled";

/** When the session is due to finish: its end time, or start plus duration. */
export function sessionEnd(session: LiveSession) {
  const start = parse(session.scheduled_start_at);
  return parse(session.scheduled_end_at) ?? (start && session.duration_minutes ? new Date(start.getTime() + session.duration_minutes * 60_000) : null);
}

export function sessionState(session: LiveSession, now: number): SessionState {
  const status = (session.status || "").toUpperCase();
  if (status === "CANCELLED") return "cancelled";
  // The host can end a session early; it stops being joinable even inside the join window.
  const endedByHost = status === "ENDED";
  if (!endedByHost && session.can_join) return "live";
  const start = parse(session.scheduled_start_at);
  const end = sessionEnd(session);
  const recording = (session.recording_status || "").toUpperCase();
  if (endedByHost || session.is_completed || (end && end.getTime() < now)) {
    return ["READY", "AVAILABLE", "PUBLISHED", "COMPLETED"].includes(recording) ? "recording" : "ended";
  }
  // The host opened the room before the usual join window.
  if (status === "LIVE") return "live";
  if (!start) return "unscheduled";
  return start.getTime() - now <= 60 * 60_000 ? "soon" : "upcoming";
}

/** "in 25 min", "in 3 h", "Tomorrow", "in 4 days" */
export function relative(start: Date, now: number) {
  const minutes = Math.round((start.getTime() - now) / 60_000);
  if (minutes <= 0) return "Starting";
  if (minutes < 60) return `In ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24 && dayKey.format(start) === dayKey.format(new Date(now))) return `In ${hours} h`;
  const days = Math.round((startOfLagosDay(start) - startOfLagosDay(new Date(now))) / 86_400_000);
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function startOfLagosDay(date: Date) {
  return new Date(`${dayKey.format(date)}T00:00:00+01:00`).getTime();
}

export function dayHeading(date: Date | null, now: number) {
  if (!date) return { title: "Not yet scheduled", detail: "" };
  const key = dayKey.format(date);
  const full = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(date);
  if (key === dayKey.format(new Date(now))) return { title: "Today", detail: full };
  if (key === dayKey.format(new Date(now + 86_400_000))) return { title: "Tomorrow", detail: full };
  if (key === dayKey.format(new Date(now - 86_400_000))) return { title: "Yesterday", detail: full };
  const year = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(date);
  const thisYear = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(new Date(now));
  return { title: full, detail: year === thisYear ? "" : year };
}

export function groupByDay(items: LiveSession[]) {
  const groups: { key: string; date: Date | null; items: LiveSession[] }[] = [];
  for (const session of items) {
    const date = parse(session.scheduled_start_at);
    const key = date ? dayKey.format(date) : "unscheduled";
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(session);
    else groups.push({ key, date, items: [session] });
  }
  return groups;
}

export function timeRange(session: LiveSession) {
  const start = parse(session.scheduled_start_at);
  if (!start) return { start: "TBC", end: "" };
  const end = sessionEnd(session);
  return { start: timeFmt.format(start), end: end ? timeFmt.format(end) : "" };
}

export function LiveNowCard({ session }: { session: LiveSession }) {
  const { start, end } = timeRange(session);
  const guest = [session.guest_name, session.guest_title].filter(Boolean).join(", ");
  return (
    <article className="lms-live-card">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="lms-live-pill">
            <span className="lms-live-dot" aria-hidden="true" />
            LIVE
          </span>
          <h2 className="sw-title m-0 mt-4 text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-white">{session.title}</h2>
          <p className="m-0 mt-2 text-[0.95rem] text-white/75">
            {session.course_title || "Course session"}
            {session.section_title ? ` · ${session.section_title}` : ""}
          </p>
          <p className="m-0 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.85rem] text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {start}
              {end ? ` – ${end}` : ""} WAT
            </span>
            {guest && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                {guest}
              </span>
            )}
          </p>
        </div>
        <Link href={sessionHref(session)} className="lms-live-join">
          <Video className="h-5 w-5" aria-hidden="true" />
          Join now
        </Link>
      </div>
    </article>
  );
}

export function SessionRow({ session, now }: { session: LiveSession; now: number }) {
  const state = sessionState(session, now);
  const { start, end } = timeRange(session);
  const guest = [session.guest_name, session.guest_title].filter(Boolean).join(", ");
  const startDate = parse(session.scheduled_start_at);

  const status =
    state === "live"
      ? { label: "Live now", tone: "red" }
      : state === "soon" && startDate
        ? { label: relative(startDate, now), tone: "orange" }
        : state === "upcoming" && startDate
          ? { label: relative(startDate, now), tone: "blue" }
          : state === "recording"
            ? { label: "Recording available", tone: "green" }
            : state === "ended"
              ? { label: "Ended", tone: "gray" }
              : state === "cancelled"
                ? { label: "Cancelled", tone: "red" }
                : { label: "Time to be confirmed", tone: "gray" };

  const action = state === "live" ? "Join" : state === "recording" ? "Watch" : "Details";

  return (
    <div className={`lms-row group lms-session lms-session--${state}`}>
      <div className="w-[4.75rem] flex-none text-right sm:w-24">
        <span className="block text-[0.9rem] font-semibold tabular-nums text-ink">{start}</span>
        {end && <span className="block text-[0.78rem] tabular-nums text-ink-3">{end}</span>}
      </div>
      <span className="lms-session-bar" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 truncate text-[0.98rem] font-semibold tracking-[-0.01em] text-ink">
          {state === "live" ? (
            <Link href={sessionHref(session)} className="lms-stretch text-inherit no-underline">
              {session.title}
            </Link>
          ) : (
            // Anything not joinable explains itself in an alert instead of opening a call that cannot start.
            <SessionOpener session={session} className="lms-stretch lms-session-open">
              {session.title}
            </SessionOpener>
          )}
        </h3>
        <p className="m-0 mt-0.5 truncate text-[0.84rem] text-ink-2">
          {session.course_title || "Course session"}
          {session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
        </p>
        <p className="m-0 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.78rem]">
          <span className={`lms-status lms-status--${status.tone}`}>{status.label}</span>
          {guest && (
            <span className="inline-flex min-w-0 items-center gap-1 text-ink-3">
              <UserRound className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
              <span className="truncate">{guest}</span>
            </span>
          )}
        </p>
      </div>
      <span className={`lms-row-action ${state === "live" ? "lms-row-action--red-fill" : state === "soon" ? "lms-row-action--primary" : ""} hidden sm:inline-flex`} aria-hidden="true">
        {state === "live" && <Video className="mr-1 h-3.5 w-3.5" />}
        {action}
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-ink-3 sm:hidden" aria-hidden="true" />
    </div>
  );
}
