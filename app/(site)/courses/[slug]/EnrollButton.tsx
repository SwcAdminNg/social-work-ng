"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFree: boolean;
  price?: number;
}

export function EnrollButton({ courseId, isEnrolled, isFree, price }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
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

  const handleEnrollClick = () => {
    if (isFree) {
      executeEnrollment();
    } else {
      setShowModal(true);
    }
  };

  const executeEnrollment = async () => {
    setLoading(true);
    setError("");
    setShowModal(false);
    
    try {
      // Step 1: Always try to enroll first. The backend handles subscription verification.
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
          // Step 2: Payment is strictly required (no active subscription or course is exclusive). Initialize Paystack.
          const initRes = await fetch(`/api/proxy/payments/initialize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transaction_type: "COURSE_PURCHASE",
              related_id: courseId,
              gateway: "PAYSTACK",
              save_card: false,
            }),
          });
          
          const initData = await initRes.json();
          if (!initRes.ok) throw new Error(initData.message || "Failed to initialize payment.");
          
          // Redirect to Paystack
          if (initData.data?.authorization_url) {
            window.location.href = initData.data.authorization_url;
            return;
          }
        }
        
        throw new Error(data.message || "Failed to enroll. Please try again.");
      }
      
      // Success, route to learning portal
      router.push(`/learn/${courseId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Only set loading false if we didn't redirect
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleEnrollClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] transition-colors shadow-lg shadow-[#2D6A4F]/20 disabled:opacity-70"
        >
          {loading ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
          {loading ? "Processing..." : isFree ? "Enroll for Free" : "Enroll Now"}
        </button>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Confirm Purchase</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to proceed? You will be charged <span className="font-bold text-gray-900 dark:text-white text-lg">₦{price?.toLocaleString() || "..."}</span> for this course unless you have an active subscription that covers it.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeEnrollment}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] transition-colors shadow-md shadow-[#2D6A4F]/20"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
