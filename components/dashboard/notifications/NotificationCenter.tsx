"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Bell, BellRing, Check, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWsBaseUrl } from "@/lib/wsUrl";
import type { NotificationItem, NotificationListResponse } from "./types";
import {
  formatNotificationDateTime,
  formatNotificationTime,
  notificationVisual,
  type NotificationTone,
  getSafeNotificationPath,
  mergeNewest,
  normalizeNotification,
  unreadBadgeLabel,
} from "./utils";

type AppSession = {
  accessToken?: string;
};

type ConnectionState = "connecting" | "open" | "closed";
type DashboardOverviewCountEvent = CustomEvent<{
  unread_notifications_count?: number;
}>;

const PAGE_SIZE = 10;
/** A list older than this is refreshed quietly when the panel opens. */
const STALE_MS = 30_000;

const TONES: Record<NotificationTone, string> = {
  green: "bg-[color-mix(in_srgb,var(--sw-green)_12%,transparent)] text-accent",
  gold: "bg-[color-mix(in_srgb,var(--sw-gold)_20%,transparent)] text-gold-ink",
  clay: "bg-clay-wash text-clay-ink",
  deep: "bg-deep text-white dark:bg-brand",
  quiet: "bg-ink/[0.06] text-ink-2 dark:bg-white/[0.08]",
};

const lagosDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" });
function dayGroup(value: string, now: number) {
  const key = lagosDay.format(new Date(value));
  if (key === lagosDay.format(now)) return "Today";
  if (key === lagosDay.format(now - 86_400_000)) return "Yesterday";
  return "Earlier";
}
const RECONNECT_BASE_DELAY_MS = 2000;
const RECONNECT_MAX_DELAY_MS = 30000;

