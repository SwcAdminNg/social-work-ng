"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CheckCheck,
  ChevronRight,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import type {
  NotificationItem,
  NotificationListMeta,
  NotificationListResponse,
} from "./types";
import {
  formatNotificationDateTime,
  formatNotificationTime,
  getSafeNotificationPath,
  mergeNewest,
  normalizeNotification,
  notificationTypeLabel,
  notificationVisual,
  type NotificationTone,
} from "./utils";

const PAGE_SIZE = 20;

type NotificationFilter = "all" | "unread";

type NotificationEvent = CustomEvent<NotificationItem>;

export function NotificationInbox({
  initialItems,
  initialMeta,
}: {
  initialItems: NotificationItem[];
  initialMeta?: NotificationListMeta;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialMeta?.page || 1);
  const [hasNext, setHasNext] = useState(Boolean(initialMeta?.has_next));
  const [totalItems, setTotalItems] = useState(initialMeta?.total_items || initialItems.length);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((notification) => !notification.is_read).length,
    [items],
  );

  const fetchNotifications = useCallback(
    async (nextPage = 1, nextFilter = filter) => {
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          page_size: String(PAGE_SIZE),
        });
        if (nextFilter === "unread") params.set("unread_only", "true");

        const res = await fetch(`/api/proxy/notifications?${params.toString()}`);
        const json = (await res.json().catch(() => ({}))) as NotificationListResponse;
        if (!res.ok) {
          throw new Error(json.message || "Failed to load notifications.");
        }

        const incoming = Array.isArray(json.data)
          ? json.data
              .map((item) => normalizeNotification(item))
              .filter((item): item is NotificationItem => Boolean(item))
          : [];

        setItems((current) =>
          nextPage === 1 ? incoming : mergeNewest(current, incoming),
        );
        setPage(nextPage);
        setHasNext(Boolean(json.meta?.has_next));
        setTotalItems(json.meta?.total_items || incoming.length);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load notifications.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter],
  );

  function changeFilter(nextFilter: NotificationFilter) {
    setFilter(nextFilter);
    fetchNotifications(1, nextFilter);
  }

  const markRead = useCallback(async (notification: NotificationItem) => {
    if (notification.is_read) return notification;

    const previousItems = items;
    setItems((current) =>
      filter === "unread"
        ? current.filter((item) => item.id !== notification.id)
        : current.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item,
          ),
    );

    try {
      const res = await fetch(
        `/api/proxy/notifications/${notification.id}/read`,
        { method: "PATCH" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to mark notification as read.");
      }

      const updated = normalizeNotification(json.data) || {
        ...notification,
        is_read: true,
        read_at: new Date().toISOString(),
      };
      setItems((current) =>
        filter === "unread"
          ? current.filter((item) => item.id !== updated.id)
          : current.map((item) => (item.id === updated.id ? updated : item)),
      );
      window.dispatchEvent(
        new CustomEvent("dashboard:overview-counts", {
          detail: { unread_notifications_count: Math.max(0, unreadCount - 1) },
        }),
      );
      return updated;
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read.",
      );
      return notification;
    }
  }, [filter, items, unreadCount]);

  const openNotification = useCallback(async (notification: NotificationItem) => {
    const updated = await markRead(notification);
    const safePath = getSafeNotificationPath(updated.link);
    if (safePath) router.push(safePath);
  }, [markRead, router]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    const previousItems = items;
    setItems((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at || new Date().toISOString(),
      })),
    );

    try {
      const res = await fetch("/api/proxy/notifications/read-all", {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to mark notifications as read.");
      }
      window.dispatchEvent(
        new CustomEvent("dashboard:overview-counts", {
          detail: { unread_notifications_count: 0 },
        }),
      );
    } catch (error) {
      setItems(previousItems);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }, [items]);

  useEffect(() => {
    function handleNewNotification(event: Event) {
      const notification = normalizeNotification((event as NotificationEvent).detail);
      if (!notification) return;
      if (filter === "unread" && notification.is_read) return;
      setItems((current) => mergeNewest(current, [notification]));
      setTotalItems((count) => count + 1);
    }

    window.addEventListener("notifications:new", handleNewNotification);
    return () =>
      window.removeEventListener("notifications:new", handleNewNotification);
  }, [filter]);

  // Day groups are reckoned in West Africa Time, like every date in the dashboard.
  const [now] = useState(() => Date.now());
  const groups = useMemo(() => {
    const out: { label: string; items: NotificationItem[] }[] = [];
    for (const item of items) {
      const label = dayGroup(item.created_at, now);
      const last = out[out.length - 1];
      if (last?.label === label) last.items.push(item);
      else out.push({ label, items: [item] });
    }
    return out;
  }, [items, now]);

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col pb-8">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Notifications</h1>
        <p className="m-0 mt-2 text-[0.98rem] text-ink-2">
          {unreadCount > 0 ? `${unreadCount} unread` : "You’re all caught up"}
          {totalItems > 0 ? ` · ${totalItems} in total` : ""}
        </p>
      </header>

      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-5 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="mx-auto flex max-w-[880px] items-center justify-between gap-3">
          <div role="tablist" aria-label="Show" className="lms-segmented">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => changeFilter(value)}
                className="lms-segment !px-4"
              >
                {value === "all" ? "All" : "Unread"}
                {value === "unread" && unreadCount > 0 && <span className="lms-segment-count">{unreadCount}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={markAllRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.86rem] font-semibold text-accent transition-colors hover:bg-[color-mix(in_srgb,var(--sw-green)_10%,transparent)] disabled:cursor-default disabled:text-ink-3 disabled:opacity-60 disabled:hover:bg-transparent"
            >
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Read all</span>
            </button>
            <button
              type="button"
              onClick={() => fetchNotifications(1)}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh"
              className="lms-gpop-x !h-9 !w-9 disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2">
        {loading && items.length === 0 ? (
          <div aria-hidden="true" className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="lms-notice !cursor-default">
                <span className="lms-skel h-10 w-10 flex-none !rounded-[11px]" />
                <span className="flex-1 pt-1">
                  <span className="lms-skel block h-3.5" style={{ width: `${70 - i * 10}%` }} />
                  <span className="lms-skel mt-2 block h-3 w-[90%]" />
                </span>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="lms-milk lms-rise flex flex-col items-center px-6 py-14 text-center sm:py-20">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
              <BellRing className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </h2>
            <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
              Updates about your courses, results, live sessions, payments and support replies will appear here.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label} className="mt-5 first:mt-2">
              <h2 className="m-0 mb-2 px-1 text-[1.15rem] font-bold tracking-[-0.02em] text-ink">{group.label}</h2>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {group.items.map((notification) => {
                  const { icon: Icon, tone } = notificationVisual(notification.type);
                  const opens = Boolean(getSafeNotificationPath(notification.link));
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => openNotification(notification)}
                        data-unread={notification.is_read ? undefined : ""}
                        className="lms-notice group"
                      >
                        <span className={tone === "key" ? "lms-sym lms-sym--lg lms-key-tile" : `lms-sym lms-sym--lg lms-sym--${SYM_TONE[tone]}`}>
                          <Icon className="h-5 w-5" strokeWidth={tone === "key" ? 2.2 : 2.1} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span className="min-w-0 flex-1 truncate text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
                              {notificationTypeLabel(notification.type)}
                            </span>
                            <time
                              dateTime={notification.created_at}
                              title={`${formatNotificationDateTime(notification.created_at)} WAT`}
                              suppressHydrationWarning
                              className="flex-none text-[0.75rem] tabular-nums text-ink-3"
                            >
                              {formatNotificationTime(notification.created_at)}
                            </time>
                          </span>
                          <span className={`mt-0.5 block text-[0.95rem] leading-snug text-ink ${notification.is_read ? "font-medium" : "font-semibold"}`}>
                            {notification.title}
                          </span>
                          {notification.body && (
                            <span className="mt-0.5 line-clamp-2 block text-[0.86rem] leading-[1.45] text-ink-2">{notification.body}</span>
                          )}
                        </span>
                        {opens && <ChevronRight className="mt-6 h-4 w-4 flex-none text-ink-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
                        {!notification.is_read && <span className="sr-only">, unread</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}

        {hasNext && items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={() => fetchNotifications(page + 1)} disabled={loadingMore} className="lms-btn lms-btn--quiet disabled:opacity-60">
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              Show older
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SYM_TONE: Record<Exclude<NotificationTone, "key">, string> = {
  green: "green",
  gold: "gold",
  clay: "orange",
  deep: "blue",
  quiet: "gray",
};

const lagosDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });
const lagosLong = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", weekday: "long", day: "numeric", month: "long" });

function dayGroup(value: string, now: number) {
  const date = new Date(value);
  const key = lagosDay.format(date);
  if (key === lagosDay.format(now)) return "Today";
  if (key === lagosDay.format(now - 86_400_000)) return "Yesterday";
  if (now - date.getTime() < 7 * 86_400_000) return lagosLong.format(date).split(" ")[0];
  return "Earlier";
}
