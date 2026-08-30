"use client";

import { ResourceAttachment } from "@/lib/resources";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

type ResourceDocumentAttachmentProps = {
  attachment: ResourceAttachment;
  slug: string;
  canAccess: boolean;
};

export function ResourceDocumentAttachment({
  attachment,
  slug,
  canAccess,
}: ResourceDocumentAttachmentProps) {
  const [viewerUrl, setViewerUrl] = useState(getDocumentUrl(attachment));
  const [isViewing, setIsViewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadable = canAccess && attachment.document?.downloadable === true;
  const canFetchSignedUrl = canAccess && downloadable;
  const canView = Boolean(viewerUrl || canFetchSignedUrl);

  async function fetchAttachmentUrl() {
    const res = await fetch(
      `/api/proxy/resources/${slug}/attachments/${attachment.id}/download`,
    );
    const json = await res.json().catch(() => ({}));

    if (res.status === 403) {
      throw new Error("This file is locked or view-only.");
    }

    if (!res.ok || !json?.download_url) {
      throw new Error(json?.message || "This file is not available right now.");
    }

    return json.download_url as string;
  }

  async function handleView() {
    setError(null);
    setIsViewing(true);

    try {
      const nextUrl = viewerUrl || (await fetchAttachmentUrl());
      setViewerUrl(nextUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "This file is not available right now.",
      );
    } finally {
      setIsViewing(false);
    }
  }

  async function handleDownload() {
    setError(null);
    setIsDownloading(true);

    try {
      const downloadUrl = await fetchAttachmentUrl();
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Download is not available right now.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
              {attachment.title || attachment.document?.file_name || "Document"}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {[attachment.document?.file_name, formatFileSize(attachment.document?.file_size_bytes)]
                .filter(Boolean)
                .join(" · ") || "Document attachment"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            {canView && (
              <button
                type="button"
                onClick={handleView}
                disabled={isViewing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-3 text-sm font-extrabold text-white transition hover:bg-[#1B4332] disabled:cursor-wait disabled:opacity-70 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                {isViewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                View
              </button>
            )}

            {downloadable && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#b7e4c7] px-3 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#f0fbf5] disabled:cursor-wait disabled:opacity-70 dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </button>
            )}
          </div>

          {!canView && (
            <p className="max-w-72 text-xs font-semibold text-slate-500 dark:text-slate-400">
              A viewer link is not available for this document.
            </p>
          )}
          {error && (
            <p className="max-w-72 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {error}
            </p>
          )}
        </div>
      </div>

      {viewerUrl && (
        <div className="h-[70dvh] min-h-[520px] border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-[#0b1220]">
          <iframe
            src={getViewerSrc(viewerUrl)}
            title={attachment.title || attachment.document?.file_name || "Document viewer"}
            className="h-full w-full border-0 bg-white"
          />
        </div>
      )}
    </article>
  );
}

function getDocumentUrl(attachment: ResourceAttachment) {
  return (
    attachment.document?.view_url ||
    attachment.document?.preview_url ||
    attachment.document?.file_url ||
    attachment.document?.content_url ||
    attachment.document?.url ||
    null
  );
}

function getViewerSrc(url: string) {
  const cleanUrl = url.split("?")[0]?.toLowerCase() || url.toLowerCase();
  if (cleanUrl.endsWith(".pdf")) return url;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
