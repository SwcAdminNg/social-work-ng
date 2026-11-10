import {
  Award,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CreditCard,
  FileText,
  GraduationCap,
  Hourglass,
  LifeBuoy,
  type LucideIcon,
  MessageSquareReply,
  MessagesSquare,
  PartyPopper,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react";
import type { NotificationItem } from "./types";

export function unreadBadgeLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatNotificationDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

export function normalizeNotification(input: unknown): NotificationItem | null {
  const item = input as Partial<NotificationItem> | null;
  if (!item?.id || !item.title || !item.created_at || !item.type) return null;

  return {
    id: item.id,
    created_at: item.created_at,
    type: item.type,
    title: item.title,
    body: item.body ?? null,
    link: item.link ?? null,
    metadata_json: item.metadata_json ?? null,
    is_read: Boolean(item.is_read),
    read_at: item.read_at ?? null,
  };
}

export function mergeNewest(
  current: NotificationItem[],
  incoming: NotificationItem[],
) {
  const byId = new Map<string, NotificationItem>();
  for (const item of [...incoming, ...current]) {
    byId.set(item.id, item);
  }

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getSafeNotificationPath(link?: string | null) {
  if (!link || !link.startsWith("/") || link.startsWith("//")) return null;

  try {
    const url = new URL(link, "https://socialworknigeria.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function notificationTypeLabel(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export type NotificationTone = "green" | "gold" | "clay" | "deep" | "quiet";

/** The icon and colour a notification is shown with, by its type. */
export function notificationVisual(type: string): { icon: LucideIcon; tone: NotificationTone } {
  switch (type) {
    case "COURSE_ENROLLED":
      return { icon: BookOpenCheck, tone: "green" };
    case "COURSE_COMPLETED":
      return { icon: GraduationCap, tone: "green" };
    case "CERTIFICATE_ISSUED":
      return { icon: Award, tone: "gold" };
    case "LIVE_SESSION_SCHEDULED":
    case "LIVE_SESSION_RESCHEDULED":
      return { icon: CalendarClock, tone: "clay" };
    case "LIVE_SESSION_REMINDER":
      return { icon: Video, tone: "clay" };
    case "COURSE_REVIEW_REPLIED":
    case "REVIEW_COMMENT_ADDED":
      return { icon: MessageSquareReply, tone: "gold" };
    case "COMMUNITY_NEW_MESSAGE":
      return { icon: MessagesSquare, tone: "green" };
    case "SUPPORT_TICKET_MESSAGE":
    case "SUPPORT_TICKET_STATUS_CHANGED":
    case "SUPPORT_TICKET_ASSIGNED":
    case "NEW_SUPPORT_TICKET":
      return { icon: LifeBuoy, tone: "gold" };
    case "PAYMENT_SUCCESSFUL":
    case "SUBSCRIPTION_RENEWED":
    case "NEW_PAYMENT":
      return { icon: ReceiptText, tone: "deep" };
    case "SUBSCRIPTION_RENEWAL_FAILED":
    case "SUBSCRIPTION_EXPIRED":
      return { icon: CreditCard, tone: "clay" };
    case "SUBSCRIPTION_EXPIRING_SOON":
      return { icon: Hourglass, tone: "gold" };
    case "SIGNUP_WELCOME":
      return { icon: PartyPopper, tone: "green" };
    case "ACCOUNT_SUSPENDED":
      return { icon: ShieldAlert, tone: "clay" };
    case "LOGIN":
    case "PASSWORD_RESET_REQUESTED":
    case "PASSWORD_RESET_COMPLETED":
    case "TWO_FACTOR_ENABLED":
    case "ACCOUNT_UNSUSPENDED":
    case "ROLE_CHANGED":
      return { icon: ShieldCheck, tone: "quiet" };
    case "PROFILE_PICTURE_UPDATED":
      return { icon: UserRound, tone: "quiet" };
    default:
      if (type.startsWith("REVISION_") || type.startsWith("REVIEW_") || type.startsWith("MARKS_")) {
        return { icon: FileText, tone: "quiet" };
      }
      return { icon: Bell, tone: "quiet" };
  }
}
