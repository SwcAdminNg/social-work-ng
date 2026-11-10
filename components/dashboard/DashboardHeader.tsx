"use client";

import Link from "next/link";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Award,
  Camera,
  CreditCard,
  Globe,
  LifeBuoy,
  Menu,
  Moon,
  Search,
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
import { IconChatBubble } from "./icons";

/** Example searches the placeholder types out, in turn. */
const TYPING_PHRASES = [
  "Search courses, topics, instructors",
  "Try “child protection”",
  "Try “case management”",
  "Try “mental health first aid”",
  "Try “ethics in social work”",
  "Try “counselling skills”",
];

const menuLinks = [
  { label: "Certificates", href: "/dashboard/certificates", icon: Award },
  { label: "Payment & billing", href: "/dashboard/orders", icon: CreditCard },
  { label: "Support tickets", href: "/dashboard/support-tickets", icon: LifeBuoy, badge: "support" as const },
];

function Avatar({
  url,
  initial,
  size,
  large,
  onError,
}: {
  url: string | null;
  initial: string;
  size: string;
  large?: boolean;
  onError: () => void;
}) {
  return (
    <span className={`lms-rainbow ${large ? "lms-rainbow--lg" : ""}`}>
      <span className={`grid flex-none place-items-center overflow-hidden rounded-full bg-brand font-semibold text-white ${size}`}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" onError={onError} />
        ) : (
          initial
        )}
      </span>
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
  const firstName = displayName.trim().split(/\s+/)[0] || "there";
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

  // The placeholder types out example searches, then erases them, like a
  // person typing. It is written straight to the input (no re-renders), rests
  // while the field is focused or the tab is hidden, and stays still for
  // people who ask for reduced motion. The field's name comes from its label.
  useEffect(() => {
    const input = searchRef.current;
    if (!input) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let phrase = 0;
    let length = TYPING_PHRASES[0].length;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const resting = document.activeElement === input || document.hidden;
      if (resting) {
        input.placeholder = TYPING_PHRASES[0];
        phrase = 0;
        length = TYPING_PHRASES[0].length;
        deleting = false;
        timer = setTimeout(step, 1500);
        return;
      }
      const text = TYPING_PHRASES[phrase];
      let delay: number;
      if (!deleting) {
        if (length < text.length) {
          length += 1;
          delay = 45 + Math.random() * 55;
        } else {
          deleting = true;
          delay = phrase === 0 ? 2600 : 1700;
        }
      } else if (length > 0) {
        length -= 1;
        delay = 22;
      } else {
        deleting = false;
        phrase = (phrase + 1) % TYPING_PHRASES.length;
        delay = 350;
      }
      input.placeholder = TYPING_PHRASES[phrase].slice(0, length) || " ";
      timer = setTimeout(step, delay);
    };

    timer = setTimeout(step, 2600);
    return () => {
      clearTimeout(timer);
      input.placeholder = TYPING_PHRASES[0];
    };
  }, []);

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
      <div className="relative grid h-[var(--lms-top)] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[1fr_minmax(0,34rem)_1fr] sm:gap-3 lg:gap-5">
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
              placeholder={TYPING_PHRASES[0]}
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
            <Search className="h-5 w-5" strokeWidth={1.9} />
          </button>

          <Link
            href="/dashboard/community"
            aria-label={`Community chat${counts.community ? `, ${counts.community} unread` : ""}`}
            title="Community chat"
            className="lms-icon-btn hidden md:grid"
          >
            <IconChatBubble className="lms-duo h-[21px] w-[21px]" size={21} />
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
            <ShoppingBag className="lms-duo h-5 w-5" strokeWidth={1.9} />
            {counts.cart > 0 && (
              <span className="lms-dot" aria-hidden="true">
                {badgeLabel(counts.cart)}
              </span>
            )}
          </Link>

          <NotificationCenter />

          <div className="relative ml-1" ref={profileRef}>
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
              aria-controls="account-menu"
              aria-label={`Account: ${displayName}`}
              title={email ? `${displayName} (${email})` : displayName}
              className="grid h-11 w-11 cursor-pointer place-items-center rounded-full"
            >
              <Avatar
                url={avatarImageUrl}
                initial={avatarInitial}
                size="h-8 w-8 text-[0.8rem]"
                onError={() => setFailedAvatarUrl(avatarImageUrl)}
              />
            </button>

            {profileOpen && (
              <div
                id="account-menu"
                role="dialog"
                aria-label="Account"
                className="lms-popover lms-gpop"
                style={{ "--pop-w": "23rem" } as React.CSSProperties}
              >
                <div className="lms-scroll overflow-y-auto overscroll-contain p-2">
                  {/* Who is signed in, in the manner of a Google account card */}
                  <div className="relative flex flex-col items-center px-4 pb-5 pt-1 text-center">
                    <p className="m-0 max-w-full truncate px-9 text-[0.82rem] font-medium leading-9 text-ink-2">
                      {email || displayName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        profileButtonRef.current?.focus();
                      }}
                      aria-label="Close account menu"
                      className="lms-gpop-x absolute right-0 top-0"
                    >
                      <X className="h-[18px] w-[18px]" />
                    </button>
                    <div className="relative mt-3">
                      <Avatar
                        url={avatarImageUrl}
                        initial={avatarInitial}
                        size="h-[76px] w-[76px] text-[1.8rem]"
                        large
                        onError={() => setFailedAvatarUrl(avatarImageUrl)}
                      />
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        aria-label="Change profile photo"
                        className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full bg-[var(--lms-gpop-card)] text-ink-2 shadow-[0_0_0_2px_var(--lms-gpop-bg),0_1px_3px_rgba(0,0,0,0.18)] transition-colors hover:text-ink"
                      >
                        <Camera className="h-4 w-4" strokeWidth={2} />
                      </Link>
                    </div>
                    <p className="m-0 mt-3 text-[1.4rem] font-normal tracking-[-0.01em] text-ink">Hi, {firstName}!</p>
                    <Link href="/dashboard/settings" onClick={() => setProfileOpen(false)} className="lms-gpop-outline mt-4">
                      Manage your account
                    </Link>
                  </div>

                  <nav aria-label="Account shortcuts" className="lms-gpop-group">
                    {menuLinks.map(({ label, href, icon: Icon, badge }) => {
                      const count = badge ? counts[badge] : 0;
                      return (
                        <Link key={href} href={href} onClick={() => setProfileOpen(false)} className="lms-gpop-row">
                          <Icon strokeWidth={1.9} aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate">{label}</span>
                          {count > 0 && (
                            <span className="rounded-full bg-[color-mix(in_srgb,var(--sw-green)_14%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-accent">
                              {badgeLabel(count)} open
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="lms-gpop-group flex items-center justify-between gap-3 py-2 pl-[1.1rem] pr-2">
                    <span className="flex items-center gap-[0.9rem] text-[0.9rem] font-medium text-ink">
                      {isDark ? (
                        <Moon className="h-[1.15rem] w-[1.15rem] text-ink-2" strokeWidth={1.9} />
                      ) : (
                        <Sun className="h-[1.15rem] w-[1.15rem] text-ink-2" strokeWidth={1.9} />
                      )}
                      Appearance
                    </span>
                    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-2 rounded-full bg-ink/[0.06] p-[3px] dark:bg-white/[0.07]">
                      {(
                        [
                          { value: "light", label: "Light" },
                          { value: "dark", label: "Dark" },
                        ] as const
                      ).map(({ value, label }) => {
                        const active = (value === "dark") === isDark;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setTheme(value)}
                            className={`h-8 cursor-pointer rounded-full px-3.5 text-[0.8rem] font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                              active
                                ? "bg-card text-ink shadow-[0_1px_2px_rgba(0,0,0,0.14)] dark:bg-[#3a3e3c]"
                                : "text-ink-3 hover:text-ink"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lms-gpop-split mt-1">
                    <Link href="/" onClick={() => setProfileOpen(false)} className="lms-gpop-pill">
                      <Globe className="h-[17px] w-[17px]" strokeWidth={1.9} />
                      Website
                    </Link>
                    <LogoutButton variant="pill" />
                  </div>

                  <p className="m-0 flex items-center justify-center gap-2 pb-1.5 pt-3.5 text-[0.75rem] text-ink-3">
                    <Link href="/privacy-policy" onClick={() => setProfileOpen(false)} className="rounded px-1 text-inherit no-underline hover:text-ink">
                      Privacy Policy
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link href="/terms-of-service" onClick={() => setProfileOpen(false)} className="rounded px-1 text-inherit no-underline hover:text-ink">
                      Terms of Service
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
