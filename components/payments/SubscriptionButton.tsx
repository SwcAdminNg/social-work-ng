"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface SubscriptionButtonProps {
  planId: string;
  price: number;
  isLoggedIn: boolean;
  planName: string;
}

export function SubscriptionButton({ planId, price, isLoggedIn, planName }: SubscriptionButtonProps) {
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
      const initRes = await fetch(`/api/proxy/payments/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_type: "SUBSCRIPTION",
          related_id: planId,
          gateway: "PAYSTACK",
          save_card: false, // Could be changed to true if they want 1-click checkout later
        }),
      });
      
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.message || "Failed to initialize payment.");
      
      // Redirect to Paystack
      if (initData.data?.authorization_url) {
        window.location.href = initData.data.authorization_url;
        return;
      }
      
      throw new Error("Failed to initialize payment. Please try again.");
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Only set loading false if we didn't redirect
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <button 
          onClick={handleSubscribeClick}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] transition-colors shadow-lg shadow-[#2D6A4F]/20 disabled:opacity-70"
        >
          {loading ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
          {loading ? "Processing..." : "Subscribe Now"}
        </button>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Confirm Subscription</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              You are subscribing to the <span className="font-bold text-gray-900 dark:text-white">{planName}</span> plan. You will be charged <span className="font-bold text-gray-900 dark:text-white text-lg">₦{price.toLocaleString()}</span>. Proceed to checkout?
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
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] transition-colors shadow-md shadow-[#2D6A4F]/20 flex items-center justify-center"
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
