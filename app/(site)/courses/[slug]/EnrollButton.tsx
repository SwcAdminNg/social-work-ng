"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";
import { PaymentMethodSelector } from "@/components/payments/PaymentMethodSelector";
import { SavedCard } from "@/components/payments/SavedCardDisplay";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFree: boolean;
  price?: number;
  hasAccess?: boolean;
  isCompleted?: boolean;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  isFree,
  price,
  hasAccess,
  isCompleted,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("NEW");
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const router = useRouter();

  if (isEnrolled || hasAccess || isCompleted) {
    return (
      <button
        onClick={() => router.push(`/learn/${courseId}`)}
        className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-[#52b788] dark:hover:bg-[#40916c] transition-colors shadow-lg shadow-[#2D6A4F]/20"
      >
        View Course
      </button>
    );
  }

  const handleEnrollClick = async () => {
    if (isFree || hasAccess) {
      executeEnrollment();
    } else {
      setShowModal(true);
      if (savedCards.length === 0) {
        setCardsLoading(true);
        try {
          const res = await fetch("/api/proxy/payments/cards");
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.data?.length > 0) {
            setSavedCards(data.data);
            setSelectedCardId(data.data[0].id);
          }
        } catch {
          // ignore
        } finally {
          setCardsLoading(false);
        }
      }
    }
  };

  const executeEnrollment = async () => {
    setLoading(true);
    setError("");
    setShowModal(false);

    try {
      const res = await fetch(
        `/api/proxy/learning/courses/${courseId}/enroll`,
        {
          method: "POST",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          router.push(
            "/login?callbackUrl=" + encodeURIComponent(window.location.href),
          );
          return;
        }

        if (res.status === 402) {
          if (selectedCardId && selectedCardId !== "NEW") {
            const chargeRes = await fetch(`/api/proxy/payments/charge-card`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                card_id: selectedCardId,
                transaction_type: "COURSE_PURCHASE",
                related_id: courseId,
              }),
            });
            const chargeData = await chargeRes.json().catch(() => ({}));
            if (!chargeRes.ok)
              throw new Error(
                chargeData.message || "Failed to charge saved card.",
              );
            if (chargeData.data?.status && chargeData.data.status !== "SUCCESS") {
              throw new Error(
                chargeData.message ||
                  "The saved card could not be charged. Please try another card.",
              );
            }

            router.push(`/learn/${courseId}`);
            return;
          } else {
            const initRes = await fetch(`/api/proxy/payments/initialize`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transaction_type: "COURSE_PURCHASE",
                related_id: courseId,
                gateway: "PAYSTACK",
                save_card: saveNewCard,
              }),
            });

            const initData = await initRes.json().catch(() => ({}));
            if (!initRes.ok)
              throw new Error(
                initData.message || "Failed to initialize payment.",
              );

            if (initData.data?.authorization_url) {
              window.location.href = initData.data.authorization_url;
              return;
            }
          }
        }

        throw new Error(data.message || "Failed to enroll. Please try again.");
      }

      router.push(`/learn/${courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll.");
      setLoading(false);
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
          {loading
            ? "Processing..."
            : isFree
              ? "Enroll for Free"
              : hasAccess
                ? "Enroll Now"
                : `Buy for ₦${price?.toLocaleString() || "..."}`}
        </button>
        {error && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>

      {showModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border border-gray-100 bg-white p-4 shadow-2xl transition-all dark:border-gray-800 dark:bg-gray-950 sm:max-w-xl sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-[#2D6A4F] dark:text-[#95d5b2]">
                  Secure checkout
                </p>
                <h3 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
                  Choose how to pay
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Complete your course purchase for{" "}
                  <span className="font-extrabold text-gray-900 dark:text-white">
                    ₦{price?.toLocaleString() || "..."}
                  </span>
                  .
                </p>
              </div>
              <div className="rounded-lg bg-[#f1fbf6] px-4 py-3 text-left dark:bg-[#10261c] sm:text-right">
                <p className="text-xs font-bold uppercase text-[#2D6A4F] dark:text-[#95d5b2]">
                  Total
                </p>
                <p className="text-xl font-black text-[#173f2d] dark:text-[#d8f3dc]">
                  ₦{price?.toLocaleString() || "..."}
                </p>
              </div>
            </div>

            {cardsLoading ? (
              <div className="flex justify-center my-8">
                <IconSpinner className="w-6 h-6 animate-spin text-[#2D6A4F]" />
              </div>
            ) : (
              <div className="mb-6">
                <PaymentMethodSelector
                  cards={savedCards}
                  selectedCardId={selectedCardId}
                  saveNewCard={saveNewCard}
                  onSelectCard={setSelectedCardId}
                  onSaveNewCardChange={setSaveNewCard}
                />
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-md font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={executeEnrollment}
                disabled={loading || cardsLoading}
                className="flex-1 py-3 px-4 rounded-md font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] transition-colors shadow-md shadow-[#2D6A4F]/20 disabled:opacity-60"
              >
                {loading ? "Processing..." : "Pay now"}
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
