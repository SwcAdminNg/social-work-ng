"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

type ReceiptDownloadButtonProps = {
  reference: string;
  /** "button" is the filled action on the order page; "link" is the small inline one. */
  variant?: "link" | "button";
};

export function ReceiptDownloadButton({ reference, variant = "link" }: ReceiptDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/proxy/payments/transactions/${encodeURIComponent(reference)}/receipt`,
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Receipt is not available right now.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = getReceiptFilename(res.headers, reference);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Receipt is not available right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <span className={variant === "button" ? "flex flex-col gap-1.5 sm:flex-1" : "inline-flex flex-col gap-0.5"}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={isLoading}
        className={variant === "button" ? "lms-btn w-full" : "lms-text-btn !min-h-7 !text-[0.82rem] !font-semibold"}
      >
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {isLoading ? "Preparing receipt…" : "Download Receipt"}
      </button>
      {error && (
        <span role="alert" className="text-[0.75rem] text-[#d92d20] dark:text-[#ff6961]">
          {error}
        </span>
      )}
    </span>
  );
}

function getReceiptFilename(headers: Headers, reference: string) {
  const contentDisposition = headers.get("content-disposition");
  const filename = contentDisposition?.match(/filename="?([^"]+)"?/i)?.[1];

  return filename || `Receipt-${reference}.pdf`;
}
