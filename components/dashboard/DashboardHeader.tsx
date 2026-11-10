"use client";

import Link from "next/link";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Award,
  ChevronDown,
  CreditCard,
  Globe,
  LifeBuoy,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "@/components/generic/ThemeProvider";
import { useSidebar } from "./SidebarContext";
import { badgeLabel, useBadgeCounts } from "./BadgeCounts";
import { getPageTitle } from "./nav-items";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { LogoutButton } from "./LogoutButton";

const menuLinks = [
  { label: "Profile settings", href: "/dashboard/settings", icon: Settings },
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Payment & billing", href: "/dashboard/orders", icon: CreditCard },
  { label: "Support tickets", href: "/dashboard/support-tickets", icon: LifeBuoy, badge: "support" as const },
];

function Avatar({ url, initial, size, onError }: { url: string | null; initial: string; size: string; onError: () => void }) {
  return (
    <span className={`grid flex-none place-items-center overflow-hidden rounded-full bg-brand font-semibold text-white ${size}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" onError={onError} />
      ) : (
        initial
      )}
    </span>
  );
}

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
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const defaultSearch = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(defaultSearch);
  const [syncedSearch, setSyncedSearch] = useState(defaultSearch);
  // Follow the URL when it changes (a new search, or leaving the catalogue).
  if (syncedSearch !== defaultSearch) {
    setSyncedSearch(defaultSearch);
    setQuery(defaultSearch);
  }
  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Learner";
  const email = session?.user?.email || "";
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "L";
  const avatarUrl = session?.user?.image;
  const avatarImageUrl = avatarUrl && avatarUrl !== failedAvatarUrl ? avatarUrl : null;
  const isDark = theme === "dark";
  const setTheme = (next: "light" | "dark") => {
    if (theme !== next) toggle();
  };

  // The account menu closes on an outside press or Escape; the sign-out
  // confirmation it opens sits outside it, so presses there are ignored.
  useEffect(() => {
    if (!profileOpen) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Element | null;
      if (profileRef.current?.contains(target as Node)) return;
      if (target?.closest?.("[data-keep-popover]")) return;
      setProfileOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector("[data-keep-popover]")) return;
      setProfileOpen(false);
      profileButtonRef.current?.focus();
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
    <header className="lms-top sticky top-0 z-30 px-2 sm:px-4 lg:px-6">
      {/* Three columns: leading controls, the centred search field, trailing actions. */}
      <div className="relative grid h-[var(--lms-top)] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,34rem)_minmax(0,1fr)] sm:gap-4">
        <div className="flex min-w-0 items-center gap-1">
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
          <p className="m-0 min-w-0 truncate text-[1.05rem] font-semibold tracking-[-0.01em] text-ink sm:hidden">
            {getPageTitle(pathname)}
          </p>
        </div>

        <Form
          action="/dashboard/course-catalogue"
          role="search"
          className={`min-w-0 items-center gap-1 sm:static sm:flex ${
            searchOpen ? "lms-search-sheet absolute inset-0 z-10 flex px-1" : "hidden"
          }`}
        >
          <label htmlFor="dashboard-search" className="sr-only">
            Search the course catalogue
          </label>
          <div className="lms-search min-w-0 flex-1">
            <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
            <input
              ref={searchRef}
              id="dashboard-search"
              name="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                if (query) setQuery("");
                else {
                  setSearchOpen(false);
                  event.currentTarget.blur();
                }
              }}
              autoComplete="off"
              enterKeyHint="search"
              placeholder="Search courses, topics, instructors"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="lms-search-clear"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            ) : (
              <kbd aria-hidden="true" className="lms-search-kbd">
                /
              </kbd>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="h-11 flex-none cursor-pointer px-2.5 text-[0.95rem] font-medium text-accent sm:hidden"
          >
            Cancel
          </button>
        </Form>

        <div className="flex flex-none items-center justify-end gap-0.5 sm:gap-1">
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

          <Link
            href="/dashboard/community"
            aria-label={`Community messages${counts.community ? `, ${counts.community} unread` : ""}`}
            title="Community"
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
            title="Cart"
            className="lms-icon-btn hidden md:grid"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.9} />
            {counts.cart > 0 && (
              <span className="lms-dot" aria-hidden="true">
                {badgeLabel(counts.cart)}
              </span>
            )}
          </Link>

          <NotificationCenter />

          <span aria-hidden="true" className="mx-1.5 hidden h-6 w-px bg-line sm:block" />

          <div className="relative" ref={profileRef}>
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-controls="account-menu"
              aria-label="Account menu"
              className={`flex cursor-pointer items-center gap-2 rounded-full p-1 text-left transition-colors duration-200 hover:bg-ink/[0.06] dark:hover:bg-white/[0.07] xl:pr-3 ${
                profileOpen ? "bg-ink/[0.06] dark:bg-white/[0.07]" : ""
              }`}
            >
              <span className="relative">
                <Avatar
                  url={avatarImageUrl}
                  initial={avatarInitial}
                  size="h-9 w-9 text-sm"
                  onError={() => setFailedAvatarUrl(avatarImageUrl)}
                />
                <span aria-hidden="true" className="absolute -bottom-px -right-px h-3 w-3 rounded-full bg-leaf shadow-[0_0_0_2px_var(--sw-paper)]" />
              </span>
              <span className="hidden max-w-36 truncate text-[0.86rem] font-semibold text-ink xl:block">{displayName}</span>
              <ChevronDown
                aria-hidden="true"
                className={`hidden h-4 w-4 text-ink-3 transition-transform duration-300 xl:block ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div
                id="account-menu"
                role="menu"
                aria-label="Account"
                className="lms-popover"
                style={{ "--pop-w": "19rem" } as React.CSSProperties}
              >
                <div className="lms-scroll overflow-y-auto overscroll-contain">
                  {/* Who is signed in */}
                  <div className="relative m-2 overflow-hidden rounded-[18px] bg-[color-mix(in_srgb,var(--sw-green)_8%,transparent)] p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        url={avatarImageUrl}
                        initial={avatarInitial}
                        size="h-12 w-12 text-base"
                        onError={() => setFailedAvatarUrl(avatarImageUrl)}
                      />
                      <div className="min-w-0">
                        <p className="m-0 truncate text-[0.95rem] font-semibold text-ink">{displayName}</p>
                        {email && <p className="m-0 mt-0.5 truncate text-[0.78rem] text-ink-3">{email}</p>}
                        <span className="mt-1.5 inline-flex h-5 items-center rounded-full bg-card px-2 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-accent shadow-[inset_0_0_0_1px_var(--sw-line)]">
                          Learner
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 pb-1">
                    {menuLinks.map(({ label, href, icon: Icon, badge }) => {
                      const count = badge ? counts[badge] : 0;
                      return (
                        <Link key={href} href={href} role="menuitem" onClick={() => setProfileOpen(false)} className="lms-pop-row">
                          <span className="lms-pop-tile">
                            <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{label}</span>
                          {count > 0 && (
                            <span className="rounded-full bg-ink/[0.07] px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-ink-2">
                              {badgeLabel(count)} open
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Appearance */}
                  <div className="mx-2 border-t border-line px-2.5 py-3">
                    <p className="m-0 mb-2 text-[0.7rem] font-semibold tracking-[0.02em] text-ink-3">Appearance</p>
                    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-2 rounded-[12px] bg-ink/[0.055] p-[3px] dark:bg-white/[0.07]">
                      {(
                        [
                          { value: "light", label: "Light", icon: Sun },
                          { value: "dark", label: "Dark", icon: Moon },
                        ] as const
                      ).map(({ value, label, icon: Icon }) => {
                        const active = (value === "dark") === isDark;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setTheme(value)}
                            className={`flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] text-[0.8rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                              active
                                ? "bg-card text-ink shadow-[0_1px_2px_rgba(14,31,23,0.12),0_4px_12px_-6px_rgba(14,31,23,0.25)] dark:bg-[#36443d]"
                                : "text-ink-3 hover:text-ink"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mx-2 border-t border-line py-1.5">
                    <Link href="/" role="menuitem" onClick={() => setProfileOpen(false)} className="lms-pop-row">
                      <span className="lms-pop-tile !bg-ink/[0.06] !text-ink-2 dark:!bg-white/[0.08]">
                        <Globe className="h-[17px] w-[17px]" strokeWidth={1.9} />
                      </span>
                      Back to website
                    </Link>
                    <LogoutButton variant="menu" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
