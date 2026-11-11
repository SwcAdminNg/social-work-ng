"use client";

import "@/app/alert.css";
import type { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";

type MonitoredSession = Session & {
  expiresAt?: unknown;
  error?: unknown;
};

function SessionModal() {
  const { data: session, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showModal) return;
    const frame = requestAnimationFrame(() => continueBtnRef.current?.focus());
    // Keep focus inside the alert, as a modal alert does.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const first = logoutBtnRef.current;
      const last = continueBtnRef.current;
      if (!first || !last) return;
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
    };
  }, [showModal]);

  useEffect(() => {
    // If there is no session, or if NextAuth has already flagged an error, sign them out.
    if (!session) return;

    const monitoredSession = session as MonitoredSession;

    if (monitoredSession.error === "RefreshAccessTokenError") {
      window.location.assign("/logout");
      return;
    }

    const expiresAt = monitoredSession.expiresAt;
    if (!expiresAt) return;

    const expiryTime = Number(expiresAt) * 1000;

    const interval = setInterval(() => {
      const timeRemaining = expiryTime - Date.now();

      // Within the last minute (or already past it), ask, and count down while asking.
      if (timeRemaining <= 60000) {
        setShowModal(true);
        setSecondsLeft(Math.max(0, Math.ceil(timeRemaining / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleContinue = async () => {
    setIsRefreshing(true);
    await update({ action: "refresh" });
    setIsRefreshing(false);
    setShowModal(false);
    setSecondsLeft(null);
  };

  const handleLogout = async () => {
    window.location.assign("/logout");
  };

  if (!showModal) return null;

  const countdown =
    secondsLeft === null
      ? null
      : `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  return (
    <div className="lms-alert-scrim">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expiring-title"
        aria-describedby="session-expiring-description"
        className="lms-alert"
      >
        <span className="lms-alert-symbol lms-alert-symbol--warn" aria-hidden="true">
          <Clock3 className="h-[26px] w-[26px]" strokeWidth={1.9} />
        </span>
        <h2 id="session-expiring-title" className="lms-alert-title">
          {secondsLeft === 0 ? "Your session has ended" : "Still there?"}
        </h2>
        <p id="session-expiring-description" className="lms-alert-message">
          {secondsLeft === 0 ? (
            "For your security you were signed out after a period of inactivity. Stay signed in to carry on where you left off."
          ) : (
            <>
              For your security you’ll be signed out in{" "}
              <span className="lms-alert-count" aria-live="polite">{countdown ?? "a minute"}</span>. Your progress is saved.
            </>
          )}
        </p>
        <div className="lms-alert-actions">
          <button ref={logoutBtnRef} type="button" onClick={handleLogout} disabled={isRefreshing} className="lms-alert-btn">
            Log Out
          </button>
          <button
            ref={continueBtnRef}
            type="button"
            onClick={handleContinue}
            disabled={isRefreshing}
            className="lms-alert-btn lms-alert-btn--default"
          >
            {isRefreshing ? "Renewing…" : "Stay Signed In"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SessionMonitor({ children, session }: { children: React.ReactNode, session: Session | null }) {
  return (
    <SessionProvider session={session}>
      {children}
      <SessionModal />
    </SessionProvider>
  );
}
