"use client";

import { CreditCard, Plus } from "lucide-react";
import {
  SavedCard,
  SavedCardDisplay,
} from "@/components/payments/SavedCardDisplay";

type PaymentMethodSelectorProps = {
  cards: SavedCard[];
  selectedCardId: string;
  saveNewCard: boolean;
  onSelectCard: (cardId: string) => void;
  onSaveNewCardChange: (save: boolean) => void;
  accentClassName?: string;
};

export function PaymentMethodSelector({
  cards,
  selectedCardId,
  saveNewCard,
  onSelectCard,
  onSaveNewCardChange,
  accentClassName = "text-[#2D6A4F] dark:text-[#52b788]",
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-4 text-left">
      {cards.length > 0 && (
        <div className="grid gap-3">
          <p className="text-sm font-extrabold text-gray-800 dark:text-gray-100">
            Saved cards
          </p>
          <div className="grid max-h-[48vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {cards.map((card) => (
              <SavedCardDisplay
                key={card.id}
                card={card}
                compact
                interactive
                selected={selectedCardId === card.id}
                onSelect={() => onSelectCard(card.id)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onSelectCard("NEW")}
        className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
          selectedCardId === "NEW"
            ? "border-[#52b788] bg-[#f1fbf6] dark:border-[#52b788] dark:bg-[#10261c]"
            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
        }`}
      >
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md ${
            selectedCardId === "NEW"
              ? "bg-[#d8f3dc] text-[#2D6A4F] dark:bg-[#173326] dark:text-[#95d5b2]"
              : "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          <Plus className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold text-gray-900 dark:text-white">
            Pay with a new card
          </span>
          <span className="mt-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Secure checkout powered by Paystack
          </span>
        </span>
        <span
          className={`h-4 w-4 rounded-full border ${
            selectedCardId === "NEW"
              ? "border-[#2D6A4F] bg-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 dark:border-[#52b788] dark:bg-[#52b788]"
              : "border-gray-300 dark:border-gray-700"
          }`}
        />
      </button>

      {selectedCardId === "NEW" && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/60">
          <input
            type="checkbox"
            checked={saveNewCard}
            onChange={(event) => onSaveNewCardChange(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
              <CreditCard className={`h-4 w-4 ${accentClassName}`} />
              Save this card
            </span>
            <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
              Use it later for one-click course payments and renewals.
            </span>
          </span>
        </label>
      )}
    </div>
  );
}
