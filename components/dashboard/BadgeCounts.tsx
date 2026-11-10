"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type BadgeCounts = {
  community: number;
  cart: number;
  support: number;
};

type OverviewCounts = {
  unread_notifications_count?: number;
  unread_community_messages_count?: number;
  cart_item_count?: number;
  open_support_tickets_count?: number;
};
type OverviewCountEvent = CustomEvent<OverviewCounts>;

const empty: BadgeCounts = { community: 0, cart: 0, support: 0 };
const POLL_MS = 60_000;

const BadgeCountsContext = createContext<BadgeCounts>(empty);

/** Unread and open counts shown on the sidebar, top bar and mobile tab bar. */
export function useBadgeCounts() {
  return useContext(BadgeCountsContext);
}

export function badgeLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

/** Shares fresh counts with every listener: this provider and the notification bell. */
function broadcast(detail: OverviewCounts) {
  window.dispatchEvent(new CustomEvent("dashboard:overview-counts", { detail }));
}

export function BadgeCountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<BadgeCounts>(empty);

  // Listen first, so the counts fetched below (and the ones the dashboard
  // home sends) always land.
  useEffect(() => {
    function handleOverviewCounts(event: Event) {
      const detail = (event as OverviewCountEvent).detail;
      if (!detail) return;
      const pick = (value: number | undefined, fallback: number) =>
        typeof value === "number" ? Math.max(0, value) : fallback;
      setCounts((current) => ({
        community: pick(detail.unread_community_messages_count, current.community),
        cart: pick(detail.cart_item_count, current.cart),
        support: pick(detail.open_support_tickets_count, current.support),
      }));
    }

    window.addEventListener("dashboard:overview-counts", handleOverviewCounts);
    return () => window.removeEventListener("dashboard:overview-counts", handleOverviewCounts);
  }, []);

  // Every count on first mount, on any dashboard page, then kept fresh.
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    // For an API without the counts endpoint: the two counts that have their own.
    async function fetchSeparately() {
      const [community, cart] = await Promise.all([
        fetch("/api/proxy/community/unread-count").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/proxy/cart").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (cancelled) return;
      const detail: OverviewCounts = {};
      if (community) detail.unread_community_messages_count = Number(community?.data?.total_unread) || 0;
      const cartData = cart?.data;
      if (cartData) {
        detail.cart_item_count =
          typeof cartData.item_count === "number"
            ? cartData.item_count
            : Array.isArray(cartData.items)
              ? cartData.items.length
              : 0;
      }
      broadcast(detail);
    }

    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await fetch("/api/proxy/users/me/dashboard/counts");
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          if (!cancelled && json?.data) broadcast(json.data as OverviewCounts);
        } else {
          await fetchSeparately();
        }
      } catch {
        // Badges are additive; navigation stays usable if this fails.
      } finally {
        inFlight = false;
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    refresh();
    const interval = setInterval(refresh, POLL_MS);
    window.addEventListener("community:unread-refresh", refresh);
    window.addEventListener("cart:changed", refresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("community:unread-refresh", refresh);
      window.removeEventListener("cart:changed", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <BadgeCountsContext.Provider value={counts}>{children}</BadgeCountsContext.Provider>;
}
