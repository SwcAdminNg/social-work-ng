"use client";

import "@/app/alert.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Ban, CalendarClock, CalendarPlus, CheckCircle2, Clock3, Hourglass, PlayCircle, UserRound, Video, VideoOff } from "lucide-react";
import {
  type LiveSession,
  TZ,
  parse,
  sessionEnd,
  sessionHref,
  sessionState,
  timeRange,
} from "./LiveSessionParts";

const JOIN_OPENS_MIN = 10; // the API lets people in from 10 minutes before the start…
const JOIN_CLOSES_MIN = 30; // …until 30 minutes after the scheduled end.

/**
 * The session as it stands right now. The page is rendered on the server, so
 * a tab left open can be out of date: work out "can join" again from the clock,
 * the same way the API does, unless the host has ended or cancelled it.
 */
function current(session: LiveSession, now: number): LiveSession {
  const status = (session.status || "").toUpperCase();
  const start = parse(session.scheduled_start_at);
  const end = sessionEnd(session);
  if (status === "ENDED" || status === "CANCELLED" || !start || !end) return { ...session, can_join: false };
  const open = start.getTime() - JOIN_OPENS_MIN * 60_000;
  const close = end.getTime() + JOIN_CLOSES_MIN * 60_000;
  return { ...session, can_join: now >= open && now <= close };
}

const lessonHref = (session: LiveSession) => `/learn/${session.course_id}/item/${session.item_id}`;

const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" });

