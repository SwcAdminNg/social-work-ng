"use client";

import Link from "next/link";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  CircleHelp,
  MessageSquare,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { IconMenu } from "./icons";
import { NotificationCenter } from "./notifications/NotificationCenter";

type DashboardOverviewCountEvent = CustomEvent<{
  unread_community_messages_count?: number;
  cart_item_count?: number;
  open_support_tickets_count?: number;
}>;

function badgeLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function DashboardHeader() {
  const { data: session } = useSession();
  const { setMobileOpen, toggleCollapsed } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [openSupportTicketsCount, setOpenSupportTicketsCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const defaultSearch = searchParams.get("search") ?? "";
  const displayName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Learner";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "L";
  const avatarUrl = session?.user?.image;
  const avatarImageUrl =
    avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/proxy/community/unread-count");
        const json = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          setUnreadCount(Number(json?.data?.total_unread) || 0);
        }
      } catch {
        // Badge is additive; header should stay usable if this fails.
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    window.addEventListener("community:unread-refresh", fetchUnreadCount);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("community:unread-refresh", fetchUnreadCount);
    };
  }, []);

  useEffect(() => {
    function handleOverviewCounts(event: Event) {
      const detail = (event as DashboardOverviewCountEvent).detail;
      if (typeof detail?.unread_community_messages_count === "number") {
        setUnreadCount(Math.max(0, detail.unread_community_messages_count));
      }
      if (typeof detail?.cart_item_count === "number") {
        setCartItemCount(Math.max(0, detail.cart_item_count));
      }
      if (typeof detail?.open_support_tickets_count === "number") {
        setOpenSupportTicketsCount(
          Math.max(0, detail.open_support_tickets_count),
        );
      }
    }

    window.addEventListener("dashboard:overview-counts", handleOverviewCounts);
    return () =>
      window.removeEventListener(
        "dashboard:overview-counts",
        handleOverviewCounts,
      );
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] flex-shrink-0 items-center justify-between gap-3 border-b border-[#e5e3ee] bg-white/90 px-4 backdrop-blur-xl dark:border-[#262a3d] dark:bg-[#111525]/90 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] lg:hidden"
        >
          <IconMenu />
        </button>

        <button
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] lg:flex"
        >
          <IconMenu />
        </button>

        <Form
          action="/dashboard/course-catalogue"
          className="relative w-full max-w-[560px]"
        >
          <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            type="search"
            defaultValue={defaultSearch}
            autoComplete="off"

            placeholder="Search courses, lessons, resources..."
            className="h-10 sm:h-11 w-full rounded-md border border-[#e2e8ea] bg-white pl-9 sm:pl-12 pr-3 sm:pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-[#273343] dark:bg-[#0f1726] dark:text-slate-100 dark:focus:border-[#52b788]"
          />
        </Form>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
        <NotificationCenter />

        <Link
          href="/dashboard/community"
          aria-label="Messages"
          className="relative hidden h-10 w-10 items-center justify-center rounded-md text-slate-600 no-underline transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] sm:flex"
        >
          <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-[#111525]">
              {badgeLabel(unreadCount)}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/cart"
          aria-label="Cart"
          className="relative hidden h-10 w-10 items-center justify-center rounded-md text-slate-600 no-underline transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] sm:flex"
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={1.9} />
          {cartItemCount > 0 && (
            <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-[#111525]">
              {badgeLabel(cartItemCount)}
            </span>
          )}
        </Link>

        <Link
          href="/dashboard/support-tickets"
          aria-label="Support tickets"
          className="relative hidden h-10 w-10 items-center justify-center rounded-md text-slate-600 no-underline transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] md:flex"
        >
          <CircleHelp className="h-5 w-5" strokeWidth={1.9} />
          {openSupportTicketsCount > 0 && (
            <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-[#111525]">
              {badgeLabel(openSupportTicketsCount)}
            </span>
          )}
        </Link>

        <div className="relative ml-1 sm:ml-2" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className="flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-[#eef8f2] dark:hover:bg-[#52b788]/12 sm:gap-3 sm:px-2"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#2D6A4F] text-sm font-extrabold text-white shadow-[0_10px_22px_-15px_rgba(45,106,79,0.9)] dark:bg-[#52b788] dark:text-[#06130d]">
              {avatarImageUrl ? (
                <img
                  src={avatarImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setFailedAvatarUrl(avatarImageUrl)}
                />
              ) : (
                avatarInitial
              )}
            </span>
            <span className="hidden min-w-0 flex-col leading-tight lg:flex">
              <span className="max-w-40 truncate text-sm font-extrabold text-slate-950 dark:text-white">
                {displayName}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Learner
              </span>
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-200 lg:block ${
                profileOpen ? "rotate-180" : ""
              }`}
              strokeWidth={2}
            />
          </button>

          <div
            hidden={!profileOpen}
            className={`absolute right-0 mt-2 w-64 z-50 origin-top-right rounded-lg border border-[#e5e3ee] bg-white shadow-xl transition-all duration-150 dark:border-[#262a3d] dark:bg-[#111525] ${
              profileOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-1 border-b border-[#eceaf4] p-4 dark:border-[#262a3d]">
              <p className="font-extrabold text-slate-950 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {session?.user?.email || "No email provided"}
              </p>
            </div>
            <div className="p-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-[#f7fcf9] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7]"
              >
                Personalize & Manage Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
