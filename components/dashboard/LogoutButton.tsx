"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconLogout } from "./icons";
import { IconSpinner } from "@/components/auth/shared/icons";

/**
 * Sign-out confirmation, built as an Apple alert: the app icon, a bold
 * question, one line of context and two equal capsule buttons. Cancel holds
 * focus (Return or Escape dismisses it) and the destructive action is red.
 */
export function LogoutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const dismiss = () => {
    if (loading) return;
    setClosing(true);
  };

  const signOut = () => {
    setLoading(true);
    window.location.assign("/logout");
  };

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => cancelRef.current?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
        return;
      }
      if (event.key === "Tab") {
        const first = cancelRef.current;
        const last = confirmRef.current;
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = previous;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-keep-popover
      data-closing={closing || undefined}
      className="lms-alert-scrim"
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) {
          setClosing(false);
          onClose();
          restoreRef.current?.focus?.();
        }
      }}
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={dismiss} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-message"
        className="lms-alert"
      >
        <span className="lms-alert-icon" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" width={64} height={64} />
        </span>
        <h2 id="logout-title" className="lms-alert-title">
          Log out of Social Work Nigeria?
        </h2>
        <p id="logout-message" className="lms-alert-message">
          Your progress is saved. You’ll need to sign in again to continue learning.
        </p>
        <div className="lms-alert-actions">
          <button ref={cancelRef} type="button" onClick={dismiss} disabled={loading} className="lms-alert-btn">
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={signOut}
            disabled={loading}
            className="lms-alert-btn lms-alert-btn--destructive"
          >
            {loading ? (
              <>
                <IconSpinner className="h-4 w-4 animate-spin" />
                Logging out…
              </>
            ) : (
              "Log Out"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface LogoutButtonProps {
  /** "menu" is a labelled row in a popover menu, "pill" a split button in the
   *  account card; the default is a plain icon button. */
  variant?: "menu" | "pill";
}

export function LogoutButton({ variant }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const buttonClass =
    variant === "pill"
      ? "lms-gpop-pill [&_svg]:h-[17px] [&_svg]:w-[17px]"
      : variant === "menu"
        ? "lms-pop-row !text-[#b42318] hover:!bg-[#b42318]/[0.07] dark:!text-[#fda29b] [&_svg]:h-[17px] [&_svg]:w-[17px]"
        : "lms-icon-btn text-red-600 dark:text-red-400";

  return (
    <>
      {variant === "pill" ? (
        <button type="button" onClick={() => setIsOpen(true)} className={buttonClass}>
          <IconLogout />
          Log out
        </button>
      ) : variant === "menu" ? (
        <button type="button" onClick={() => setIsOpen(true)} className={buttonClass}>
          <span className="lms-pop-tile !bg-[#b42318]/10 !text-inherit">
            <IconLogout />
          </span>
          Log out
        </button>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)} className={buttonClass} title="Log out" aria-label="Log out">
          <IconLogout />
        </button>
      )}
      <LogoutDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
