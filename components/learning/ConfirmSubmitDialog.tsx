"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { useRef, type ReactNode } from "react";

interface ConfirmSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  /** e.g. "Submit your quiz?" */
  title: string;
  /** Anything specific the learner should weigh up first, e.g. unanswered questions. */
  children?: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
}

/**
 * Last checkpoint before an irreversible submission. Cancel is the default focus so
 * a stray Enter keypress never submits; confirm is explicit.
 */
export function ConfirmSubmitDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  children,
  confirmLabel = "Yes, submit",
  busy = false,
}: ConfirmSubmitDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" />
        <Dialog.Content
          role="alertdialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-6 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.05] outline-none dark:bg-[#14171f] dark:ring-white/10"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </span>

          <Dialog.Title className="mt-4 text-[1.1875rem] font-semibold tracking-[-0.01em] text-slate-950 dark:text-white">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[0.9375rem] leading-6 text-slate-600 dark:text-slate-300">
            Are you sure? Once you submit, this <strong className="font-semibold">can&apos;t be reversed</strong>.
          </Dialog.Description>

          {children && (
            <div className="mt-3 rounded-xl bg-black/[0.04] px-3.5 py-2.5 text-left text-sm leading-5 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
              {children}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                ref={cancelRef}
                disabled={busy}
                className="h-11 rounded-xl bg-black/[0.06] text-[0.9375rem] font-semibold text-slate-800 transition-[background-color,transform] duration-100 hover:bg-black/[0.09] active:scale-[0.98] disabled:opacity-60 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
              >
                Go back
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className="h-11 rounded-xl bg-[#2D6A4F] text-[0.9375rem] font-semibold text-white transition-[background-color,transform] duration-100 hover:bg-[#245c43] active:scale-[0.98] disabled:opacity-60 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
