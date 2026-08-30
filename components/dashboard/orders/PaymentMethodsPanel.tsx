"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  formatCardBrand,
  SavedCard,
  SavedCardDisplay,
} from "@/components/payments/SavedCardDisplay";

export default function PaymentMethodsPanel() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCardId, setActionCardId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showCards, setShowCards] = useState(false);

  async function loadCards() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/proxy/payments/cards", {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Unable to load saved cards.");
      }

      setCards(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load saved cards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Initial client refresh keeps this panel in sync after Paystack redirects.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCards();
  }, []);

  async function setDefault(cardId: string) {
    setActionCardId(cardId);
    setError("");

    try {
      const res = await fetch(`/api/proxy/payments/cards/${cardId}/default`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Unable to update default card.");
      }

      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update default card.");
    } finally {
      setActionCardId(null);
    }
  }

  async function removeCard(cardId: string) {
    const confirmed = window.confirm("Remove this saved card?");
    if (!confirmed) return;

    setActionCardId(cardId);
    setError("");

    try {
      const res = await fetch(`/api/proxy/payments/cards/${cardId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Unable to remove saved card.");
      }

      await loadCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove saved card.");
    } finally {
      setActionCardId(null);
    }
  }

  const defaultCard = cards.find((card) => card.is_default) || cards[0];
  const cardCountLabel =
    cards.length === 1 ? "1 saved card" : `${cards.length} saved cards`;

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#2D6A4F] text-white shadow-sm dark:bg-[#52b788] dark:text-[#06130d]">
              <WalletCards className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-gray-950 dark:text-white">
                Payment methods
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                Saved cards are hidden by default and available for one-click payments.
              </p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#b7e4c7] bg-[#f1fbf6] px-3 py-2 text-xs font-extrabold text-[#2D6A4F] dark:border-[#2f6f55] dark:bg-[#10261c] dark:text-[#95d5b2]">
            <ShieldCheck className="h-4 w-4" />
            Tokenized by Paystack
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex min-h-[110px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#2D6A4F] dark:text-[#52b788]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-900/40 sm:flex-row sm:items-center sm:text-left">
            <span className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#2D6A4F] shadow-sm dark:bg-gray-950 dark:text-[#52b788] sm:mx-0">
              <CreditCard className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-base font-black text-gray-950 dark:text-white">
                No saved cards yet
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Cards appear here after a successful Paystack checkout where card saving is enabled.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-5">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/45 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-white text-[#2D6A4F] shadow-sm dark:bg-gray-950 dark:text-[#52b788]">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-black text-gray-950 dark:text-white">
                      {cardCountLabel}
                    </p>
                    {defaultCard && (
                      <span className="rounded-md bg-[#d8f3dc] px-2 py-1 text-[0.68rem] font-black uppercase text-[#1B4332] dark:bg-[#173326] dark:text-[#b7e4c7]">
                        Default: {formatCardBrand(defaultCard)} ••••{" "}
                        {defaultCard.last4 || "----"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Card details stay private until you choose to view and manage them.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCards((current) => !current)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
                aria-expanded={showCards}
              >
                {showCards ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showCards ? "Hide cards" : "View cards"}
                <ChevronDown
                  className={`h-4 w-4 transition ${showCards ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {showCards && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <SavedCardDisplay
                    key={card.id}
                    card={card}
                    disabled={actionCardId !== null}
                    actionLoading={actionCardId === card.id}
                    onSetDefault={() => setDefault(card.id)}
                    onDelete={() => removeCard(card.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
