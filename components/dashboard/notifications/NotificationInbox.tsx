"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CheckCheck,
  CircleHelp,
  CreditCard,
  Loader2,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import { toast } from "sonner";
import type {
  NotificationItem,
  NotificationListMeta,
  NotificationListResponse,
} from "./types";
import {
  formatNotificationDateTime,
  getSafeNotificationPath,
  mergeNewest,
  normalizeNotification,
  notificationTypeLabel,
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

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 dark:text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
            Course updates, results, live sessions, support replies, payments, and account notices in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fetchNotifications(1)}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dceee4] bg-white px-3 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#f0fbf5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27433a] dark:bg-[#111525] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
          >
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Showing" value={items.length} />
        <SummaryCard label="Unread Here" value={unreadCount} />
        <SummaryCard label="Total In View" value={totalItems} />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e5e3ee] bg-white shadow-sm dark:border-[#262a3d] dark:bg-[#111525]">
        <div className="flex flex-col gap-3 border-b border-[#e8e6f0] px-4 py-3 dark:border-[#262a3d] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <FilterButton active={filter === "all"} onClick={() => changeFilter("all")}>
              All
            </FilterButton>
            <FilterButton active={filter === "unread"} onClick={() => changeFilter("unread")}>
              Unread
            </FilterButton>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Newest notifications appear first.
          </p>
        </div>

        {loading && items.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-4 py-12 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
              <Bell className="h-6 w-6" />
            </span>
            <p className="mt-3 text-sm font-extrabold text-slate-950 dark:text-white">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Student updates will collect here so you can catch up without losing your place.
            </p>
          </div>
        ) : (
          <ul className="m-0 list-none divide-y divide-[#eef0f4] p-0 dark:divide-[#262a3d]">
            {items.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-[#fbfefd] dark:hover:bg-[#151a2b] sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-start"
                >
                  <span className={`grid h-11 w-11 place-items-center rounded-md ${iconTone(notification.type)}`}>
                    {notificationIcon(notification.type)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-950 dark:text-white">
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="rounded-md bg-[#e7f6ee] px-2 py-0.5 text-[0.68rem] font-extrabold uppercase text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
                          New
                        </span>
                      )}
                    </span>
                    {notification.body && (
                      <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {notification.body}
                      </span>
                    )}
                    <span className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>{notificationTypeLabel(notification.type)}</span>
                      <span>{formatNotificationDateTime(notification.created_at)} WAT</span>
                      {!getSafeNotificationPath(notification.link) && <span>No link</span>}
                    </span>
                  </span>
                  <span className="hidden rounded-md border border-[#dceee4] px-2.5 py-1 text-xs font-bold text-slate-500 dark:border-[#27433a] dark:text-slate-400 sm:inline-flex">
                    {notification.is_read ? "Read" : "Unread"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasNext && (
          <div className="border-t border-[#e8e6f0] p-4 dark:border-[#262a3d]">
            <button
              type="button"
              onClick={() => fetchNotifications(page + 1)}
              disabled={loadingMore}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#dceee4] bg-white px-4 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#f0fbf5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27433a] dark:bg-[#111525] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
            >
              {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
              Load more notifications
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#e5e3ee] bg-white p-4 shadow-sm dark:border-[#262a3d] dark:bg-[#111525]">
      <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-extrabold transition ${
        active
          ? "bg-[#2D6A4F] text-white dark:bg-[#52b788] dark:text-[#06130d]"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#0f1726] dark:text-slate-300 dark:hover:bg-[#171d31]"
      }`}
    >
      {children}
    </button>
  );
}

function notificationIcon(type: string) {
  const normalized = type.toUpperCase();
  if (normalized.includes("COURSE") || normalized.includes("CERTIFICATE")) {
    return <BookOpen className="h-5 w-5" />;
  }
  if (normalized.includes("PAYMENT") || normalized.includes("SUBSCRIPTION")) {
    return <CreditCard className="h-5 w-5" />;
  }
  if (normalized.includes("COMMUNITY")) {
    return <MessageSquare className="h-5 w-5" />;
  }
  if (normalized.includes("SUPPORT")) {
    return <TicketCheck className="h-5 w-5" />;
  }
  if (normalized.includes("ACCOUNT") || normalized.includes("PASSWORD") || normalized.includes("TWO_FACTOR")) {
    return <ShieldCheck className="h-5 w-5" />;
  }
  if (normalized.includes("LIVE_SESSION")) {
    return <Bell className="h-5 w-5" />;
  }
  return <CircleHelp className="h-5 w-5" />;
}

function iconTone(type: string) {
  const normalized = type.toUpperCase();
  if (normalized.includes("PAYMENT") || normalized.includes("CERTIFICATE") || normalized.includes("COMPLETED")) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200";
  }
  if (normalized.includes("FAILED") || normalized.includes("EXPIRED") || normalized.includes("SUSPENDED")) {
    return "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200";
  }
  if (normalized.includes("LIVE_SESSION") || normalized.includes("EXPIRING")) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200";
  }
  return "bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]";
}
