"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface SubscriptionButtonProps {
  planId: string;
  price: number;
  isLoggedIn: boolean;
  planName: string;
  isHighlighted?: boolean;
  isCurrentPlan?: boolean;
  isPendingPlan?: boolean;
  hasActiveSubscription?: boolean;
}

export function SubscriptionButton({ 
  planId, price, isLoggedIn, planName, isHighlighted, 
  isCurrentPlan, isPendingPlan, hasActiveSubscription 
}: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSubscribeClick = () => {
    if (!isLoggedIn) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.href));
      return;
    }
    setShowModal(true);
  };

  const executeSubscription = async () => {
    setLoading(true);
    setError("");
    setShowModal(false);
    
    try {
      if (hasActiveSubscription) {
        // Handle Plan Change
        const res = await fetch(`/api/proxy/payments/subscriptions/change-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_plan_id: planId }),
        });
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to change plan.");
        
        // Refresh the page to show the pending plan
        window.location.reload();
        return;
      } else {
        // Handle New Subscription via Paystack
        const initRes = await fetch(`/api/proxy/payments/initialize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_type: "SUBSCRIPTION",
            related_id: planId,
            gateway: "PAYSTACK",
            save_card: false,
          }),
        });
        
        const initData = await initRes.json();
        if (!initRes.ok) throw new Error(initData.message || "Failed to initialize payment.");
        
        if (initData.data?.authorization_url) {
          window.location.href = initData.data.authorization_url;
          return;
        }
        
        throw new Error("Failed to initialize payment. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <button 
          onClick={handleSubscribeClick}
          disabled={loading || isCurrentPlan || isPendingPlan}
          className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-70 ${
            isCurrentPlan 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 shadow-none cursor-not-allowed" 
              : isPendingPlan
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-none cursor-not-allowed"
                : isHighlighted 
                  ? "bg-[#52b788] hover:bg-[#40916c] text-white shadow-[#52b788]/20" 
                  : "bg-[#52b788] hover:bg-[#40916c] text-white shadow-[#52b788]/20"
          }`}
        >
          {loading ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
          {loading 
            ? "Processing..." 
            : isCurrentPlan 
              ? "Current Plan" 
              : isPendingPlan 
                ? "Pending Switch" 
                : hasActiveSubscription 
                  ? "Switch to this Plan" 
                  : "Subscribe Now"}
        </button>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-center">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
            <div className="w-16 h-16 mx-auto bg-[#52b788]/10 text-[#52b788] rounded-full flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {hasActiveSubscription ? "Confirm Plan Change" : "Confirm Subscription"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {hasActiveSubscription ? (
                <>
                  Your plan will securely change to <span className="font-bold text-gray-900 dark:text-white">{planName}</span> at the end of your current billing cycle. You will be charged <span className="font-bold text-[#52b788]">₦{price.toLocaleString()}</span> upon renewal.
                </>
              ) : (
                <>
                  You are subscribing to the <span className="font-bold text-gray-900 dark:text-white">{planName}</span> plan. You will be charged <span className="font-bold text-[#52b788] text-xl block mt-2">₦{price.toLocaleString()}</span>
                </>
              )}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeSubscription}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#52b788] hover:bg-[#40916c] transition-colors shadow-md shadow-[#52b788]/20 flex items-center justify-center"
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
