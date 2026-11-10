"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCheck,
  Loader2,
  RefreshCcw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { getWsBaseUrl } from "@/lib/wsUrl";
import type { NotificationItem, NotificationListResponse } from "./types";
import {
  formatNotificationTime,
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

  const loadNotifications = useCallback(async (nextPage = 1) => {
    if (nextPage === 1) {
      setLoading(true);
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
  }, []);

  const reconcile = useCallback(() => {
    fetchUnreadCount();
    if (openRef.current) {
      loadNotifications(1);
    }
  }, [fetchUnreadCount, loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUnreadCount, 0);
    return () => clearTimeout(timeout);
  }, [fetchUnreadCount]);

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

  useEffect(() => {
    if (!open || items.length > 0) return;
    const timeout = setTimeout(() => loadNotifications(1), 0);
    return () => clearTimeout(timeout);
  }, [items.length, loadNotifications, open]);

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="lms-icon-btn"
      >
        <Bell className="h-5 w-5" strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="lms-dot">
            {unreadBadgeLabel(unreadCount)}
          </span>
        )}
      </button>

      <div
        hidden={!open}
        className={`fixed inset-x-3 top-[5.25rem] z-50 rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--sw-line),0_34px_70px_-24px_rgba(4,18,11,0.45)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[24rem] ${
          open ? "lms-pop" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              Notifications
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {connection === "open" ? (
                <Wifi className="h-3.5 w-3.5 text-[#2D6A4F] dark:text-[#74c69d]" />
              ) : connection === "connecting" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
              {unreadCount} unread
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => loadNotifications(1)}
              disabled={loading}
              className="lms-icon-btn h-9 w-9 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh notifications"
              title="Refresh"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={markAllRead}
              disabled={markingAll || unreadCount === 0}
              className="lms-icon-btn h-9 w-9 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              {markingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="lms-scroll max-h-[min(24rem,60dvh)] overflow-y-auto p-2">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Nothing new yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Updates from courses, payments, support, and your account will
                appear here.
              </p>
            </div>
          ) : (
            <ul className="m-0 list-none p-0">
              {items.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => markReadAndOpen(notification)}
                    className="flex w-full cursor-pointer gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-mint dark:hover:bg-white/[0.07]"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.is_read
                          ? "bg-slate-300 dark:bg-slate-700"
                          : "bg-[#2D6A4F] dark:bg-[#74c69d]"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-950 dark:text-gray-100">
                        {notification.title}
                      </span>
                      {notification.body && (
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {notification.body}
                        </span>
                      )}
                      <span className="mt-1 block text-[0.7rem] font-medium text-gray-400 dark:text-gray-600">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hasNext && (
            <button
              type="button"
              onClick={() => loadNotifications(page + 1)}
              disabled={loadingMore}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 text-xs font-bold text-slate-600 transition hover:border-[#2D6A4F]/50 hover:text-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
            >
              {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Load more
            </button>
          )}
        </div>

        <div className="border-t border-line p-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/notifications");
            }}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-full text-sm font-semibold text-accent transition-colors hover:bg-mint dark:hover:bg-white/[0.07]"
          >
            Open notification inbox
          </button>
        </div>
      </div>
    </div>
  );
}
