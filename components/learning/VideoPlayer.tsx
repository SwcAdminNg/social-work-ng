"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface VideoPlayerProps {
  url: string;
  courseId: string;
  itemId: string;
  isCompleted: boolean;
}

/** The lesson video on a black stage, with a slim completion bar beneath it. */
export function VideoPlayer({ url, courseId, itemId, isCompleted }: VideoPlayerProps) {
  const [marking, setMarking] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);
  const prevBaseUrl = useRef(url.split("?")[0]);
  const router = useRouter();

  useEffect(() => {
    const currentBaseUrl = url.split("?")[0];
    if (currentBaseUrl !== prevBaseUrl.current) {
      prevBaseUrl.current = currentBaseUrl;
      setActiveUrl(url);
    }
  }, [url]);

  const markComplete = async () => {
    setMarking(true);
    try {
      await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/complete`, { method: "POST" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-black">
      <div className="relative flex aspect-video max-h-[68dvh] w-full items-center justify-center overflow-hidden bg-black">
        {activeUrl.includes("iframe.mediadelivery.net") ||
        activeUrl.includes("youtube.com/embed") ||
        activeUrl.includes("vimeo.com/video") ? (
          <iframe
            src={activeUrl}
            title="Lesson video"
            className="absolute left-0 top-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <HlsVideoPlayer
            url={activeUrl}
            onEnded={!isCompleted ? markComplete : undefined}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 bg-[#161817] px-4 py-2.5 text-white">
        <p className="m-0 flex min-w-0 items-center gap-2 text-[0.8125rem] text-white/70">
          {isCompleted ? (
            <>
              <span className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#30d158] text-black">
                <Check className="h-3 w-3" strokeWidth={3.4} aria-hidden="true" />
              </span>
              <span className="font-semibold text-white">Watched</span>
            </>
          ) : (
            <span className="truncate">Marked complete when the video ends</span>
          )}
        </p>
        {!isCompleted && (
          <button
            type="button"
            onClick={markComplete}
            disabled={marking}
            className="inline-flex h-8 flex-none cursor-pointer items-center gap-1.5 rounded-full bg-white/15 px-3.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-white/25 disabled:cursor-wait disabled:opacity-70"
          >
            {marking && <IconSpinner className="h-3.5 w-3.5 animate-spin" />}
            {marking ? "Saving…" : "Mark as Watched"}
          </button>
        )}
      </div>
    </div>
  );
}
