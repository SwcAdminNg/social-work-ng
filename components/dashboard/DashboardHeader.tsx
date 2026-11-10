"use client";

import Link from "next/link";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Award,
  CreditCard,
  LifeBuoy,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "@/components/generic/ThemeProvider";
import { useSidebar } from "./SidebarContext";
import { badgeLabel, useBadgeCounts } from "./BadgeCounts";
import { getPageTitle } from "./nav-items";
import { NotificationCenter } from "./notifications/NotificationCenter";

const menuLinks = [
  { label: "Profile settings", href: "/dashboard/settings", icon: Settings },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Payment & billing", href: "/dashboard/orders", icon: CreditCard },
  { label: "Support tickets", href: "/dashboard/support-tickets", icon: LifeBuoy },
];

export function DashboardHeader() {
  const { data: session } = useSession();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const counts = useBadgeCounts();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const defaultSearch = searchParams.get("search") ?? "";
  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Learner";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "L";
  const avatarUrl = session?.user?.image;
  const avatarImageUrl =
    avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null;
  const isDark = theme === "dark";

  // The account menu closes on an outside press or Escape.
  useEffect(() => {
    if (!profileOpen) return;
    function onPointer(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  // "/" jumps to search from anywhere that is not already a text field.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      setSearchOpen(true);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[calc(100%+0.9rem)] before:bg-gradient-to-b before:from-paper before:from-45% before:to-transparent sm:px-5 lg:px-7">
      <div className="relative flex h-16 items-center gap-1.5 rounded-full bg-card/85 px-2.5 shadow-[inset_0_0_0_1px_var(--sw-line),0_22px_44px_-34px_rgba(14,31,23,0.7)] backdrop-blur-xl backdrop-saturate-150 sm:gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-rail"
          className="lms-icon-btn lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <p className="sw-title m-0 min-w-0 flex-1 truncate text-[1.05rem] text-ink sm:hidden">
          {getPageTitle(pathname)}
        </p>

        <Form
          action="/dashboard/course-catalogue"
          role="search"
          className={`items-center gap-2 sm:relative sm:flex sm:min-w-0 sm:flex-1 lg:max-w-[520px] ${
            searchOpen
              ? "absolute inset-0 z-10 flex rounded-full bg-card px-2.5 sm:bg-transparent sm:px-0"
              : "hidden"
          }`}
        >
          <label htmlFor="dashboard-search" className="sr-only">
            Search the course catalogue
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-3"
            />
            <input
              ref={searchRef}
              id="dashboard-search"
              name="search"
              type="search"
              defaultValue={defaultSearch}
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Search courses"
              className="h-11 w-full rounded-full bg-paper pl-11 pr-12 text-base text-ink shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--sw-ink)_10%,transparent)] outline-none transition-shadow duration-300 placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sw-green),0_0_0_4px_color-mix(in_srgb,var(--sw-green)_16%,transparent)] focus-visible:outline-none dark:bg-[#0e1913] sm:text-[0.95rem]"
            />
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 hidden h-6 min-w-6 -translate-y-1/2 place-items-center rounded-md border border-line px-1.5 text-xs font-medium text-ink-3 lg:grid"
            >
              /
            </kbd>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
            className="lms-icon-btn sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </Form>

        <div className="ml-auto flex flex-none items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              requestAnimationFrame(() => searchRef.current?.focus());
            }}
            aria-label="Search courses"
            className="lms-icon-btn sm:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          <NotificationCenter />

          <Link
            href="/dashboard/community"
            aria-label={`Community messages${counts.community ? `, ${counts.community} unread` : ""}`}
            className="lms-icon-btn hidden md:grid"
          >
            <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
            {counts.community > 0 && (
              <span className="lms-dot" aria-hidden="true">
                {badgeLabel(counts.community)}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/cart"
            aria-label={`Cart${counts.cart ? `, ${counts.cart} item${counts.cart === 1 ? "" : "s"}` : ""}`}
            className="lms-icon-btn hidden md:grid"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={1.9} />
            {counts.cart > 0 && (
              <span className="lms-dot" aria-hidden="true">
                {badgeLabel(counts.cart)}
              </span>
            )}
          </Link>

          <div className="relative ml-1" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="flex items-center gap-2.5 rounded-full p-1 text-left transition-colors duration-300 hover:bg-ink/[0.06] xl:pr-4"
            >
              <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-full bg-deep text-sm font-bold text-white dark:bg-brand">
                {avatarImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
              <span className="hidden max-w-36 truncate text-sm font-semibold text-ink xl:block">
                {displayName}
              </span>
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="lms-pop absolute right-0 z-50 mt-3 w-72 max-w-[calc(100vw-1.5rem)] rounded-[24px] bg-card p-2 shadow-[inset_0_0_0_1px_var(--sw-line),0_34px_70px_-24px_rgba(4,18,11,0.45)]"
              >
                <div className="px-3.5 pb-3 pt-3">
                  <p className="m-0 truncate text-[0.95rem] font-semibold text-ink">
                    {displayName}
                  </p>
                  <p className="m-0 mt-0.5 truncate text-xs text-ink-3">
                    {session?.user?.email || "No email provided"}
                  </p>
                </div>
                <div className="border-t border-line pt-1.5">
                  {menuLinks.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-ink-2 no-underline transition-colors duration-200 hover:bg-mint hover:text-ink dark:hover:bg-white/[0.07]"
                    >
                      <Icon className="h-[18px] w-[18px] text-accent" strokeWidth={1.9} />
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={toggle}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 text-left text-sm font-medium text-ink-2 transition-colors duration-200 hover:bg-mint hover:text-ink dark:hover:bg-white/[0.07]"
                  >
                    {isDark ? (
                      <Sun className="h-[18px] w-[18px] text-accent" strokeWidth={1.9} />
                    ) : (
                      <Moon className="h-[18px] w-[18px] text-accent" strokeWidth={1.9} />
                    )}
                    {isDark ? "Switch to light mode" : "Switch to dark mode"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
