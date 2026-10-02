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
