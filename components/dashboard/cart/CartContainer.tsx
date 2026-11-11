"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { estimateTotalWithTax, formatNaira } from "@/lib/paymentTax";

export type CartItem = {
  course_id: string;
  course_title: string;
  course_slug: string;
  course_thumbnail_url?: string | null;
  price: number;
  added_at?: string | null;
};

export type CartRead = {
  items: CartItem[];
  item_count: number;
  subtotal_amount: number;
};

type CouponPreview = {
  valid: boolean;
  code: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
};

type CartContainerProps = {
  initialCart: CartRead;
  initialError?: string | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

export default function CartContainer({
  initialCart,
  initialError,
}: CartContainerProps) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [error, setError] = useState(initialError || "");
  const [couponError, setCouponError] = useState("");
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [saveCard, setSaveCard] = useState(false);

  const hasItems = cart.items.length > 0;
  const discountAmount = coupon?.discount_amount ?? 0;
  const paymentEstimate = estimateTotalWithTax(
    cart.subtotal_amount,
    discountAmount,
  );
  const appliedCouponCode = coupon?.code || "";

  const sortedItems = useMemo(
    () =>
      [...cart.items].sort((a, b) =>
        String(a.added_at || "").localeCompare(String(b.added_at || "")),
      ),
    [cart.items],
  );

  async function removeItem(courseId: string) {
    setPendingCourseId(courseId);
    setError("");
    try {
      const res = await fetch(`/api/proxy/cart/items/${courseId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Unable to remove item.");

      setCart(normalizeCart(data?.data));
      window.dispatchEvent(new Event("cart:changed"));
      setCoupon(null);
      setCouponError("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove item.");
    } finally {
      setPendingCourseId(null);
    }
  }

  async function clearCart() {
    setClearing(true);
    setError("");
    try {
      const res = await fetch("/api/proxy/cart", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.message || "Unable to clear cart.");

      setCart({ items: [], item_count: 0, subtotal_amount: 0 });
      window.dispatchEvent(new Event("cart:changed"));
      setCoupon(null);
      setCouponCode("");
      setCouponError("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to clear cart.");
    } finally {
      setClearing(false);
    }
  }

  async function validateCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = couponCode.trim();
    if (!code) {
      setCoupon(null);
      setCouponError("Enter a coupon code first.");
      return;
    }

    setValidating(true);
    setCouponError("");
    setError("");

    try {
      const res = await fetch("/api/proxy/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.data?.valid) {
        throw new Error(data?.message || "Coupon could not be applied.");
      }

      setCoupon(data.data);
      setCouponCode(data.data.code || code);
    } catch (err) {
      setCoupon(null);
      setCouponError(
        err instanceof Error ? err.message : "Coupon could not be applied.",
      );
    } finally {
      setValidating(false);
    }
  }

  async function checkout() {
    setCheckingOut(true);
    setError("");
    try {
      const res = await fetch("/api/proxy/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon_code: appliedCouponCode || undefined,
          gateway: "PAYSTACK",
          save_card: saveCard,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.data?.authorization_url) {
        throw new Error(data?.message || "Unable to initialize checkout.");
      }

      window.location.href = data.data.authorization_url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to initialize checkout.",
      );
      setCheckingOut(false);
    }
  }

  const [promoOpen, setPromoOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col pb-10">
      {hasItems ? (
        <>
          {/* Headline, after the Apple bag: the total first, the next step beside it */}
          <header className="lms-rise flex flex-col gap-5 pt-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="sw-display m-0 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.08] text-ink">
                Your bag total is {formatNaira(paymentEstimate.totalWithTax)}.
              </h1>
              <p className="m-0 mt-2 text-[0.98rem] text-ink-2">
                {cart.item_count} course{cart.item_count === 1 ? "" : "s"}, paid in one secure Paystack checkout.
              </p>
            </div>
            <button type="button" onClick={checkout} disabled={checkingOut} className="lms-checkout flex-none sm:w-56">
              {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {checkingOut ? "Starting…" : "Check Out"}
            </button>
          </header>

          {error && (
            <p role="alert" className="m-0 mt-5 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
              {error}
            </p>
          )}

          {/* Items */}
          <ul className="m-0 mt-8 list-none border-t border-line p-0">
            {sortedItems.map((item) => {
              const removing = pendingCourseId === item.course_id;
              const href = `/dashboard/course-catalogue/${item.course_slug}`;
              return (
                <li key={item.course_id} className={`lms-bag-item ${removing ? "opacity-50" : ""}`}>
                  <Link href={href} tabIndex={-1} aria-hidden="true" className="lms-art relative block aspect-[4/3] w-24 flex-none overflow-hidden bg-paper-2 sm:w-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.course_thumbnail_url || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="sw-title m-0 text-[1.15rem] leading-snug text-ink sm:text-[1.3rem]">
                        <Link href={href} className="text-inherit no-underline hover:text-accent">
                          {item.course_title}
                        </Link>
                      </h2>
                      <p className="m-0 mt-1.5 text-[0.85rem] text-ink-3">
                        Online course · Lifetime access
                        {item.added_at ? ` · Added ${formatDate(item.added_at)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <span className="text-[1.15rem] font-semibold tabular-nums tracking-[-0.01em] text-ink">{formatNaira(item.price)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.course_id)}
                        disabled={removing}
                        className="lms-text-btn"
                      >
                        {removing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Summary */}
          <section aria-label="Order summary" className="lms-rise mt-6 flex flex-col gap-6 sm:ml-auto sm:w-[26rem]">
            <dl className="m-0 grid gap-2.5 text-[0.95rem]">
              <SummaryRow label="Subtotal" value={formatNaira(cart.subtotal_amount)} />
              {discountAmount > 0 && (
                <SummaryRow label={`Promo code ${appliedCouponCode}`} value={`−${formatNaira(discountAmount)}`} tone="discount" />
              )}
              <SummaryRow label="VAT (7.5%)" value={formatNaira(paymentEstimate.taxAmount)} />
              <div className="mt-2 border-t border-line pt-4">
                <SummaryRow label="Total" value={formatNaira(paymentEstimate.totalWithTax)} strong />
              </div>
            </dl>

            {/* Promo code: a disclosure, as on apple.com */}
            <div className="border-t border-line pt-4">
              {coupon ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="lms-filter-token">
                    <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                    {appliedCouponCode} applied
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponCode("");
                      setCouponError("");
                    }}
                    className="lms-text-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPromoOpen((value) => !value)}
                    aria-expanded={promoOpen}
                    aria-controls="promo-form"
                    className="lms-text-btn !text-[0.95rem]"
                  >
                    Add a promo code
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${promoOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  {promoOpen && (
                    <form id="promo-form" onSubmit={validateCoupon} className="mt-3 flex gap-2">
                      <label htmlFor="promo-code" className="sr-only">
                        Promo code
                      </label>
                      <input
                        id="promo-code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                        autoComplete="off"
                        autoFocus
                        placeholder="Enter code"
                        aria-invalid={Boolean(couponError) || undefined}
                        aria-describedby={couponError ? "promo-error" : undefined}
                        className="lms-field min-w-0 flex-1 uppercase tracking-[0.06em]"
                      />
                      <button type="submit" disabled={validating} className="lms-btn lms-btn--quiet flex-none">
                        {validating && <Loader2 className="h-4 w-4 animate-spin" />}
                        Apply
                      </button>
                    </form>
                  )}
                </>
              )}
              {couponError && (
                <p id="promo-error" role="alert" className="m-0 mt-2 text-[0.84rem] text-[#d92d20] dark:text-[#ff6961]">
                  {couponError}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-4">
              <span className="min-w-0">
                <span className="block text-[0.95rem] font-medium text-ink">Save this card</span>
                <span className="block text-[0.82rem] text-ink-3">Use it for future payments without re-entering it.</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={saveCard}
                onChange={(event) => setSaveCard(event.target.checked)}
                className="lms-switch"
              />
            </label>

            <button type="button" onClick={checkout} disabled={checkingOut} className="lms-checkout w-full">
              {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {checkingOut ? "Starting checkout…" : "Check Out"}
            </button>

            <p className="m-0 flex items-start gap-2 text-[0.8rem] leading-relaxed text-ink-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
              Payment is processed securely by Paystack. You’ll get access to every course here as soon as it completes.
            </p>

            <div className="flex items-center justify-between gap-3 border-t border-line pt-4 text-[0.88rem]">
              <Link href="/dashboard/course-catalogue" className="lms-text-btn no-underline">
                Continue shopping
              </Link>
              <button type="button" onClick={clearCart} disabled={clearing || checkingOut} className="lms-text-btn !text-ink-3 hover:!text-[#d92d20]">
                {clearing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Clear bag
              </button>
            </div>
          </section>
        </>
      ) : (
        <div className="lms-rise flex flex-col items-center px-6 pt-10 text-center sm:pt-16">
          <span className="grid h-20 w-20 place-items-center rounded-[24px] bg-[var(--lms-milk)] text-accent shadow-[inset_0_0_0_1px_var(--lms-milk-line)]">
            <ShoppingBag className="h-9 w-9" strokeWidth={1.6} />
          </span>
          <h1 className="sw-display m-0 mt-6 text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.08] text-ink">Your bag is empty.</h1>
          <p className="m-0 mt-3 max-w-md text-[1rem] leading-relaxed text-ink-2">
            Add a course from the catalogue and it will wait here until you’re ready to check out.
          </p>
          {error && (
            <p role="alert" className="m-0 mt-5 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink">
              {error}
            </p>
          )}
          <Link href="/dashboard/course-catalogue" className="lms-checkout mt-7 w-auto px-8 no-underline">
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "discount";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={strong ? "text-[1.15rem] font-semibold text-ink" : "text-ink-2"}>{label}</dt>
      <dd
        className={`m-0 tabular-nums ${
          strong
            ? "text-[1.45rem] font-bold tracking-[-0.02em] text-ink"
            : tone === "discount"
              ? "font-semibold text-accent"
              : "font-medium text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function normalizeCart(value: unknown): CartRead {
  const data = value && typeof value === "object" ? (value as Partial<CartRead>) : {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    item_count:
      typeof data.item_count === "number" ? data.item_count : data.items?.length ?? 0,
    subtotal_amount:
      typeof data.subtotal_amount === "number" ? data.subtotal_amount : 0,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}
