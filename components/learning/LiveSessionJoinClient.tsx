"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Video } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import { DailyCallFrame } from "./DailyCallFrame";

type JoinData = {
  room_url: string;
  token: string;
  is_owner?: boolean | null;
  expires_at?: string | null;
};

type LiveSessionJoinClientProps = {
  itemId: string;
  courseSlug: string;
  backHref?: string;
};

export function LiveSessionJoinClient({
  itemId,
  courseSlug,
  backHref = `/courses/${courseSlug}`,
}: LiveSessionJoinClientProps) {
  const [joinData, setJoinData] = useState<JoinData | null>(null);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const join = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/proxy/courses/items/${itemId}/live-session/join`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError({
          status: res.status,
          message: json?.message || "This live session is not available right now.",
        });
        setJoinData(null);
        return;
      }

      setJoinData(json?.data || null);
    } catch {
      setError({ message: "We could not reach the live session service." });
      setJoinData(null);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      join();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [join]);

  if (joinData?.room_url && joinData.token) {
    return (
      <div className="flex h-[100dvh] flex-col bg-[#0b1220] p-3 text-white sm:p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#b7e4c7]">
              Live session
            </p>
            <h1 className="text-lg font-extrabold">Joining classroom</h1>
          </div>
          <Link
            href={backHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-extrabold text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
        </div>
        <div className="min-h-0 flex-1">
          <DailyCallFrame roomUrl={joinData.room_url} token={joinData.token} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-[#f7fcf9] px-4 py-12 dark:bg-[#0b1220]">
      <div className="w-full max-w-md rounded-lg border border-[#dceee4] bg-white p-6 text-center shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
          {loading ? (
            <IconSpinner className="h-6 w-6 animate-spin" />
          ) : error?.status === 403 ? (
            <AlertCircle className="h-6 w-6" />
          ) : (
            <Video className="h-6 w-6" />
          )}
        </span>
        <h1 className="text-lg font-extrabold text-slate-950 dark:text-white">
          {loading
            ? "Preparing your live session"
            : error?.status === 403
              ? "You do not have access"
              : "Live session unavailable"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {loading
            ? "We are creating fresh join credentials for this call."
            : error?.message || "Please try again in a moment."}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {!loading && error?.status !== 403 && (
            <button
              type="button"
              onClick={join}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            >
              Try again
            </button>
          )}
          <Link
            href={backHref}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#b7e4c7] px-4 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}
