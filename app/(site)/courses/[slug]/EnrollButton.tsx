"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFree: boolean;
}

export function EnrollButton({ courseId, isEnrolled, isFree }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (isEnrolled) {
    return (
      <button 
        onClick={() => router.push(`/learn/${courseId}`)}
        className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] transition-colors shadow-lg shadow-[#2D6A4F]/20"
      >
        Go to Course
      </button>
    );
  }

  const handleEnroll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy/learning/courses/${courseId}/enroll`, {
        method: "POST",
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?callbackUrl=" + encodeURIComponent(window.location.href));
          return;
        }
        if (res.status === 402) {
          throw new Error("Payment is required for this exclusive course.");
        }
        throw new Error(data.message || "Failed to enroll. Please try again.");
      }
      
      // Success, route to learning portal
      router.push(`/learn/${courseId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button 
        onClick={handleEnroll}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] transition-colors shadow-lg shadow-[#2D6A4F]/20 disabled:opacity-70"
      >
        {loading ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
        {loading ? "Enrolling..." : isFree ? "Enroll for Free" : "Enroll Now"}
      </button>
      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
