"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type DocumentDownloadButtonProps = {
  courseId: string;
  itemId: string;
};

export function DocumentDownloadButton({
  courseId,
  itemId,
}: DocumentDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/proxy/courses/${courseId}/items/${itemId}/download`,
      );
      const json = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setError("This handout is view-only.");
        return;
      }

      if (!res.ok || !json?.download_url) {
        setError(json?.message || "Download is not available right now.");
        return;
      }

      window.open(json.download_url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Download is not available right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="lms-btn lms-btn--sm lms-btn--tinted disabled:cursor-wait"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Preparing…" : "Download"}
      </button>
      {error && (
        <p className="m-0 max-w-52 text-xs font-semibold text-[#c46a12] dark:text-[#ffb35c]">
          {error}
        </p>
      )}
    </div>
  );
}
