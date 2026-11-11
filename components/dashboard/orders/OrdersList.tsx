"use client";

import { ChevronLeft, ChevronRight, Repeat, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatNaira } from "@/lib/paymentTax";

type Transaction = {
  id: string;
  amount: number;
  reference: string;
  gateway: string;
  status: string;
  transaction_type: string;
  created_at: string;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  tax_rate?: number | null;
  tax_amount?: number | null;
};

export default function OrdersList({
  initialData,
  totalItems,
  currentPage,
  limit,
  error,
}: {
  initialData: Transaction[];
  totalItems: number;
  currentPage: number;
  limit: number;
  error: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const months: { key: string; label: string; items: Transaction[] }[] = [];
  for (const txn of initialData ?? []) {
    const date = new Date(txn.created_at);
    const key = Number.isNaN(date.getTime()) ? "unknown" : MONTH_KEY.format(date);
    const label = Number.isNaN(date.getTime()) ? "Undated" : MONTH_LABEL.format(date);
    const last = months[months.length - 1];
    if (last?.key === key) last.items.push(txn);
    else months.push({ key, label, items: [txn] });
  }

  const totalPages = Math.max(1, Math.ceil((totalItems || initialData?.length || 0) / limit));
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <section className="lms-settings-section" aria-labelledby="history-head">
      <h2 id="history-head" className="lms-settings-head">Purchase History</h2>

      {error ? (
        <p role="alert" className="m-0 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          {error}
        </p>
      ) : months.length === 0 ? (
        <div className="lms-group flex flex-col items-center px-6 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--lms-milk)] text-accent">
            <ShoppingBag className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <h3 className="m-0 mt-4 text-[1.02rem] font-semibold text-ink">No purchases yet</h3>
          <p className="m-0 mt-1.5 max-w-sm text-[0.88rem] leading-relaxed text-ink-3">
            Course purchases and their receipts will be listed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {months.map((month) => (
            <div key={month.key}>
              <p className="m-0 mb-1.5 px-4 text-[0.85rem] font-semibold text-ink-2">{month.label}</p>
              <ul className="lms-group m-0 list-none p-0">
                {month.items.map((txn) => {
                  const status = statusInfo(txn.status);
                  const subscription = txn.transaction_type?.toUpperCase().includes("SUBSCRIPTION");
                  return (
                    <li key={txn.id}>
                      <Link href={`/dashboard/orders/${encodeURIComponent(txn.reference)}`} className="lms-form-row lms-order-row !items-start !gap-3 !py-3" aria-label={`${formatTransactionType(txn.transaction_type)}, ${formatNaira(txn.amount, 2)}, ${status.label}. View order details`}>
                      <span className={`lms-sym ${subscription ? "lms-sym--indigo" : "lms-sym--green"} mt-0.5`}>
                        {subscription ? <Repeat className="h-[18px] w-[18px]" aria-hidden="true" /> : <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[0.92rem] font-medium text-ink">{formatTransactionType(txn.transaction_type)}</p>
                        <p className="m-0 mt-0.5 text-[0.78rem] text-ink-3">
                          {DATE_TIME.format(new Date(txn.created_at))}
                          <span className="hidden sm:inline">
                            {" · "}
                            <span className="font-mono tracking-[0.03em]">{txn.reference}</span>
                          </span>
                        </p>
                        {(hasDiscount(txn) || hasTax(txn)) && (
                          <p className="m-0 mt-0.5 text-[0.75rem] text-ink-3">
                            {hasDiscount(txn) && <span className="font-medium text-accent">Saved {formatNaira(Number(txn.discount_amount))}</span>}
                            {hasDiscount(txn) && hasTax(txn) && " · "}
                            {hasTax(txn) && `Includes VAT ${formatNaira(Number(txn.tax_amount))}`}
                          </p>
                        )}
                      </div>
                      <div className="flex-none text-right">
                        <p className={`m-0 text-[0.98rem] font-semibold tabular-nums tracking-[-0.01em] ${status.tone === "red" ? "text-ink-3 line-through decoration-1" : "text-ink"}`}>
                          {formatNaira(txn.amount, 2)}
                        </p>
                        <span className={`lms-status lms-status--${status.tone} mt-0.5 text-[0.75rem]`}>{status.label}</span>
                      </div>
                      <ChevronRight className="lms-order-chev mt-3 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="m-0 text-sm text-ink-3">
            {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalItems)} of {totalItems}
          </p>
          <nav className="lms-pager" aria-label="Purchase pages">
            <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="lms-page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="lms-page" aria-current="page">
              {currentPage}
            </span>
            <span className="px-1 text-sm text-ink-3">of {totalPages}</span>
            <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="lms-page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}

const MONTH_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit" });
const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", month: "long", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

function statusInfo(status: string): { label: string; tone: "green" | "orange" | "red" | "gray" } {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return { label: "Paid", tone: "green" };
    case "PENDING":
      return { label: "Pending", tone: "orange" };
    case "FAILED":
      return { label: "Failed", tone: "red" };
    default:
      return { label: status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unknown", tone: "gray" };
  }
}


function formatTransactionType(type: string) {
  if (type?.toUpperCase() === "CART_PURCHASE") return "Course bundle";
  if (type?.toUpperCase() === "COURSE_PURCHASE") return "Course purchase";
  const words = type?.replace(/_/g, " ").toLowerCase() || "transaction";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function hasDiscount(txn: Transaction) {
  return Number(txn.discount_amount || 0) > 0;
}

function hasTax(txn: Transaction) {
  return Number(txn.tax_amount || 0) > 0;
}
