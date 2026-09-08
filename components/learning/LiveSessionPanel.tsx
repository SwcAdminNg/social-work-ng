"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, UserRound, Video } from "lucide-react";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { VideoPlayer } from "./VideoPlayer";

export type LiveSessionItem = {
  id: string;
  title?: string | null;
  is_completed?: boolean | null;
  live_session_scheduled_start_at?: string | null;
  live_session_duration_minutes?: number | null;
  live_session_guest_name?: string | null;
  live_session_guest_title?: string | null;
  live_session_status?: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED" | string | null;
  live_session_can_join?: boolean | null;
  live_session_recording_status?: "PENDING" | "PROCESSING" | "READY" | "FAILED" | string | null;
  live_session_recording_url?: string | null;
};

type LiveSessionPanelProps = {
  courseId: string;
  item: LiveSessionItem;
};

export function LiveSessionPanel({ courseId, item }: LiveSessionPanelProps) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const scheduledAt = formatDateTime(item.live_session_scheduled_start_at);
  const duration = item.live_session_duration_minutes;
  const isEnded = item.live_session_status === "ENDED";
  const isCancelled = item.live_session_status === "CANCELLED";
  const recordingReady =
    isEnded &&
    item.live_session_recording_status === "READY" &&
    Boolean(item.live_session_recording_url);

  useEffect(() => {
    if (isEnded || isCancelled || item.live_session_can_join) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
      router.refresh();
    }, 60000);

    return () => window.clearInterval(timer);
  }, [isCancelled, isEnded, item.live_session_can_join, router]);

  if (recordingReady && item.live_session_recording_url) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
        <VideoPlayer
          url={item.live_session_recording_url}
          courseId={courseId}
          itemId={item.id}
          isCompleted={item.is_completed === true}
        />
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
      <div className="border-b border-[#dceee4] bg-[#fbfefd] px-4 py-4 dark:border-[#27433a] dark:bg-[#0f1726] sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:text-[#b7e4c7]">
              Live session
            </p>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
              {item.title || "Live session"}
            </h2>
          </div>
          <MarkCompleteButton
            courseId={courseId}
            itemId={item.id}
            isCompleted={item.is_completed === true}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<CalendarDays className="h-5 w-5" />}
            label="Date and time"
            value={scheduledAt || "To be announced"}
          />
          <InfoTile
            icon={<Clock3 className="h-5 w-5" />}
            label="Duration"
            value={duration ? `${duration} min` : "Planned session"}
          />
          <InfoTile
            icon={<UserRound className="h-5 w-5" />}
            label="Presenter"
            value={formatGuest(item) || "Course instructor"}
          />
        </div>

        <div className="rounded-lg border border-[#dceee4] bg-[#f7fcf9] p-4 dark:border-[#27433a] dark:bg-[#13231d]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-950 dark:text-white">
                {getStatusHeadline(item)}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {getStatusDescription(item)}
              </p>
            </div>
            {item.live_session_can_join ? (
              <Link
                href={`/api/proxy/courses/items/${item.id}/live-session/join`}
                onClick={(event) => {
                  event.preventDefault();
                  router.push(`/learn/${courseId}/item/${item.id}/live-session`);
                }}
                className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                <Video className="h-4 w-4" />
                Join now
              </Link>
            ) : !isEnded && !isCancelled ? (
              <button
                type="button"
                disabled
                className="inline-flex h-11 flex-shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-slate-100 px-4 text-sm font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                <Clock3 className="h-4 w-4" />
                {formatCountdown(item.live_session_scheduled_start_at, now) || "Not open yet"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#dceee4] bg-white p-4 dark:border-[#27433a] dark:bg-[#111525]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold leading-5 text-slate-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function getStatusHeadline(item: LiveSessionItem) {
  if (item.live_session_status === "ENDED") {
    return item.live_session_recording_status === "READY"
      ? "Recording available"
      : "Session ended";
  }
  if (item.live_session_status === "CANCELLED") return "Session cancelled";
  if (item.live_session_can_join) return "The join window is open";
  return "Upcoming live session";
}

function getStatusDescription(item: LiveSessionItem) {
  if (item.live_session_status === "ENDED") {
    if (item.live_session_recording_status === "FAILED") return "";
    return "Recording processing, check back soon.";
  }
  if (item.live_session_status === "CANCELLED") {
    return "This live session is no longer accepting joins.";
  }
  if (item.live_session_can_join) {
    return "Join opens in a secure Daily video room using your course access.";
  }
  return "The join button becomes available when the backend opens the session window.";
}

function formatGuest(item: LiveSessionItem) {
  const name = item.live_session_guest_name?.trim();
  const title = item.live_session_guest_title?.trim();
  if (!name) return null;
  return title ? `${name}, ${title}` : name;
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCountdown(value?: string | null, now = Date.now()) {
  if (!value) return null;
  const start = new Date(value).getTime();
  if (!Number.isFinite(start)) return null;

  const diff = start - now;
  if (diff <= 0) return "Opening soon";

  const minutes = Math.ceil(diff / 60000);
  if (minutes < 60) return `Starts in ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `Starts in ${hours}h ${remainder}m` : `Starts in ${hours}h`;
}
