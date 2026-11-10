"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type BadgeCounts = {
  community: number;
  cart: number;
  support: number;
};

type OverviewCountEvent = CustomEvent<{
  unread_community_messages_count?: number;
  cart_item_count?: number;
  open_support_tickets_count?: number;
}>;

const empty: BadgeCounts = { community: 0, cart: 0, support: 0 };

const BadgeCountsContext = createContext<BadgeCounts>(empty);

/** Unread and open counts shown on the rail, top bar and mobile tab bar. */
export function useBadgeCounts() {
  return useContext(BadgeCountsContext);
}

export function badgeLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function BadgeCountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<BadgeCounts>(empty);

  // Community unread: polled, and refreshed whenever the chat asks for it.
  useEffect(() => {
    let cancelled = false;

    async function fetchUnread() {
      try {
        const res = await fetch("/api/proxy/community/unread-count");
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          const community = Number(json?.data?.total_unread) || 0;
          setCounts((current) => ({ ...current, community }));
        }
      } catch {
        // Badges are additive; navigation stays usable if this fails.
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    window.addEventListener("community:unread-refresh", fetchUnread);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("community:unread-refresh", fetchUnread);
    };
  }, []);

  // The dashboard home already knows every count; it shares them here.
  useEffect(() => {
    function handleOverviewCounts(event: Event) {
      const detail = (event as OverviewCountEvent).detail;
      if (!detail) return;
      setCounts((current) => ({
        community:
          typeof detail.unread_community_messages_count === "number"
            ? Math.max(0, detail.unread_community_messages_count)
            : current.community,
        cart:
          typeof detail.cart_item_count === "number"
            ? Math.max(0, detail.cart_item_count)
            : current.cart,
        support:
          typeof detail.open_support_tickets_count === "number"
            ? Math.max(0, detail.open_support_tickets_count)
            : current.support,
      }));
    }

    window.addEventListener("dashboard:overview-counts", handleOverviewCounts);
    return () =>
      window.removeEventListener("dashboard:overview-counts", handleOverviewCounts);
  }, []);

  return (
    <BadgeCountsContext.Provider value={counts}>{children}</BadgeCountsContext.Provider>
  );
}
