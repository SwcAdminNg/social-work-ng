"use client";

import { useState } from "react";
import { IconSpinner } from "@/components/auth/shared/icons";

export interface CurrentSubscription {
  id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
  pending_plan_id: string | null;
  plan: {
    id: string;
    name: string;
    price: number;
    duration_days: number;
  };
}

interface ActiveSubscriptionBannerProps {
  subscription: CurrentSubscription;
  allPlans: any[];
}

export function ActiveSubscriptionBanner({ subscription, allPlans }: ActiveSubscriptionBannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [autoRenew, setAutoRenew] = useState(subscription.auto_renew);
  
  const pendingPlan = subscription.pending_plan_id 
    ? allPlans.find(p => p.id === subscription.pending_plan_id) 
    : null;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription auto-renewal? You will keep access until the end of your billing cycle.")) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/proxy/payments/subscriptions/cancel`, {
        method: "POST",
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel subscription. Please try again.");
      }
      
      setAutoRenew(false);
      setSuccessMsg(data.message || "Subscription cancelled successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const endDate = new Date(subscription.end_date).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-lg mb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Plan: {subscription.plan.name}</h2>
            {autoRenew ? (
              <span className="px-3 py-1 text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                ACTIVE
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                CANCELLING
              </span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {autoRenew 
              ? `Your plan will automatically renew on ${endDate}.` 
              : `You have access until ${endDate}. Your plan will not auto-renew.`}
          </p>

          {pendingPlan && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                <span className="font-bold">Pending Change:</span> Your plan will automatically switch to <span className="font-bold">{pendingPlan.name}</span> at the end of the current billing cycle.
              </p>
            </div>
          )}

          {error && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          {successMsg && <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">{successMsg}</p>}
        </div>

        {autoRenew && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-800 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? <IconSpinner className="w-5 h-5 animate-spin mr-2" /> : null}
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}
