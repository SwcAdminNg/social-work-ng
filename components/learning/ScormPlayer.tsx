"use client";

// Plays an interactive (SCORM / zipped HTML) lesson inside the learning page.
//
// The API serves the package through a signed launch URL and injects a SCORM
// runtime into it, so the content saves its own progress straight back to the
// API. This component only hosts the iframe, listens for the runtime's
// postMessage updates (to flip the lesson to "complete" without a reload) and
// offers fullscreen plus a manual "mark complete" fallback.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, CheckCircle2, Loader2, Maximize2, Minimize2, RotateCw } from "lucide-react";
import { MarkCompleteButton } from "./MarkCompleteButton";

type ScormProgress = {
  lesson_status?: string | null;
  success_status?: string | null;
  lesson_location?: string | null;
  score_raw?: number | null;
  score_max?: number | null;
  total_time_seconds?: number | null;
  launch_count?: number | null;
};

export type ScormContent = {
  status?: "PENDING" | "PROCESSING" | "READY" | "FAILED" | string | null;
  scorm_version?: string | null;
  manifest_title?: string | null;
  completion_from_package?: boolean | null;
  launch_url?: string | null;
  launch_expires_at?: string | null;
  progress?: ScormProgress | null;
};

type RuntimeMessage = {
  type: "swn-scorm";
  event: "changed" | "committed";
  completed: boolean;
  lessonStatus?: string;
  successStatus?: string;
  scoreRaw?: string;
  saved?: boolean;
};

function versionLabel(version?: string | null) {
  if (!version) return "Interactive lesson";
  return `SCORM ${version}`;
}

function humanStatus(status?: string | null) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "not attempted" || s === "unknown") return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ScormPlayer({
  courseId,
  itemId,
  title,
  isCompleted,
  scorm,
}: {
  courseId: string;
  itemId: string;
  title: string;
  isCompleted: boolean;
  scorm: ScormContent;
}) {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const refreshedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [runtime, setRuntime] = useState<{ completed: boolean; status: string | null; saved: boolean; savedAt: number | null }>({
    completed: isCompleted,
    status: scorm.progress?.lesson_status ?? null,
    saved: false,
    savedAt: null,
  });

  const launchOrigin = (() => {
    try {
      return scorm.launch_url ? new URL(scorm.launch_url).origin : null;
    } catch {
      return null;
    }
  })();

  // Messages from the runtime inside the iframe.
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (launchOrigin && ev.origin !== launchOrigin) return;
      if (ev.source !== frameRef.current?.contentWindow) return;
      const data = ev.data as RuntimeMessage | undefined;
      if (!data || data.type !== "swn-scorm") return;
      setRuntime((prev) => ({
        completed: prev.completed || data.completed,
        status: data.lessonStatus || prev.status,
        saved: data.event === "committed" ? true : prev.saved,
        savedAt: data.event === "committed" ? Date.now() : prev.savedAt,
      }));
      // The server has marked the item complete: refresh the server-rendered
      // sidebar/next-button once, without reloading the iframe.
      if (data.event === "committed" && data.completed && !isCompleted && !refreshedRef.current) {
        refreshedRef.current = true;
        router.refresh();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [isCompleted, launchOrigin, router]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  const ready = scorm.status === "READY" && !!scorm.launch_url;
  const completed = isCompleted || runtime.completed;
  const statusText = completed
    ? "Completed"
    : humanStatus(runtime.status) ?? (scorm.progress?.launch_count ? "In progress" : "Not started");

  return (
    <div
      ref={shellRef}
      className="lms-window h-[calc(100dvh-200px)] min-h-[480px] w-full [&:fullscreen]:h-screen [&:fullscreen]:rounded-none"
    >
      <div className="lms-window-bar">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`lms-sym lms-sym--sm ${completed ? "lms-sym--green" : "lms-sym--indigo"}`}
            aria-hidden="true"
          >
            {completed ? <CheckCircle2 className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 line-clamp-1 font-[family-name:var(--font-roboto)] text-sm font-semibold tracking-normal text-ink">
              {title}
            </h2>
            <p className="m-0 line-clamp-1 text-xs text-ink-3">
              {versionLabel(scorm.scorm_version)} · {statusText}
              {runtime.savedAt
                ? " · Progress saved"
                : scorm.progress?.lesson_location
                  ? " · Picks up where you left off"
                  : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {ready && (
            <>
              <button
                type="button"
                onClick={() => {
                  setLoaded(false);
                  setReloadKey((k) => k + 1);
                }}
                className="lms-tool"
                title="Reload Lesson"
                aria-label="Reload lesson"
              >
                <RotateCw className="h-[1.05rem] w-[1.05rem]" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="lms-tool"
                title={fullscreen ? "Exit Full Screen" : "Enter Full Screen"}
                aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
              >
                {fullscreen ? <Minimize2 className="h-[1.05rem] w-[1.05rem]" /> : <Maximize2 className="h-[1.05rem] w-[1.05rem]" />}
              </button>
            </>
          )}
          {/* Fallback for packages that never report completion, or when the
              author chose "opening is enough". The server also auto-completes
              in that case on the first save, so this mostly covers packages
              that never call the LMS API at all. */}
          {(scorm.completion_from_package === false || completed) && (
            <MarkCompleteButton courseId={courseId} itemId={itemId} isCompleted={completed} className="ml-1" />
          )}
        </div>
      </div>

      <div className="relative w-full flex-1 bg-[color-mix(in_srgb,var(--sw-ink)_5%,var(--sw-paper))]">
        {ready ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 z-10 grid place-items-center">
                <div className="flex items-center gap-2 text-sm text-ink-3">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading the lesson…
                </div>
              </div>
            )}
            <iframe
              key={reloadKey}
              ref={frameRef}
              src={scorm.launch_url!}
              title={title}
              onLoad={() => setLoaded(true)}
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </>
        ) : (
          <div className="grid h-full place-items-center">
            <div className="lms-unavailable">
              <Boxes aria-hidden="true" />
              <h3 className="m-0 font-[family-name:var(--font-roboto)] text-[1.25rem] font-semibold tracking-[-0.01em] text-ink">
                {scorm.status === "FAILED" ? "Lesson Unavailable" : "Getting This Lesson Ready"}
              </h3>
              <p>
                {scorm.status === "FAILED"
                  ? "The lesson package couldn't be prepared. Your instructor has been told."
                  : "The lesson package is still being prepared. Check back in a few minutes."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
