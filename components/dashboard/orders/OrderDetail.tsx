import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  LifeBuoy,
  Repeat,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import { formatNaira } from "@/lib/paymentTax";
import { CopyValue } from "./CopyValue";
import { ReceiptDownloadButton } from "./ReceiptDownloadButton";

export type OrderDetailData = {
  id: string;
  reference: string;
  amount: number;
  subtotal_amount?: number | null;
  discount_amount?: number | null;
  tax_rate?: number | null;
  tax_amount?: number | null;
  gateway: string;
  status: string;
  transaction_type: string;
  created_at: string;
  updated_at?: string | null;
  coupon_code?: string | null;
  items?: {
    course_id: string;
    title: string;
    slug?: string | null;
    thumbnail_url?: string | null;
    instructor_name?: string | null;
    unit_price: number;
  }[];
  plan?: { id: string; name: string; description?: string | null; duration_days: number; price: number } | null;
  payment?: {
    channel?: string | null;
    card_type?: string | null;
    brand?: string | null;
    last4?: string | null;
    exp_month?: string | null;
    exp_year?: string | null;
    bank?: string | null;
    currency?: string | null;
    paid_at?: string | null;
    gateway_message?: string | null;
  } | null;
  customer_name?: string | null;
  customer_email?: string | null;
  receipt_available?: boolean;
};

const FULL_DATE = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "long", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const SHORT_TIME = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

const when = (value?: string | null, format = DATE_TIME) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : format.format(date);
};

type Tone = "green" | "orange" | "red";
function statusOf(status: string): { label: string; tone: Tone; line: string } {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return { label: "Paid", tone: "green", line: "Payment received" };
    case "FAILED":
      return { label: "Failed", tone: "red", line: "This payment didn't go through" };
    default:
      return { label: "Pending", tone: "orange", line: "Waiting for the payment to be confirmed" };
  }
}

function titleOf(order: OrderDetailData) {
  const type = order.transaction_type?.toUpperCase();
  if (type === "SUBSCRIPTION") return order.plan?.name ? `${order.plan.name} plan` : "Subscription";
  const count = order.items?.length ?? 0;
  if (type === "CART_PURCHASE") return count === 1 ? order.items![0].title : `${count} courses`;
  return order.items?.[0]?.title ?? "Course purchase";
}

