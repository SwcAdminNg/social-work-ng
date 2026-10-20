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
import { Boxes, CheckCircle, Expand, Loader2, RefreshCw, Shrink } from "lucide-react";
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
      className="flex h-[calc(100dvh-220px)] min-h-[480px] w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.04] dark:bg-[#14171f] dark:ring-white/10 [&:fullscreen]:h-screen [&:fullscreen]:rounded-none"
    >
      <div className="flex flex-shrink-0 flex-col gap-3 border-b border-black/[0.06] bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#14171f]/80 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
              completed ? "bg-[#52b788] text-[#06130d]" : "bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]"
            }`}
          >
            {completed ? <CheckCircle className="h-5 w-5" /> : <Boxes className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <h2 className="line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{title}</h2>
            <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {versionLabel(scorm.scorm_version)} · {statusText}
              {runtime.savedAt ? " · Progress saved" : scorm.progress?.lesson_location ? " · Resumes where you left off" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {ready && (
            <>
              <button
                type="button"
                onClick={() => {
                  setLoaded(false);
                  setReloadKey((k) => k + 1);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                title="Reload the lesson"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Reload</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                <span className="hidden sm:inline">{fullscreen ? "Exit" : "Fullscreen"}</span>
              </button>
            </>
          )}
          {/* Fallback for packages that never report completion, or when the
              author chose "opening is enough". The server also auto-completes
              in that case on the first save, so this mostly covers packages
              that never call the LMS API at all. */}
          {(scorm.completion_from_package === false || completed) && (
            <MarkCompleteButton courseId={courseId} itemId={itemId} isCompleted={completed} className="h-9" />
          )}
        </div>
      </div>

      <div className="relative w-full flex-1 bg-slate-100 dark:bg-[#0a0c11]">
        {ready ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 z-10 grid place-items-center">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
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
          <div className="grid h-full place-items-center p-8 text-center">
            <div className="max-w-sm">
              <Boxes className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">This lesson isn&apos;t available yet</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {scorm.status === "FAILED"
                  ? "The lesson package couldn't be prepared. Your instructor has been notified."
                  : "The lesson package is still being prepared. Please check back shortly."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
