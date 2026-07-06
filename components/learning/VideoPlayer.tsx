"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

interface VideoPlayerProps {
  url: string;
  courseId: string;
  itemId: string;
  isCompleted: boolean;
}

export function VideoPlayer({ url, courseId, itemId, isCompleted }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Prevent video reload when backend generates new tokens for the same video
  const [activeUrl, setActiveUrl] = useState(url);
  const prevBaseUrl = useRef(url.split("?")[0]);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return <div className="aspect-video bg-gray-900 w-full animate-pulse flex items-center justify-center text-gray-500">Loading player...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 relative">
        {activeUrl.includes("iframe.mediadelivery.net") || activeUrl.includes("youtube.com/embed") || activeUrl.includes("vimeo.com/video") ? (
          <iframe 
            src={activeUrl}
            className="w-full h-full absolute top-0 left-0 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <HlsVideoPlayer
            url={activeUrl}
            onEnded={!isCompleted ? markComplete : undefined}
          />
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 p-6 text-center">
            <p className="text-red-500 font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Learning Progress</h3>
          <p className="text-sm text-gray-500">
            {isCompleted ? "You have completed this video." : "Watch the full video to automatically mark it as complete, or click the button."}
          </p>
        </div>
        <button
          onClick={markComplete}
          disabled={isCompleted || marking}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-sm transition-colors ${
            isCompleted 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed" 
              : "bg-[#2D6A4F] hover:bg-[#1B4332] text-white shadow-[#2D6A4F]/20"
          }`}
        >
          {marking ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
          {isCompleted ? "✓ Completed" : marking ? "Marking..." : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}
