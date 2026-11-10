"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconLogout } from "./icons";
import { IconSpinner } from "@/components/auth/shared/icons";

interface LogoutButtonProps {
  /** "side" sits in the sidebar account row, "menu" is a labelled row in a
   *  popover menu; the default is a plain icon button. */
  variant?: "side" | "menu";
}

export function LogoutButton({ variant }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    setLoading(true);
    window.location.assign("/logout");
  };

  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!loading) setIsOpen(false);
        return;
      }
      if (event.key === "Tab") {
        const first = cancelButtonRef.current;
        const last = confirmButtonRef.current;
        if (!first || !last) return;
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading]);

  const buttonClass =
    variant === "side"
      ? "lms-side-btn hover:!bg-[#b42318]/10 hover:!text-[#b42318] dark:hover:!text-[#fda29b] [&>svg]:h-[18px] [&>svg]:w-[18px]"
      : variant === "menu"
        ? "lms-pop-row !text-[#b42318] hover:!bg-[#b42318]/[0.07] dark:!text-[#fda29b] [&_svg]:h-[17px] [&_svg]:w-[17px]"
        : "lms-icon-btn text-red-600 dark:text-red-400";

  const modalContent = (
    <div data-keep-popover className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="absolute inset-0" onClick={() => !loading && setIsOpen(false)} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="relative bg-white dark:bg-gray-900 rounded-[28px] shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800"
      >
        <div className="p-6 text-center pt-8">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-5 [&>svg]:w-8 [&>svg]:h-8">
            <IconLogout />
          </div>
          <h3 id="logout-title" className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Sign Out</h3>
          <p className="text-[0.9rem] text-gray-500 dark:text-gray-400 leading-relaxed">
            Are you sure you want to sign out? You will need to log back in to access your dashboard.
          </p>
        </div>
        <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-2">
          <button
            ref={cancelButtonRef}
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 rounded-full transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            {loading ? (
              <>
                <IconSpinner className="w-4 h-4 animate-spin text-white/80" />
                Signing out...
              </>
            ) : (
              "Yes, sign out"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "menu" ? (
        <button type="button" onClick={() => setIsOpen(true)} className={buttonClass}>
          <span className="lms-pop-tile !bg-[#b42318]/10 !text-inherit">
            <IconLogout />
          </span>
          Sign out
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={buttonClass}
          title="Sign out"
          aria-label="Sign out"
        >
          <IconLogout />
        </button>
      )}

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(modalContent, document.body)}
    </>
  );
}
