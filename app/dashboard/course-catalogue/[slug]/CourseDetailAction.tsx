"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

type CourseDetailActionProps = {
  courseId: string;
  slug: string;
  isFree: boolean;
  price?: number | null;
  isEnrolled: boolean;
  hasAccess: boolean;
};

export function CourseDetailAction({
  courseId,
  slug,
  isFree,
  price,
  isEnrolled,
  hasAccess,
}: CourseDetailActionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canViewCourse = isEnrolled || hasAccess;

  async function handleAction() {
    if (canViewCourse) {
      router.push(`/learn/${courseId}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const enrollRes = await fetch(`/api/proxy/learning/courses/${courseId}/enroll`, {
        method: "POST",
      });
      const enrollData = await enrollRes.json().catch(() => ({}));

      if (enrollRes.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/dashboard/course-catalogue/${slug}`)}`,
        );
        return;
      }

      if (enrollRes.ok || isFree) {
        router.push(`/learn/${courseId}`);
        return;
      }

      if (enrollRes.status !== 402) {
        throw new Error(enrollData?.message || "Unable to enroll right now.");
      }

      const paymentRes = await fetch("/api/proxy/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_type: "COURSE_PURCHASE",
          related_id: courseId,
          gateway: "PAYSTACK",
          save_card: false,
        }),
      });
      const paymentData = await paymentRes.json().catch(() => ({}));

      if (!paymentRes.ok || !paymentData?.data?.authorization_url) {
        throw new Error(paymentData?.message || "Unable to initialize payment.");
      }

      window.location.href = paymentData.data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleAction}
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-5 text-sm font-extrabold text-white shadow-[0_16px_32px_-20px_rgba(45,106,79,0.95)] transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {loading ? "Processing..." : canViewCourse ? "View Course" : "Enroll"}
      </button>
      {!canViewCourse && !isFree && typeof price === "number" && (
        <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
          Secure checkout for paid enrollment.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
