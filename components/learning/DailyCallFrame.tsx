"use client";

import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { useEffect, useRef, useState } from "react";
import { Video } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";

type DailyCallFrameProps = {
  roomUrl: string;
  token: string;
  onLeft?: () => void;
};

export function DailyCallFrame({ roomUrl, token, onLeft }: DailyCallFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function joinCall() {
      if (!containerRef.current) return;

      setJoining(true);
      setError(null);

      const callFrame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
        },
      });

      callRef.current = callFrame;
      callFrame.on("left-meeting", () => onLeft?.());

      try {
        await callFrame.join({ url: roomUrl, token });
      } catch {
        if (!cancelled) {
          setError("We could not connect to the live session. Please try joining again.");
        }
      } finally {
        if (!cancelled) {
          setJoining(false);
        }
      }
    }

    joinCall();

    return () => {
      cancelled = true;
      const call = callRef.current;
      callRef.current = null;
      call?.destroy();
    };
  }, [onLeft, roomUrl, token]);

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden rounded-lg bg-slate-950">
      <div ref={containerRef} className="absolute inset-0" />
      {(joining || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-center text-white">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
            {joining ? (
              <IconSpinner className="h-6 w-6 animate-spin" />
            ) : (
              <Video className="h-6 w-6" />
            )}
          </span>
          <p className="text-sm font-extrabold">
            {joining ? "Joining live session..." : "Unable to join"}
          </p>
          {error && <p className="mt-2 max-w-sm text-sm text-slate-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
