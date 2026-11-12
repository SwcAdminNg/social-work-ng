"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Clock, CloudCheck, CloudOff, CloudUpload, LogOut, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconSpinner } from "@/components/auth/shared/icons";

/**
 * While a quiz is open the learner stays in it: the browser's back button, a refresh or
 * closing the tab are all caught, and the only ways out are Leave or Submit.
 */
function useQuizLock(active: boolean, onLeaveAttempt: () => void) {
  const onLeaveAttemptRef = useRef(onLeaveAttempt);
  useEffect(() => {
    onLeaveAttemptRef.current = onLeaveAttempt;
  });

  useEffect(() => {
    if (!active) return;

    // A history entry of our own, so Back lands on it instead of leaving the page.
    window.history.pushState(window.history.state, "", window.location.href);
    const onPopState = () => {
      window.history.pushState(window.history.state, "", window.location.href);
      onLeaveAttemptRef.current();
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [active]);
}

interface QuizFocusShellProps {
  title: string;
  /** Countdown for timed attempts; omit for untimed quizzes. */
  remainingMs?: number | null;
  /** Whether the learner's answers are on the server yet. */
  saveStatus?: SaveStatus;
  /** Extra controls in the top bar (e.g. Ask JAD on a practice quiz). */
  actions?: ReactNode;
  submitting: boolean;
  /** Opens the submit confirmation. */
  onSubmit: () => void;
  /** Called once the learner confirms they want to leave. */
  onLeave: () => void;
  /** What happens to their work if they leave, shown in the Leave dialog. */
  leaveNote: ReactNode;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  children: ReactNode;
}

export function QuizFocusShell({
  title,
  remainingMs,
  saveStatus,
  actions,
  submitting,
  onSubmit,
  onLeave,
  leaveNote,
  index,
  total,
  onPrevious,
  onNext,
  children,
}: QuizFocusShellProps) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  useQuizLock(true, () => setLeaveOpen(true));

  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const isLast = index >= total - 1;
  const low = remainingMs != null && remainingMs < 60000;

  // Inside .lms-root so the LMS fonts and tokens still apply.
  const host = document.querySelector(".lms-root") ?? document.body;

  return createPortal(
    <div className="lms-quiz" role="dialog" aria-modal="true" aria-label={title}>
      <header className="lms-quiz-bar">
        <button
          type="button"
          onClick={() => setLeaveOpen(true)}
          disabled={submitting}
          className="lms-btn lms-btn--sm lms-btn--quiet flex-none"
        >
          <LogOut className="-ml-0.5 h-4 w-4 rotate-180" aria-hidden="true" />
          Leave
        </button>

        <p className="m-0 hidden min-w-0 flex-1 truncate text-center text-[0.9375rem] font-semibold text-ink sm:block">
          {title}
        </p>
        <span className="flex-1 sm:hidden" />

        <div className="flex flex-none items-center gap-2">
          {actions}
          {saveStatus && <SaveIndicator status={saveStatus} />}
          {remainingMs != null && (
            <span
              className="lms-quiz-timer"
              data-low={low ? "" : undefined}
              role="timer"
              aria-label={`Time remaining ${formatCountdown(remainingMs)}`}
            >
              <Clock aria-hidden="true" />
              {formatCountdown(remainingMs)}
            </span>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="lms-btn lms-btn--sm lms-btn--red"
          >
            {submitting ? (
              <IconSpinner className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        </div>
      </header>

      <div ref={bodyRef} className="lms-quiz-body">
        <div className="mx-auto w-full max-w-[760px] px-5 pb-10 pt-6 sm:px-8 sm:pt-9">{children}</div>
      </div>

      {total > 0 && (
        <footer className="lms-quiz-foot">
          <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={index <= 0 || submitting}
              className="lms-btn lms-btn--sm lms-btn--quiet min-w-[7.5rem]"
            >
              <ChevronLeft className="-ml-1 h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <span className="text-[0.8125rem] font-semibold tabular-nums text-ink-3" aria-hidden="true">
              {index + 1} / {total}
            </span>
            {isLast ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="lms-btn lms-btn--sm lms-btn--red min-w-[7.5rem]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                disabled={submitting}
                className="lms-btn lms-btn--sm min-w-[7.5rem]"
              >
                Next
                <ChevronRight className="-mr-1 h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </footer>
      )}

      <LeaveQuizDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={() => {
          setLeaveOpen(false);
          onLeave();
        }}
      >
        {leaveNote}
      </LeaveQuizDialog>
    </div>,
    host,
  );
}

function LeaveQuizDialog({
  open,
  onOpenChange,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children: ReactNode;
}) {
  const stayRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" />
        <Dialog.Content
          role="alertdialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            stayRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-6 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.05] outline-none dark:bg-[#252827] dark:ring-white/10"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200">
            <LogOut className="h-6 w-6 rotate-180" aria-hidden />
          </span>
          <Dialog.Title className="mt-4 text-[1.1875rem] font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">
            Leave this quiz?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[0.9375rem] leading-6 text-slate-600 dark:text-slate-300">
            {children}
          </Dialog.Description>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                ref={stayRef}
                className="h-11 rounded-xl bg-[#2D6A4F] text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-100 hover:bg-[#245c43] active:scale-[0.98] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                Stay
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-xl bg-black/[0.06] text-[0.9375rem] font-semibold text-slate-800 transition-[background-color,transform] duration-100 hover:bg-black/[0.09] active:scale-[0.98] dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
            >
              Leave
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type SaveStatus = "saved" | "saving" | "offline";

/**
 * Keeps a quiz's answers on the server as the learner goes: shortly after each
 * change, and straight away when the page is hidden or closed. Pass `url: null`
 * while there's nothing to save. `status` drives the cloud icon in the quiz bar;
 * `flush` saves immediately (e.g. on Leave). A failed save retries every few
 * seconds and as soon as the connection comes back.
 */
export function useAnswerAutosave(url: string | null, body: object) {
  const json = JSON.stringify(body);
  const latest = useRef({ url, json });
  const lastSent = useRef<string | null>(url ? json : null);
  // What the server has confirmed, for the status. Reset when the target changes
  // (a fresh load from the server is already saved).
  const [confirmed, setConfirmed] = useState({ url, json });
  const [inFlight, setInFlight] = useState(0);
  const [failed, setFailed] = useState(false);
  if (confirmed.url !== url) {
    setConfirmed({ url, json });
    setFailed(false);
  }

  const send = useCallback((keepalive = false) => {
    const { url: target, json: payload } = latest.current;
    if (!target || payload === lastSent.current) return;
    lastSent.current = payload;
    setInFlight((n) => n + 1);
    void fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive,
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        setConfirmed((prev) => (prev.url === target ? { url: target, json: payload } : prev));
        setFailed(false);
      })
      .catch(() => {
        if (lastSent.current === payload) lastSent.current = null;
        setFailed(true);
      })
      .finally(() => setInFlight((n) => Math.max(n - 1, 0)));
  }, []);

  useEffect(() => {
    const changedTarget = latest.current.url !== url;
    latest.current = { url, json };
    if (!url) return;
    if (changedTarget) {
      lastSent.current = json;
      return;
    }
    const timer = setTimeout(() => send(), 600);
    return () => clearTimeout(timer);
  }, [url, json, send]);

  useEffect(() => {
    if (!url) return;
    const onHide = () => send(true);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") send(true);
    };
    const onOnline = () => send();
    window.addEventListener("pagehide", onHide);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [url, send]);

  // Keep trying while a save has failed.
  useEffect(() => {
    if (!url || !failed) return;
    const retry = setInterval(() => send(), 5000);
    return () => clearInterval(retry);
  }, [url, failed, send]);

  const status: SaveStatus =
    failed ? "offline" : inFlight > 0 || json !== confirmed.json ? "saving" : "saved";
  return { flush: send, status };
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving…",
  offline: "Not saved, retrying",
};

/** Google Docs style sync state: a cloud that ticks once the server has the answers. */
function SaveIndicator({ status }: { status: SaveStatus }) {
  const Icon = status === "saved" ? CloudCheck : status === "saving" ? CloudUpload : CloudOff;
  return (
    <span
      className="lms-quiz-sync"
      data-status={status}
      role="status"
      aria-live="polite"
      title={
        status === "offline"
          ? "We couldn't save your latest answers. We'll keep trying; stay on this page."
          : status === "saving"
            ? "Saving your answers…"
            : "All answers saved"
      }
    >
      <Icon aria-hidden="true" />
      <span className="lms-quiz-sync-label">{SAVE_LABELS[status]}</span>
    </span>
  );
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