/** "2:05:09" or "4:09" until the given time. */
function countdown(target: number, now: number) {
  const total = Math.max(0, Math.round((target - now) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/** "in 3 days", "in 5 hours", "3 days ago" for the message line. */
function fromNow(date: Date, now: number) {
  const diff = date.getTime() - now;
  const abs = Math.abs(diff);
  const unit = abs >= 86_400_000 ? ["day", 86_400_000] : abs >= 3_600_000 ? ["hour", 3_600_000] : ["minute", 60_000];
  const n = Math.max(1, Math.round(abs / (unit[1] as number)));
  const label = `${n} ${unit[0]}${n === 1 ? "" : "s"}`;
  return diff >= 0 ? `in ${label}` : `${label} ago`;
}

/** A calendar file the visitor's own calendar app can open. */
function downloadIcs(session: LiveSession) {
  const start = parse(session.scheduled_start_at);
  const end = sessionEnd(session);
  if (!start || !end) return;
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const url = `${window.location.origin}/dashboard/live-sessions`;
  const guest = [session.guest_name, session.guest_title].filter(Boolean).join(", ");
  const details = [session.course_title, guest && `With ${guest}`, `Join from: ${url}`].filter(Boolean).join("\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Social Work Consultancy Ltd//Live Sessions//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${session.item_id}@socialworknigeria.org`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(session.title)}`,
    `DESCRIPTION:${escape(details)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(session.title)} starts in 15 minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${session.title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "live-session"}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

type Action = { label: ReactNode; href?: string; onClick?: () => void; primary?: boolean; disabled?: boolean; close?: boolean };
type AlertContent = { tone: "green" | "orange" | "blue" | "gray" | "red"; symbol: ReactNode; title: string; message: ReactNode; actions: Action[] };

function contentFor(session: LiveSession, now: number, calendarAdded: boolean, addToCalendar: () => void): AlertContent | null {
  const live = current(session, now);
  const state = sessionState(live, now);
  const start = parse(session.scheduled_start_at);
  const recording = (session.recording_status || "").toUpperCase();
  const done = session.is_completed ? " You’ve marked this lesson complete." : "";
  const calendar: Action = {
    label: calendarAdded ? (
      <>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Added
      </>
    ) : (
      <>
        <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to Calendar
      </>
    ),
    onClick: addToCalendar,
  };

  switch (state) {
    case "live":
      return null;
    case "recording":
      return {
        tone: "green",
        symbol: <PlayCircle size={28} strokeWidth={1.8} />,
        title: "This session has ended",
        message: <>The recording is ready to watch whenever suits you.{done}</>,
        actions: [{ label: "Close", close: true }, { label: "Watch Recording", href: lessonHref(session), primary: true }],
      };
    case "ended": {
      const preparing = recording === "PENDING" || recording === "PROCESSING";
      return {
        tone: "gray",
        symbol: preparing ? <Hourglass size={26} strokeWidth={1.8} /> : <VideoOff size={26} strokeWidth={1.8} />,
        title: "This session has ended",
        message: (
          <>
            {start ? `It took place ${fromNow(start, now)}. ` : ""}
            {preparing
              ? "The recording is being prepared and will appear in the lesson once it’s ready."
              : "There’s no recording for this one, but the lesson may still have notes and materials."}
            {done}
          </>
        ),
        actions: [{ label: "Open Lesson", href: lessonHref(session) }, { label: "OK", close: true, primary: true }],
      };
    }
    case "cancelled":
      return {
        tone: "red",
        symbol: <Ban size={26} strokeWidth={1.8} />,
        title: "This session was cancelled",
        message: "Your instructor cancelled it. If it’s rescheduled, the new time will appear here and in your notifications.",
        actions: [{ label: "Open Course", href: lessonHref(session) }, { label: "OK", close: true, primary: true }],
      };
    case "soon": {
      const opens = start ? start.getTime() - JOIN_OPENS_MIN * 60_000 : now;
      return {
        tone: "orange",
        symbol: <Clock3 size={26} strokeWidth={1.8} />,
        title: "Starting soon",
        message: (
          <>
            Starts in <span className="lms-alert-count">{start ? countdown(start.getTime(), now) : "a moment"}</span>. You can join
            from {JOIN_OPENS_MIN} minutes before the start.
          </>
        ),
        actions: [
          calendar,
          { label: <>Join in <span className="lms-alert-count">{countdown(opens, now)}</span></>, disabled: true, primary: true },
        ],
      };
    }
    case "upcoming":
      return {
        tone: "blue",
        symbol: start ? (
          <span className="lms-alert-cal" aria-hidden="true">
            <span>{monthFmt.format(start)}</span>
            <b>{dayFmt.format(start)}</b>
          </span>
        ) : (
          <CalendarClock size={26} strokeWidth={1.8} />
        ),
        title: "This session hasn’t started yet",
        message: start ? (
          <>
            It starts {fromNow(start, now)}. Joining opens {JOIN_OPENS_MIN} minutes before the start; we’ll show a Join button here.
          </>
        ) : (
          "Joining opens shortly before the start."
        ),
        actions: [calendar, { label: "OK", close: true, primary: true }],
      };
    default:
      return {
        tone: "gray",
        symbol: <CalendarClock size={26} strokeWidth={1.8} />,
        title: "Time to be confirmed",
        message: "This session hasn’t been given a time yet. We’ll let you know as soon as it’s scheduled.",
        actions: [{ label: "OK", close: true, primary: true }],
      };
  }
}

/**
 * The session's title as the row's tap target. A session that can be joined
 * opens the call; anything else opens an Apple-style alert explaining why not.
 */
export function SessionOpener({ session, className, children }: { session: LiveSession; className?: string; children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handle = () => {
    // Read the clock now, not when the page was rendered.
    if (sessionState(current(session, Date.now()), Date.now()) === "live") {
      router.push(sessionHref(session));
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handle} aria-haspopup="dialog" className={className}>
        {children}
      </button>
      {open && <SessionAlert session={session} onClose={() => setOpen(false)} />}
    </>
  );
}

function SessionAlert({ session, onClose }: { session: LiveSession; onClose: () => void }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [closing, setClosing] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // A ticking clock while open, so countdowns move and the Join button appears on time.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dismiss = () => setClosing(true);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[data-default]")?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setClosing(true);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previous;
    };
  }, []);

  const content = contentFor(session, now, calendarAdded, () => {
    downloadIcs(session);
    setCalendarAdded(true);
  });

  // It became joinable while the alert was open: offer to join instead.
  const joinable = content === null;
  const shown: AlertContent = content ?? {
    tone: "green",
    symbol: <Video size={26} strokeWidth={1.8} />,
    title: "It’s time to join",
    message: "The session is open now.",
    actions: [{ label: "Not Now", close: true }, { label: "Join Now", href: sessionHref(session), primary: true }],
  };

  const { start, end } = timeRange(session);
  const startDate = parse(session.scheduled_start_at);
  const guest = [session.guest_name, session.guest_title].filter(Boolean).join(", ");

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      data-keep-popover
      data-closing={closing || undefined}
      className="lms-alert-scrim"
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) {
          onClose();
          restoreRef.current?.focus?.();
        }
      }}
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={dismiss} />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-alert-title"
        aria-describedby="session-alert-message"
        className="lms-alert lms-alert--wide"
      >
        <span key={shown.tone + String(joinable)} className={`lms-alert-symbol lms-alert-symbol--${shown.tone}`} aria-hidden="true">
          {shown.symbol}
        </span>
        <h2 id="session-alert-title" className="lms-alert-title">
          {shown.title}
        </h2>
        <p id="session-alert-message" className="lms-alert-message" aria-live="polite">
          {shown.message}
        </p>

        {/* What the session is, as a compact inset list. */}
        <dl className="lms-alert-facts">
          <div>
            <dt>Session</dt>
            <dd>{session.title}</dd>
          </div>
          {session.course_title && (
            <div>
              <dt>Course</dt>
              <dd>{session.course_title}</dd>
            </div>
          )}
          <div>
            <dt>When</dt>
            <dd>
              {startDate ? (
                <>
                  {dateFmt.format(startDate)}
                  <br />
                  {start}
                  {end ? ` – ${end}` : ""} WAT
                </>
              ) : (
                "To be confirmed"
              )}
            </dd>
          </div>
          {guest && (
            <div>
              <dt>Guest</dt>
              <dd className="inline-flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                {guest}
              </dd>
            </div>
          )}
        </dl>

        <div className={`lms-alert-actions ${shown.actions.length > 2 ? "lms-alert-actions--stack" : ""}`}>
          {shown.actions.map((action, i) => {
            const className = `lms-alert-btn ${action.primary ? "lms-alert-btn--default" : ""}`;
            const isDefault = action.primary && !action.disabled ? "" : undefined;
            if (action.href && !action.disabled) {
              return (
                <Link
                  key={i}
                  href={action.href}
                  data-default={isDefault}
                  className={`${className} no-underline`}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(action.href!);
                  }}
                >
                  {action.label}
                </Link>
              );
            }
            return (
              <button
                key={i}
                type="button"
                data-default={isDefault ?? (i === shown.actions.length - 1 && !action.disabled ? "" : undefined)}
                disabled={action.disabled}
                className={className}
                onClick={action.close ? dismiss : action.onClick}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