const words = (value?: string | null) => {
  if (!value) return null;
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const CHANNELS: Record<string, string> = {
  card: "Card",
  bank: "Bank account",
  bank_transfer: "Bank transfer",
  ussd: "USSD",
  qr: "QR code",
  mobile_money: "Mobile money",
  apple_pay: "Apple Pay",
};

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%23dfe9e3'/></svg>";

/** One purchase in full, laid out like an Apple order: the total up top, then grouped lists. */
export default function OrderDetail({ order }: { order: OrderDetailData }) {
  const status = statusOf(order.status);
  const paid = status.tone === "green";
  const subscription = order.transaction_type?.toUpperCase() === "SUBSCRIPTION";
  const items = order.items ?? [];
  const discount = Number(order.discount_amount || 0);
  const tax = Number(order.tax_amount || 0);
  const subtotal =
    order.subtotal_amount != null
      ? Number(order.subtotal_amount)
      : items.length
        ? items.reduce((sum, item) => sum + Number(item.unit_price || 0), 0)
        : Number(order.plan?.price ?? order.amount);
  const vatPercent = Number(order.tax_rate || 0) * 100;
  const payment = order.payment ?? null;
  const brand = (payment?.brand || payment?.card_type || "").toLowerCase().replace(/\s+/g, "");
  const placedAt = when(order.created_at);
  const paidAt = when(payment?.paid_at) ?? (paid ? when(order.updated_at) : null);

  const steps: { label: string; detail?: string | null; state: "done" | "now" | "fail" | "todo" }[] = [
    { label: "Order placed", detail: when(order.created_at, SHORT_TIME), state: "done" },
    paid
      ? { label: "Payment confirmed", detail: when(payment?.paid_at, SHORT_TIME) ?? when(order.updated_at, SHORT_TIME), state: "done" }
      : status.tone === "red"
        ? { label: "Payment failed", detail: payment?.gateway_message, state: "fail" }
        : { label: "Confirming payment", detail: "Usually takes a few seconds", state: "now" },
    {
      label: subscription ? "Plan active" : items.length > 1 ? "Courses unlocked" : "Course unlocked",
      state: paid ? "done" : "todo",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 pb-14">
      <nav className="lms-rise" aria-label="Breadcrumb">
        <Link href="/dashboard/orders" className="lms-order-back">
          <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
          Payment &amp; Billing
        </Link>
      </nav>

      {/* The receipt's face: who was paid, how much, and where it stands. */}
      <header className="lms-order-hero lms-rise" style={{ ["--i" as string]: 1 }}>
        <span className="lms-order-mark" aria-hidden="true">
          <Image src="/images/logo/swc-mark.png" alt="" width={112} height={112} />
        </span>
        <p className="m-0 text-[0.95rem] font-medium text-ink-2">Social Work Consultancy Ltd</p>
        <h1 className="lms-order-amount" data-void={status.tone === "red" || undefined}>
          {formatNaira(order.amount, 2)}
        </h1>
        <p className="m-0 max-w-[30ch] text-[1.02rem] font-semibold leading-snug text-ink">{titleOf(order)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="lms-order-pill" data-tone={status.tone}>
            {status.tone === "green" ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : status.tone === "red" ? <X size={14} strokeWidth={3} aria-hidden="true" /> : <Clock size={14} strokeWidth={2.6} aria-hidden="true" />}
            {status.label}
          </span>
          {placedAt && <span className="text-[0.85rem] text-ink-3">{placedAt}</span>}
        </div>
      </header>

      {/* Progress, after Apple's order status. */}
      <section className="lms-rise" style={{ ["--i" as string]: 2 }} aria-labelledby="order-status">
        <h2 id="order-status" className="lms-settings-head">Status</h2>
        <div className="lms-group px-5 py-5">
          <p className="m-0 mb-4 text-[0.95rem] font-semibold text-ink">{status.line}</p>
          <ol className="lms-order-track" data-tone={status.tone}>
            {steps.map((step, i) => (
              <li key={step.label} data-state={step.state} style={{ ["--i" as string]: i }}>
                <span className="lms-order-node" aria-hidden="true">
                  {step.state === "done" ? <Check size={12} strokeWidth={3.2} /> : step.state === "fail" ? <X size={12} strokeWidth={3.2} /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.86rem] font-medium text-ink">{step.label}</span>
                  {step.detail && <span className="block text-[0.78rem] text-ink-3">{step.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
        {status.tone === "red" && (
          <p className="lms-settings-foot">
            <span>No money was taken for this order. You can try again from the course page.</span>
          </p>
        )}
        {status.tone === "orange" && (
          <p className="lms-settings-foot">
            <span>If you were charged and this hasn&apos;t changed within an hour, contact support with the order number below.</span>
          </p>
        )}
      </section>

      {/* What was bought. */}
      <section className="lms-rise" style={{ ["--i" as string]: 3 }} aria-labelledby="order-items">
        <h2 id="order-items" className="lms-settings-head">
          {subscription ? "Plan" : items.length === 1 ? "Course" : `Courses (${items.length})`}
        </h2>
        <ul className="lms-group m-0 list-none p-0">
          {subscription ? (
            <li className="lms-form-row !gap-3.5 !py-3">
              <span className="lms-sym lms-sym--indigo">
                <Repeat className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.95rem] font-medium text-ink">{order.plan?.name ?? "Subscription"}</span>
                <span className="block text-[0.8rem] text-ink-3">
                  {order.plan ? `${order.plan.duration_days} days of access` : "Subscription plan"}
                </span>
              </span>
              <span className="text-[0.95rem] font-medium tabular-nums text-ink">{formatNaira(order.plan?.price ?? subtotal, 2)}</span>
            </li>
          ) : items.length === 0 ? (
            <li className="lms-form-row !py-3 text-[0.9rem] text-ink-3">Course details are no longer available.</li>
          ) : (
            items.map((item) => {
              const href = paid ? `/learn/${item.course_id}` : item.slug ? `/dashboard/course-catalogue/${item.slug}` : null;
              const body = (
                <>
                  <span className="lms-order-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.thumbnail_url || FALLBACK_IMAGE} alt="" loading="lazy" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-[0.95rem] font-medium leading-snug text-ink">{item.title}</span>
                    {item.instructor_name && <span className="mt-0.5 block text-[0.8rem] text-ink-3">{item.instructor_name}</span>}
                  </span>
                  <span className="flex-none text-right text-[0.95rem] font-medium tabular-nums text-ink">{formatNaira(item.unit_price, 2)}</span>
                  {href && <ChevronRight size={16} className="lms-order-chev" aria-hidden="true" />}
                </>
              );
              return (
                <li key={item.course_id}>
                  {href ? (
                    <Link href={href} className="lms-form-row lms-order-link !gap-3.5 !py-3" aria-label={`${item.title}${paid ? ", open course" : ", view course"}`}>
                      {body}
                    </Link>
                  ) : (
                    <div className="lms-form-row !gap-3.5 !py-3">{body}</div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* The sums, as on an Apple receipt. */}
      <section className="lms-rise" style={{ ["--i" as string]: 4 }} aria-labelledby="order-summary">
        <h2 id="order-summary" className="lms-settings-head">Summary</h2>
        <dl className="lms-group m-0">
          <div className="lms-form-row lms-order-line">
            <dt>Subtotal</dt>
            <dd>{formatNaira(subtotal, 2)}</dd>
          </div>
          {discount > 0 && (
            <div className="lms-form-row lms-order-line">
              <dt className="flex items-center gap-2">
                Discount
                {order.coupon_code && (
                  <span className="lms-order-coupon">
                    <Tag size={11} aria-hidden="true" />
                    {order.coupon_code}
                  </span>
                )}
              </dt>
              <dd className="!text-accent">−{formatNaira(discount, 2)}</dd>
            </div>
          )}
          {tax > 0 && (
            <div className="lms-form-row lms-order-line">
              <dt>VAT{vatPercent ? ` (${Number(vatPercent.toFixed(2))}%)` : ""}</dt>
              <dd>{formatNaira(tax, 2)}</dd>
            </div>
          )}
          <div className="lms-form-row lms-order-line lms-order-total">
            <dt>{paid ? "Total paid" : "Total"}</dt>
            <dd>{formatNaira(order.amount, 2)}</dd>
          </div>
        </dl>
        {tax > 0 && <p className="lms-settings-foot"><span>Prices include Nigerian VAT where it applies.</span></p>}
      </section>

      {/* How it was paid. Only display-safe details come from the API. */}
      <section className="lms-rise" style={{ ["--i" as string]: 5 }} aria-labelledby="order-payment">
        <h2 id="order-payment" className="lms-settings-head">Payment</h2>
        <dl className="lms-group m-0">
          <div className="lms-form-row lms-order-line">
            <dt>Method</dt>
            <dd className="flex items-center justify-end gap-2.5">
              {payment?.last4 ? (
                <>
                  <span className={`lms-mini-card lms-mini-card--${brand || "card"}`} aria-hidden="true">
                    {payment.brand || payment.card_type || "Card"}
                  </span>
                  <span>
                    <span className="capitalize">{payment.brand || payment.card_type || "Card"}</span> •••• {payment.last4}
                  </span>
                </>
              ) : (
                <>
                  <CreditCard size={16} className="text-ink-3" aria-hidden="true" />
                  {CHANNELS[payment?.channel?.toLowerCase() ?? ""] ?? words(payment?.channel) ?? "Online payment"}
                </>
              )}
            </dd>
          </div>
          {payment?.bank && (
            <div className="lms-form-row lms-order-line">
              <dt>Bank</dt>
              <dd className="capitalize">{payment.bank.toLowerCase()}</dd>
            </div>
          )}
          {payment?.exp_month && payment?.exp_year && payment?.last4 && (
            <div className="lms-form-row lms-order-line">
              <dt>Expires</dt>
              <dd>
                {payment.exp_month.padStart(2, "0")}/{payment.exp_year.slice(-2)}
              </dd>
            </div>
          )}
          <div className="lms-form-row lms-order-line">
            <dt>Processed by</dt>
            <dd>{words(order.gateway)}</dd>
          </div>
          {paidAt && (
            <div className="lms-form-row lms-order-line">
              <dt>Paid on</dt>
              <dd>{paidAt}</dd>
            </div>
          )}
        </dl>
      </section>

      {/* Reference details for support and records. */}
      <section className="lms-rise" style={{ ["--i" as string]: 6 }} aria-labelledby="order-details">
        <h2 id="order-details" className="lms-settings-head">Order details</h2>
        <dl className="lms-group m-0">
          <div className="lms-form-row lms-order-line">
            <dt>Order number</dt>
            <dd>
              <CopyValue value={order.reference} label="order number" />
            </dd>
          </div>
          <div className="lms-form-row lms-order-line">
            <dt>Order date</dt>
            <dd>{when(order.created_at, FULL_DATE)}</dd>
          </div>
          {(order.customer_name || order.customer_email) && (
            <div className="lms-form-row lms-order-line !items-start !py-3">
              <dt className="pt-0.5">Billed to</dt>
              <dd>
                {order.customer_name && <span className="block">{order.customer_name}</span>}
                {order.customer_email && <span className="block text-[0.82rem] text-ink-3">{order.customer_email}</span>}
              </dd>
            </div>
          )}
          <div className="lms-form-row lms-order-line">
            <dt>Type</dt>
            <dd className="flex items-center justify-end gap-2">
              {subscription ? <Repeat size={15} className="text-ink-3" aria-hidden="true" /> : items.length > 1 ? <ShoppingBag size={15} className="text-ink-3" aria-hidden="true" /> : <BookOpen size={15} className="text-ink-3" aria-hidden="true" />}
              {subscription ? "Subscription" : items.length > 1 ? "Course bundle" : "Course purchase"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="lms-rise flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 7 }}>
        {order.receipt_available && <ReceiptDownloadButton reference={order.reference} variant="button" />}
        <Link href="/dashboard/support-tickets" className="lms-btn lms-btn--quiet sm:flex-1">
          <LifeBuoy size={16} aria-hidden="true" />
          Get help with this order
        </Link>
      </div>
    </div>
  );
}

/** Shown when the order cannot be found or loaded. */
export function OrderMissing({ reason }: { reason: "missing" | "error" }) {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-7 pb-14">
      <nav className="lms-rise" aria-label="Breadcrumb">
        <Link href="/dashboard/orders" className="lms-order-back">
          <ChevronLeft size={18} strokeWidth={2.4} aria-hidden="true" />
          Payment &amp; Billing
        </Link>
      </nav>
      <div className="lms-group lms-rise flex flex-col items-center px-6 py-12 text-center" style={{ ["--i" as string]: 1 }}>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--lms-milk)] text-accent">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="lms-order-plain m-0 mt-4 text-ink">
          {reason === "missing" ? "Order not found" : "This order couldn't be loaded"}
        </h1>
        <p className="m-0 mt-1.5 max-w-sm text-[0.9rem] leading-relaxed text-ink-3">
          {reason === "missing"
            ? "It may belong to another account, or the link is incomplete. Your purchases are listed in Payment & Billing."
            : "Check your connection and try again in a moment."}
        </p>
        <Link href="/dashboard/orders" className="lms-btn mt-6">
          See all purchases
        </Link>
      </div>
    </div>
  );
}