export function NotificationCenter() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as AppSession | null)?.accessToken;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  // Whether page 1 has ever arrived, and when: the panel never opens with
  // only the one live notification that happened to land first.
  const [loaded, setLoaded] = useState(false);
  const loadedAtRef = useRef(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [now, setNow] = useState(() => Date.now());
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("closed");
  const rootRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const openRef = useRef(false);
  const markReadAndOpenRef = useRef<(notification: NotificationItem) => void>(
    () => {},
  );

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/notifications/unread-count");
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setUnreadCount(Math.max(0, Number(json?.data?.unread_count) || 0));
      }
    } catch {
      // The bell should stay usable if a background refresh misses.
    }
  }, []);

  const loadNotifications = useCallback(async (nextPage = 1, quiet = false) => {
    if (nextPage === 1) {
      if (!quiet) setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(
        `/api/proxy/notifications?page=${nextPage}&page_size=${PAGE_SIZE}`,
      );
      const json = (await res
        .json()
        .catch(() => ({}))) as NotificationListResponse;

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
      if (nextPage === 1) {
        setLoaded(true);
        loadedAtRef.current = Date.now();
      }
    } catch (error) {
      if (quiet) return;
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load notifications.",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const reconcile = useCallback(() => {
    // The socket opens moments after the first-mount load; skip a repeat.
    if (Date.now() - loadedAtRef.current < 5000) return;
    fetchUnreadCount();
    // Keep page 1 current whether or not the panel is open.
    loadNotifications(1, true);
  }, [fetchUnreadCount, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && openRef.current) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // First mount: the count and the first page, so the bell is right at once
  // and the panel opens with its list already there.
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUnreadCount();
      loadNotifications(1, true);
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchUnreadCount, loadNotifications]);

  useEffect(() => {
    function handleOverviewCounts(event: Event) {
      const detail = (event as DashboardOverviewCountEvent).detail;
      if (typeof detail?.unread_notifications_count === "number") {
        setUnreadCount(Math.max(0, detail.unread_notifications_count));
      }
    }

    window.addEventListener("dashboard:overview-counts", handleOverviewCounts);
    return () =>
      window.removeEventListener(
        "dashboard:overview-counts",
        handleOverviewCounts,
      );
  }, []);

  // Opening: load if nothing has arrived yet, otherwise refresh quietly when stale.
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setNow(Date.now());
      if (!loaded) loadNotifications(1);
      else if (Date.now() - loadedAtRef.current > STALE_MS) loadNotifications(1, true);
    }, 0);
    return () => clearTimeout(timeout);
  }, [loaded, loadNotifications, open]);

  useEffect(() => {
    if (!accessToken) {
      const timeout = setTimeout(() => setConnection("closed"), 0);
      return () => clearTimeout(timeout);
    }

    if (!getWsBaseUrl()) {
      const timeout = setTimeout(() => setConnection("closed"), 0);
      return () => clearTimeout(timeout);
    }

    if (typeof WebSocket === "undefined") {
      const timeout = setTimeout(() => setConnection("closed"), 0);
      return () => clearTimeout(timeout);
    }

    const wsBaseUrl = getWsBaseUrl();
    if (!wsBaseUrl) {
      return;
    }

    let closedByEffect = false;
    const socketToken = accessToken;

    function scheduleReconnect() {
      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        RECONNECT_MAX_DELAY_MS,
        RECONNECT_BASE_DELAY_MS * 2 ** attempt,
      );
      reconnectAttemptRef.current = attempt + 1;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    }

    function connect() {
      setConnection("connecting");
      const ws = new WebSocket(
        `${wsBaseUrl}/notifications/ws?token=${encodeURIComponent(
          socketToken,
        )}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnection("open");
        reconcile();
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const notification = normalizeNotification(payload?.data);
          if (payload?.type !== "notification" || !notification) return;

          setItems((current) => mergeNewest(current, [notification]));
          setUnreadCount((count) => count + 1);
          window.dispatchEvent(
            new CustomEvent("notifications:new", { detail: notification }),
          );
          const safePath = getSafeNotificationPath(notification.link);
          toast(notification.title, {
            description: notification.body || undefined,
            action: safePath
              ? {
                  label: "Open",
                  onClick: () => {
                    markReadAndOpenRef.current(notification);
                  },
                }
              : undefined,
          });
        } catch {
          // Ignore malformed frames from a transient socket issue.
        }
      };

      ws.onclose = (event) => {
        setConnection("closed");
        if (!closedByEffect && event.code !== 4401) {
          scheduleReconnect();
          reconcile();
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [accessToken, reconcile]);

  const markRead = useCallback(async (notification: NotificationItem) => {
    if (notification.is_read) return notification;

    const previousUnread = unreadCount;
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, is_read: true, read_at: new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      const res = await fetch(
        `/api/proxy/notifications/${notification.id}/read`,
        { method: "PATCH" },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to mark notification as read.");
      }
      const updated = normalizeNotification(json.data);
      if (updated) {
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        window.dispatchEvent(
          new CustomEvent("dashboard:overview-counts", {
            detail: { unread_notifications_count: Math.max(0, previousUnread - 1) },
          }),
        );
        return updated;
      }
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item.id === notification.id ? notification : item,
        ),
      );
      setUnreadCount(previousUnread);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read.",
      );
    }

    return notification;
  }, [unreadCount]);

  const markReadAndOpen = useCallback(async (notification: NotificationItem) => {
    const updated = await markRead(notification);
    setOpen(false);
    const safePath = getSafeNotificationPath(updated.link);
    if (safePath) {
      router.push(safePath);
    }
  }, [markRead, router]);

  useEffect(() => {
    markReadAndOpenRef.current = markReadAndOpen;
  }, [markReadAndOpen]);

  const markAllRead = useCallback(async () => {
    setMarkingAll(true);
    const previousItems = items;
    const previousUnread = unreadCount;

    setItems((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

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
      setUnreadCount(previousUnread);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }, [items, unreadCount]);

  const visible = filter === "unread" ? items.filter((item) => !item.is_read) : items;
  const groups: { label: string; items: NotificationItem[] }[] = [];
  for (const item of visible) {
    const label = dayGroup(item.created_at, now);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  const live = connection === "open";

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="notification-panel"
        className={`lms-icon-btn ${open ? "bg-ink/[0.07] text-ink dark:bg-white/[0.08]" : ""}`}
      >
        <Bell className="h-5 w-5" strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="lms-dot" aria-hidden="true">
            {unreadBadgeLabel(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notification-panel"
          role="dialog"
          aria-label="Notifications"
          className="lms-popover"
          style={{ "--pop-w": "25.5rem" } as React.CSSProperties}
        >
          <div className="flex-none px-5 pb-3 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <p className="sw-title m-0 text-[1.2rem] text-ink">Notifications</p>
                <span
                  title={
                    live
                      ? "Live: new notifications arrive instantly"
                      : connection === "connecting"
                        ? "Connecting"
                        : "Offline: refreshes when you reopen"
                  }
                  className={`h-2 w-2 flex-none rounded-full ${
                    live ? "lms-live-dot bg-leaf" : connection === "connecting" ? "bg-gold" : "bg-ink/25"
                  }`}
                >
                  <span className="sr-only">{live ? "Live" : connection === "connecting" ? "Connecting" : "Offline"}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll || unreadCount === 0}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[0.8rem] font-semibold text-accent transition-colors hover:bg-[color-mix(in_srgb,var(--sw-green)_10%,transparent)] disabled:cursor-default disabled:text-ink-3 disabled:opacity-60 disabled:hover:bg-transparent"
              >
                {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                Mark all read
              </button>
            </div>

            <div role="tablist" aria-label="Show" className="mt-3 grid grid-cols-2 rounded-[12px] bg-ink/[0.055] p-[3px] dark:bg-white/[0.07]">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={`flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] text-[0.82rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                    filter === value
                      ? "bg-card text-ink shadow-[0_1px_2px_rgba(14,31,23,0.12),0_4px_12px_-6px_rgba(14,31,23,0.25)] dark:bg-[#2a3a31]"
                      : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {value === "all" ? "All" : "Unread"}
                  {value === "unread" && unreadCount > 0 && (
                    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[0.65rem] font-bold tabular-nums text-white">
                      {unreadBadgeLabel(unreadCount)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="lms-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line px-2 pb-2">
            {loading && !loaded ? (
              <div aria-hidden="true" className="px-3 py-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 py-2.5">
                    <span className="lms-skel h-10 w-10 flex-none rounded-[12px]" />
                    <span className="flex-1 pt-1">
                      <span className="lms-skel block h-3.5" style={{ width: `${78 - i * 12}%` }} />
                      <span className="lms-skel mt-2 block h-3 w-[90%]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-mint text-accent">
                  <BellRing className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <p className="m-0 mt-4 font-semibold text-ink">
                  {filter === "unread" && items.length > 0 ? "You’re all caught up" : "No notifications yet"}
                </p>
                <p className="m-0 mt-1 max-w-[30ch] text-[0.82rem] leading-relaxed text-ink-3">
                  Updates about your courses, live sessions, payments and support tickets will appear here.
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <p className="m-0 px-3 pb-1 pt-3 text-[0.7rem] font-semibold tracking-[0.02em] text-ink-3">{group.label}</p>
                  <ul className="m-0 list-none p-0">
                    {group.items.map((notification) => {
                      const { icon: Icon, tone } = notificationVisual(notification.type);
                      return (
                        <li key={notification.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => markReadAndOpen(notification)}
                            className={`flex w-full cursor-pointer gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors duration-200 ${
                              notification.is_read
                                ? "hover:bg-ink/[0.045] dark:hover:bg-white/[0.05]"
                                : "bg-[color-mix(in_srgb,var(--sw-green)_6%,transparent)] hover:bg-[color-mix(in_srgb,var(--sw-green)_10%,transparent)]"
                            }`}
                          >
                            <span className={`mt-0.5 grid h-10 w-10 flex-none place-items-center rounded-[12px] ${TONES[tone]}`}>
                              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start gap-2">
                                <span
                                  className={`min-w-0 flex-1 text-[0.86rem] leading-snug ${
                                    notification.is_read ? "font-medium text-ink-2" : "font-semibold text-ink"
                                  }`}
                                >
                                  {notification.title}
                                </span>
                                <time
                                  dateTime={notification.created_at}
                                  title={formatNotificationDateTime(notification.created_at)}
                                  suppressHydrationWarning
                                  className="mt-px flex-none text-[0.7rem] tabular-nums text-ink-3"
                                >
                                  {formatNotificationTime(notification.created_at)}
                                </time>
                              </span>
                              {notification.body && (
                                <span className="mt-0.5 line-clamp-2 block pr-6 text-[0.8rem] leading-[1.45] text-ink-3">
                                  {notification.body}
                                </span>
                              )}
                            </span>
                            {!notification.is_read && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="absolute bottom-4 right-4 h-2 w-2 rounded-full bg-clay transition-opacity group-hover:opacity-0 [@media(hover:none)]:opacity-0"
                                />
                                <span className="sr-only">, unread</span>
                              </>
                            )}
                          </button>
                          {!notification.is_read && (
                            <button
                              type="button"
                              onClick={() => markRead(notification)}
                              aria-label={`Mark “${notification.title}” as read`}
                              title="Mark as read"
                              className="absolute bottom-2 right-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-card text-accent opacity-0 shadow-[inset_0_0_0_1px_var(--sw-line)] transition-opacity focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}

            {hasNext && filter === "all" && visible.length > 0 && (
              <button
                type="button"
                onClick={() => loadNotifications(page + 1)}
                disabled={loadingMore}
                className="mx-auto mt-2 flex h-9 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[0.8rem] font-semibold text-ink-2 transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Show older
              </button>
            )}
          </div>

          <div className="flex-none border-t border-line p-2">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="group/all flex h-11 items-center justify-center gap-1.5 rounded-[14px] text-[0.86rem] font-semibold text-accent no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--sw-green)_8%,transparent)]"
            >
              See all notifications
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/all:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
