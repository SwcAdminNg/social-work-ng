"use client";

import { Download } from "lucide-react";
import { useState } from "react";

type ResourceDownloadButtonProps = {
  slug: string;
  attachmentId: string;
};

export function ResourceDownloadButton({
  slug,
  attachmentId,
}: ResourceDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/proxy/resources/${slug}/attachments/${attachmentId}/download`,
      );
      const json = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setError("This file is locked or view-only.");
        return;
      }

      const downloadUrl = json?.download_url || json?.data?.download_url;

      if (!res.ok) {
        setError(json?.message || "Download is not available right now.");
        return;
      }

      if (!downloadUrl) {
        setError("Download is not available right now.");
        return;
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.rel = "noopener noreferrer";
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Download is not available right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-transparent px-5 text-[0.95rem] font-semibold text-ink transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-70"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Preparing..." : "Download"}
      </button>
      {error && (
        <p className="m-0 max-w-60 text-xs font-semibold text-clay-ink">
          {error}
        </p>
      )}
    </div>
  );
}
