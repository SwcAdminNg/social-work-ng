"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";
import { toast } from "sonner";

export function NewTicketModal({
  isOpen,
  onOpenChange,
  initialSubject = "",
  initialMessage = "",
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialSubject?: string;
  initialMessage?: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSubject(initialSubject);
      setMessage(initialMessage);
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both the subject and your message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to open ticket. Please try again.");
      }

      toast.success("Ticket opened — our team has been notified.");
      onOpenChange(false);
      setSubject(initialSubject);
      setMessage(initialMessage);
      const ticketId = data?.data?.id;
      if (ticketId) {
        router.push(`/dashboard/support-tickets/${ticketId}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSend = Boolean(subject.trim() && message.trim()) && !submitting;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="lms-sheet-scrim" />
        {/* A compose sheet, after Mail: Cancel and Send in the bar, grouped fields below */}
        <Dialog.Content className="lms-sheet" aria-describedby="new-request-help">
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="lms-sheet-bar">
              <Dialog.Close asChild>
                <button type="button" className="lms-text-btn !text-[0.95rem]">
                  Cancel
                </button>
              </Dialog.Close>
              <Dialog.Title className="m-0 text-center text-[1rem] font-semibold text-ink">New Request</Dialog.Title>
              <button type="submit" disabled={!canSend} className="lms-sheet-send">
                {submitting ? <IconSpinner className="h-4 w-4 animate-spin" /> : null}
                Send
              </button>
            </div>

            <div className="lms-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4 sm:px-5">
              <Dialog.Description id="new-request-help" className="m-0 mb-4 px-1 text-[0.86rem] leading-relaxed text-ink-3">
                Tell us what’s going on. Our Support Desk usually replies within minutes, and you can follow the conversation from Support.
              </Dialog.Description>

              <div className="lms-group">
                <label htmlFor="subject" className="flex items-center gap-3 px-4">
                  <span className="w-[4.5rem] flex-none text-[0.92rem] text-ink-3">Subject</span>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. I can’t open a lesson"
                    autoFocus={!initialSubject}
                    className="h-12 min-w-0 flex-1 bg-transparent text-[0.95rem] font-medium text-ink outline-none placeholder:font-normal placeholder:text-ink-3"
                  />
                </label>
                <div className="border-t border-line">
                  <label htmlFor="message" className="sr-only">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the issue. Include the course, what you tried and anything on screen."
                    autoFocus={Boolean(initialSubject)}
                    className="block min-h-[180px] w-full resize-none bg-transparent px-4 py-3 text-[0.95rem] leading-relaxed text-ink outline-none placeholder:text-ink-3"
                  />
                </div>
              </div>
              <p className="m-0 mt-2.5 px-1 text-[0.78rem] text-ink-3">
                Please don’t include passwords or card numbers.
              </p>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
