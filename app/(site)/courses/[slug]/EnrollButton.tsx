"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFree: boolean;
  price?: number;
  hasAccess?: boolean;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  isFree,
  price,
  hasAccess,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("NEW");
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
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
        } catch (e) {
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
    } catch (err: any) {
      setError(err.message);
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Confirm Purchase
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Are you sure you want to proceed? You will be charged{" "}
              <span className="font-bold text-[#2D6A4F] text-lg">
                ₦{price?.toLocaleString() || "..."}
              </span>
            </p>

            {cardsLoading ? (
              <div className="flex justify-center my-8">
                <IconSpinner className="w-6 h-6 animate-spin text-[#2D6A4F]" />
              </div>
            ) : (
              <div className="mb-8 flex flex-col gap-3">
                {savedCards.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Select Payment Method
                    </p>
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCardId === card.id ? "border-[#2D6A4F] bg-[#2D6A4F]/5 dark:bg-[#52b788]/10" : "border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={selectedCardId === card.id}
                          onChange={() => setSelectedCardId(card.id)}
                          className="w-4 h-4 text-[#2D6A4F]"
                        />
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {(card.card_type || card.brand || "Card").trim()}{" "}
                          ending in •••• {card.last4}
                        </span>
                      </label>
                    ))}
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedCardId === "NEW" ? "border-[#2D6A4F] bg-[#2D6A4F]/5 dark:bg-[#52b788]/10" : "border-gray-200 dark:border-gray-800 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedCardId === "NEW"}
                        onChange={() => setSelectedCardId("NEW")}
                        className="w-4 h-4 text-[#2D6A4F]"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Pay with a new card
                      </span>
                    </label>
                  </div>
                )}

                {selectedCardId === "NEW" && (
                  <label className="flex items-start gap-2 cursor-pointer mt-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <input
                      type="checkbox"
                      checked={saveNewCard}
                      onChange={(e) => setSaveNewCard(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Save this card for future 1-click purchases
                    </span>
                  </label>
                )}
              </div>
            )}
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
