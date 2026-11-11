"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  RefreshCw,
  Timer,
  UserRound,
  Video,
} from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
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
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const scheduledAt = formatDateTime(item.live_session_scheduled_start_at);
  const scheduledDate = formatDatePart(item.live_session_scheduled_start_at);
  const scheduledTime = formatTimePart(item.live_session_scheduled_start_at);
  const duration = item.live_session_duration_minutes;
  const isEnded = item.live_session_status === "ENDED";
  const isCancelled = item.live_session_status === "CANCELLED";
  const countdown = formatCountdown(item.live_session_scheduled_start_at, now);
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
      <div className="lms-stage">
        <VideoPlayer
          url={item.live_session_recording_url}
          courseId={courseId}
          itemId={item.id}
          isCompleted={item.is_completed === true}
        />
      </div>
    );
  }

  const join = async () => {
    setJoining(true);
    setJoinError(null);
    const meetingWindow = window.open("", "_blank");

    if (meetingWindow) {
      meetingWindow.document.title = "Opening live session";
      meetingWindow.document.body.innerHTML =
        '<div style="font-family: system-ui, sans-serif; min-height: 100vh; display: grid; place-items: center; color: #0b1410;"><div><strong>Opening live session...</strong><p style="color: #4a5c52;">Please wait while we create your secure Daily link.</p></div></div>';
    }

    try {
      const res = await fetch(`/api/proxy/courses/items/${item.id}/live-session/join`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        meetingWindow?.close();
        setJoinError(json?.message || "This live session is not available right now.");
        return;
      }

      if (json?.data?.join_url) {
        if (meetingWindow) {
          meetingWindow.opener = null;
          meetingWindow.location.assign(json.data.join_url);
        } else {
          setJoinError("Your browser blocked the new tab. Please allow pop-ups and try again.");
        }
        return;
      }

      meetingWindow?.close();
      setJoinError("The live session join link was not returned.");
    } catch {
      meetingWindow?.close();
      setJoinError("We could not reach the live session service.");
    } finally {
      setJoining(false);
    }
  };

  const canJoin = item.live_session_can_join === true;
  const headline = canJoin
    ? "Open Now"
    : isEnded
      ? "Session Ended"
      : isCancelled
        ? "Cancelled"
        : countdown || "Time to be announced";

  return (
    <div className="space-y-6">
      <section className="lms-live" aria-labelledby="live-headline">
        <div className="flex flex-wrap items-center gap-2">
          <span className="lms-live-badge" data-live={canJoin ? "" : undefined}>
            {canJoin ? "LIVE" : isEnded ? "ENDED" : isCancelled ? "CANCELLED" : "UPCOMING"}
          </span>
          {item.is_completed && (
            <span className="lms-live-badge !bg-[#30d158] !text-[#06130d]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Completed
            </span>
          )}
        </div>
        <p
          id="live-headline"
          className="lms-num m-0 mt-5 text-[2.25rem] text-white sm:text-[2.75rem]"
          role="timer"
          aria-live="off"
        >
          {headline}
        </p>
        {scheduledAt && <p className="m-0 mt-2 text-[0.9375rem] font-medium text-white/80">{scheduledAt}</p>}
        <p className="m-0 mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-white/65">{getHeroDescription(item)}</p>

        {(canJoin || (!isEnded && !isCancelled)) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canJoin ? (
              <button type="button" onClick={join} disabled={joining} className="lms-btn">
                {joining ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                {joining ? "Opening Daily…" : "Join Session"}
              </button>
            ) : (
              <button type="button" disabled className="lms-btn">
                <Clock3 className="h-4 w-4" />
                Not Open Yet
              </button>
            )}
            <span className="text-[0.8125rem] text-white/60">
              {canJoin ? "Opens in a new tab." : "The button turns on when the room opens."}
            </span>
          </div>
        )}
        {joinError && (
          <p role="alert" className="m-0 mt-4 flex items-start gap-2 text-sm font-medium text-[#ff8a80]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{joinError}</span>
          </p>
        )}
      </section>

      <div>
        <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">Details</h2>
        <div className="lms-group">
          <DetailRow tone="red" icon={<CalendarDays className="h-4 w-4" />} label="Date" value={scheduledDate || "To be announced"} />
          <DetailRow tone="orange" icon={<Clock3 className="h-4 w-4" />} label="Starts" value={scheduledTime || "To be announced"} />
          {duration ? (
            <DetailRow tone="blue" icon={<Timer className="h-4 w-4" />} label="Duration" value={formatDuration(duration)} />
          ) : null}
          <DetailRow tone="indigo" icon={<UserRound className="h-4 w-4" />} label="Presenter" value={formatGuest(item) || "Course instructor"} />
        </div>
      </div>

      {!isEnded && !isCancelled && (
        <div>
          <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">Before You Join</h2>
          <ul className="lms-group m-0 list-none p-0">
            <PrepRow tone="green" icon={<Video className="h-4 w-4" />} title="Daily opens in a new tab" text="Your secure link is created when you press Join." />
            <PrepRow tone="blue" icon={<Headphones className="h-4 w-4" />} title="Check your setup" text="A working microphone, camera and a steady connection." />
            <PrepRow tone="gray" icon={<RefreshCw className="h-4 w-4" />} title="Keep this page open" text="It checks every minute and turns Join on by itself." />
          </ul>
        </div>
      )}

      <div className="lms-group">
        <div className="lms-group-foot !shadow-none">
          <p>{getCompletionHint(item)}</p>
          <MarkCompleteButton courseId={courseId} itemId={item.id} isCompleted={item.is_completed === true} />
        </div>
      </div>
    </div>
  );
}

const TONES = {
  red: "lms-sym--red",
  orange: "lms-sym--orange",
  blue: "lms-sym--blue",
  indigo: "lms-sym--indigo",
  green: "lms-sym--green",
  gray: "lms-sym--gray",
} as const;

function DetailRow({
  tone,
  icon,
  label,
  value,
}: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="lms-detail">
      <span className={`lms-sym lms-sym--sm ${TONES[tone]}`} aria-hidden="true">
        {icon}
      </span>
      <span className="lms-detail-label">{label}</span>
      <span className="lms-detail-value">{value}</span>
    </div>
  );
}

function PrepRow({
  tone,
  icon,
  title,
  text,
}: {
  tone: keyof typeof TONES;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <li className="lms-detail !items-start">
      <span className={`lms-sym lms-sym--sm ${TONES[tone]}`} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[0.9375rem] text-ink">{title}</span>
        <span className="block text-[0.8125rem] leading-snug text-ink-3">{text}</span>
      </span>
    </li>
  );
}

function getHeroDescription(item: LiveSessionItem) {
  if (item.live_session_status === "ENDED") {
    if (item.live_session_recording_status === "FAILED") {
      return "The session has ended. A recording isn't available for this one.";
    }
    return "The session has ended. The recording will appear here once it's ready.";
  }
  if (item.live_session_status === "CANCELLED") {
    return "This session was cancelled and is no longer taking joins.";
  }
  if (item.live_session_can_join) {
    return "The room is open. Join now and the class runs in Daily, in its own tab.";
  }
  return "Keep this page open if you're waiting. Join turns on as soon as the room opens.";
}

function getCompletionHint(item: LiveSessionItem) {
  if (item.is_completed) return "You've marked this live session complete.";
  if (item.live_session_status === "ENDED") {
    return "Mark this complete once you've attended or watched the recording.";
  }
  return "After the session, come back here and mark it complete.";
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
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

function formatDatePart(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTimePart(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
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
