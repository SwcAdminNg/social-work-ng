"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Link2 } from "lucide-react";
import { MarkCompleteButton } from "./MarkCompleteButton";

type LinkResourcePanelProps = {
  courseId: string;
  itemId: string;
  title: string;
  url: string;
  label?: string | null;
  description?: string | null;
  isCompleted?: boolean | null;
};

export function LinkResourcePanel({
  courseId,
  itemId,
  title,
  url,
  label,
  description,
  isCompleted,
}: LinkResourcePanelProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayLabel = label || title;

  async function openResource() {
    setError(null);
    window.open(url, "_blank", "noopener,noreferrer");

    if (isCompleted || isMarking) return;

    setIsMarking(true);
    try {
      const res = await fetch(
        `/api/proxy/learning/courses/${courseId}/items/${itemId}/complete`,
        { method: "POST" },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.message || "Unable to update progress.");
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update progress.",
      );
    } finally {
      setIsMarking(false);
    }
  }

  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www./, "");
  } catch {
    // Not a full URL: show it as written.
  }

  return (
    <section className="lms-group">
      <div className="flex items-center gap-3.5 p-4 sm:p-5">
        <span className="lms-sym lms-sym--blue h-11 w-11 rounded-[12px]" aria-hidden="true">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 line-clamp-2 font-[family-name:var(--font-roboto)] text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">
            {displayLabel}
          </h2>
          <p className="m-0 mt-0.5 truncate text-[0.8125rem] text-ink-3">{host}</p>
        </div>
        {isCompleted && (
          <span className="lms-pill lms-pill--green hidden sm:inline-flex">
            <CheckCircle2 aria-hidden="true" />
            Completed
          </span>
        )}
      </div>

      {description && (
        <p className="m-0 px-4 pb-1 text-[0.9375rem] leading-relaxed text-ink-2 sm:px-5">{description}</p>
      )}

      {error && (
        <p className="m-0 mx-4 mt-3 rounded-xl bg-[#c46a12]/10 px-3 py-2 text-sm font-semibold text-[#c46a12] dark:text-[#ffb35c] sm:mx-5">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 p-4 sm:px-5 sm:pb-5">
        <button type="button" onClick={openResource} disabled={isMarking} className="lms-btn lms-btn--sm">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          {isMarking ? "Opening…" : "Open Link"}
        </button>
        {!isCompleted && (
          <MarkCompleteButton courseId={courseId} itemId={itemId} isCompleted={false} />
        )}
      </div>
    </section>
  );
}
