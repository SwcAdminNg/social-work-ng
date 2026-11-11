"use client";

import "@/app/alert.css";
import { useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { formatCardBrand, normalizeCardBrand, type SavedCard } from "@/components/payments/SavedCardDisplay";

export default function PaymentMethodsPanel() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionCardId, setActionCardId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cardToDelete, setCardToDelete] = useState<SavedCard | null>(null);

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

  async function removeCard() {
    if (!cardToDelete) return;

    setActionCardId(cardToDelete.id);
    setError("");

    try {
      const res = await fetch(`/api/proxy/payments/cards/${cardToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Unable to remove saved card.");
      }

      await loadCards();
      setCardToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove saved card.");
    } finally {
      setActionCardId(null);
    }
  }

  const removing = cardToDelete ? actionCardId === cardToDelete.id : false;

  // Escape cancels the remove-card alert, as it does for any Apple alert.
  useEffect(() => {
    if (!cardToDelete) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !removing) setCardToDelete(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cardToDelete, removing]);

  return (
    <section className="lms-settings-section" aria-labelledby="methods-head">
      <h2 id="methods-head" className="lms-settings-head">Payment Methods</h2>
      <div className="lms-group">
        {loading ? (
          <div className="flex h-16 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : error ? (
          <p role="alert" className="m-0 px-4 py-3.5 text-[0.9rem] text-[#d92d20] dark:text-[#ff6961]">
            {error}
          </p>
        ) : cards.length === 0 ? (
          <div className="lms-form-row !gap-3 !py-3">
            <span className="lms-mini-card lms-mini-card--empty" aria-hidden="true">
              <CreditCard className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[0.92rem] font-medium text-ink">No saved cards</p>
              <p className="m-0 text-[0.78rem] text-ink-3">Tick “Save this card” at checkout to pay in one tap next time.</p>
            </div>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {cards.map((card) => {
              const busy = actionCardId === card.id;
              const expiry = card.exp_month && card.exp_year ? `Expires ${String(card.exp_month).padStart(2, "0")}/${String(card.exp_year).slice(-2)}` : null;
              return (
                <li key={card.id} className="lms-form-row !gap-3 !py-2.5">
                  <span className={`lms-mini-card lms-mini-card--${normalizeCardBrand(card)}`} aria-hidden="true">
                    {formatCardBrand(card)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 flex items-center gap-2 text-[0.92rem] font-medium text-ink">
                      <span className="truncate">
                        {formatCardBrand(card)} •••• {card.last4 || "----"}
                      </span>
                      {card.is_default && (
                        <span className="inline-flex flex-none items-center gap-1 text-[0.75rem] font-semibold text-accent">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                          Default
                        </span>
                      )}
                    </p>
                    <p className="m-0 truncate text-[0.78rem] text-ink-3">{[card.bank, expiry].filter(Boolean).join(" · ") || "Saved with Paystack"}</p>
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-ink-3" />
                    ) : (
                      <>
                        {!card.is_default && (
                          <button type="button" onClick={() => setDefault(card.id)} disabled={actionCardId !== null} className="lms-text-btn !text-[0.82rem]">
                            Make Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setCardToDelete(card)}
                          disabled={actionCardId !== null}
                          className="lms-gpop-x !h-8 !w-8 hover:!text-[#d92d20]"
                          aria-label={`Remove ${formatCardBrand(card)} ending in ${card.last4 || ""}`}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="lms-settings-foot">
        <p className="m-0 flex items-start gap-1.5">
          <ShieldCheck className="mt-px h-3.5 w-3.5 flex-none text-accent" aria-hidden="true" />
          Cards are stored securely by Paystack. We only ever see the last four digits.
        </p>
      </div>

      {/* Removing a card asks first, with the same alert as signing out */}
      {cardToDelete && (
        <div className="lms-alert-scrim" data-keep-popover>
          <div className="absolute inset-0" aria-hidden="true" onClick={() => !removing && setCardToDelete(null)} />
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-card-title" aria-describedby="delete-card-message" className="lms-alert">
            <span className="lms-alert-symbol" aria-hidden="true">
              <CreditCard className="h-[24px] w-[24px]" strokeWidth={1.9} />
            </span>
            <h2 id="delete-card-title" className="lms-alert-title">
              Remove {formatCardBrand(cardToDelete)} •••• {cardToDelete.last4 || "----"}?
            </h2>
            <p id="delete-card-message" className="lms-alert-message">
              It will no longer be offered at checkout.
              {cardToDelete.is_default && cards.length > 1 ? " Another saved card will become your default." : ""}
            </p>
            <div className="lms-alert-actions">
              <button type="button" onClick={() => setCardToDelete(null)} disabled={removing} className="lms-alert-btn" autoFocus>
                Cancel
              </button>
              <button type="button" onClick={removeCard} disabled={removing} className="lms-alert-btn lms-alert-btn--destructive">
                {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
