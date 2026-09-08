"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LIVE_SESSION_RETURN_KEY = "live_session_return_href";

export function rememberLiveSessionReturn(href: string) {
  try {
    window.sessionStorage.setItem(LIVE_SESSION_RETURN_KEY, href);
  } catch {
    // Best-effort only; joining the call should not depend on storage access.
  }
}

export function LiveSessionReturnHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recentCall = searchParams.get("recent-call");

  useEffect(() => {
    if (!recentCall) return;

    let returnHref: string | null = null;
    try {
      returnHref = window.sessionStorage.getItem(LIVE_SESSION_RETURN_KEY);
      window.sessionStorage.removeItem(LIVE_SESSION_RETURN_KEY);
    } catch {
      returnHref = null;
    }

    router.replace(returnHref || "/dashboard/courses");
  }, [recentCall, router]);

  return null;
}
