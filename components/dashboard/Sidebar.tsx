"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from "lucide-react";
import { dashboardNavGroups, isNavItemActive, type NavItem } from "./nav-items";
import { useSidebar } from "./SidebarContext";
import { badgeLabel, useBadgeCounts } from "./BadgeCounts";
import { LogoutDialog } from "./LogoutButton";
import { IconLogout } from "./icons";

const FOLDED_KEY = "swcl:side-folded";

const foldListeners = new Set<() => void>();
const subscribeFolded = (callback: () => void) => {
  foldListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    foldListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
};
const readFoldedRaw = () => {
  try {
    return window.localStorage.getItem(FOLDED_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
let memoryFolded = "[]";
function parseFolded(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
function writeFolded(next: string[]) {
  memoryFolded = JSON.stringify(next);
  try {
    window.localStorage.setItem(FOLDED_KEY, memoryFolded);
  } catch {
    /* storage blocked: folding still works for this visit */
  }
  foldListeners.forEach((listener) => listener());
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mobileOpen, setMobileOpen, collapsed, toggleCollapsed } = useSidebar();
  const counts = useBadgeCounts();
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  // Section headers fold their links away, as in a macOS sidebar. Remembered per browser.
  const foldedRaw = useSyncExternalStore(
    subscribeFolded,
    () => {
      const raw = readFoldedRaw();
      return raw === "[]" ? memoryFolded : raw;
    },
    () => "[]",
  );
  const folded = parseFolded(foldedRaw);
  // Labels are hidden on the narrow desktop rail, never in the mobile drawer.
  const label = collapsed ? "lg:hidden" : "";

  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Learner";
  const email = session?.user?.email || "Learner account";
  const avatarUrl =
    session?.user?.image && session.user.image !== failedAvatar
      ? session.user.image
      : null;

  const toggleGroup = (name: string) => {
    writeFolded(
      folded.includes(name) ? folded.filter((n) => n !== name) : [...folded, name],
    );
  };

  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  // The account menu closes on any press outside it, on Escape and on navigation;
  // opening it moves focus to its first item.
  useEffect(() => {
    if (!accountOpen) return;
    const frame = requestAnimationFrame(() =>
      accountRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(),
    );
    const onPress = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPress, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPress, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [accountOpen]);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (accountOpen) setAccountOpen(false);
  }

  // Arrow keys move between the menu's items.
  const onMenuKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home" ? 0
      : event.key === "End" ? items.length - 1
      : event.key === "ArrowDown" ? (index + 1) % items.length
      : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  // The drawer closes on Escape and holds the page still while it is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-night/40 backdrop-blur-[2px] transition-opacity duration-500 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="dashboard-rail"
        aria-label="Dashboard"
        data-collapsed={collapsed || undefined}
        className={`lms-side fixed inset-y-0 left-0 z-50 flex w-[min(86vw,300px)] flex-col transition-[width,translate,visibility] duration-500 ease-sw motion-reduce:transition-none ${
          collapsed ? "lg:w-[var(--lms-rail-min)]" : "lg:w-[var(--lms-rail)]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-[110%] max-lg:invisible"} lg:translate-x-0`}
      >
        {/* Brand and sidebar toggle */}
        <div
          className={`flex h-[var(--lms-top)] flex-none items-center justify-between gap-2 pl-4 pr-2.5 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <Link
            href="/dashboard"
            aria-label="Social Work Consultancy, dashboard home"
            className={`flex min-w-0 items-center no-underline ${collapsed ? "lg:hidden" : ""}`}
          >
            <Image
              src="/images/logo/swc-logo-on-light.webp"
              alt=""
              width={480}
              height={133}
              sizes="140px"
              priority
              className="h-auto w-[132px] dark:hidden"
            />
            <Image
              src="/images/logo/swc-logo-on-dark.webp"
              alt=""
              width={480}
              height={133}
              sizes="140px"
              priority
              className="hidden h-auto w-[132px] dark:block"
            />
          </Link>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="dashboard-rail"
            className="lms-side-btn hidden lg:grid"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.8} />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.8} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lms-side-btn lg:hidden"
          >
            <X className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Dashboard sections"
          className="lms-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1"
        >
          {dashboardNavGroups.map((group, index) => {
            const name = group.label;
            const isFolded = Boolean(name && folded.includes(name) && !collapsed);
            const listId = `side-group-${index}`;
            // A folded section still shows the page you are on.
            const items = isFolded
              ? group.items.filter((item) => isNavItemActive(pathname, item.href))
              : group.items;

            return (
              <section key={name ?? `primary-${index}`} className={index ? "mt-4" : ""}>
                {name && (
                  <>
                    <h2 className={`m-0 ${label}`}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(name)}
                        aria-expanded={!isFolded}
                        aria-controls={listId}
                        className="lms-side-head"
                      >
                        {name}
                        <ChevronRight
                          aria-hidden="true"
                          className="lms-side-chev h-3.5 w-3.5"
                          strokeWidth={2.2}
                        />
                      </button>
                    </h2>
                    {collapsed && (
                      <span
                        aria-hidden="true"
                        className="mx-auto mb-2 hidden h-px w-6 bg-line lg:block"
                      />
                    )}
                  </>
                )}
                <ul id={listId} className="m-0 flex list-none flex-col gap-px p-0">
                  {items.map((item) => (
                    <li key={item.href}>
                      <SideLink
                        item={item}
                        active={isNavItemActive(pathname, item.href)}
                        collapsed={collapsed}
                        count={item.badge ? counts[item.badge] : 0}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>

        {/* Account: the profile row opens a small menu above it */}
        <div ref={accountRef} className="relative flex-none px-3 pb-3 pt-1">
          {accountOpen && (
            <div
              id="side-account-menu"
              role="menu"
              aria-label="Account"
              onKeyDown={onMenuKey}
              className={`lms-menu ${collapsed ? "lg:!bottom-3 lg:!left-[calc(100%+8px)] lg:!right-auto lg:!w-56" : ""}`}
            >
              <div className="px-2.5 pb-1.5 pt-1">
                <p className="m-0 truncate text-[0.8rem] font-semibold text-ink">{displayName}</p>
                <p className="m-0 truncate text-[0.72rem] text-ink-3">{email}</p>
              </div>
              <div role="separator" className="lms-menu-sep" />
              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
                className="lms-menu-item"
              >
                <UserRound className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                View profile
              </Link>
              <div role="separator" className="lms-menu-sep" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountOpen(false);
                  setLogoutOpen(true);
                }}
                className="lms-menu-item lms-menu-item--destructive"
              >
                <IconLogout size={16} />
                Log out
              </button>
            </div>
          )}

          <button
            ref={accountButtonRef}
            type="button"
            onClick={() => setAccountOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-controls="side-account-menu"
            title={collapsed ? displayName : undefined}
            className={`lms-side-account ${collapsed ? "lg:mx-auto lg:w-auto lg:justify-center lg:p-1" : ""}`}
          >
            <span className="lms-rainbow">
              <span className="grid h-8 w-8 flex-none place-items-center overflow-hidden rounded-full bg-brand text-[0.8rem] font-semibold text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setFailedAvatar(avatarUrl)}
                  />
                ) : (
                  displayName.trim().charAt(0).toUpperCase() || "L"
                )}
              </span>
            </span>
            <span className={`min-w-0 flex-1 text-left leading-tight ${label}`}>
              <span className="block truncate text-[0.86rem] font-semibold text-ink">{displayName}</span>
              <span className="mt-0.5 block truncate text-[0.74rem] text-ink-3">{email}</span>
            </span>
            <ChevronsUpDown aria-hidden="true" className={`h-4 w-4 flex-none text-ink-3 ${label}`} />
          </button>
        </div>
      </aside>
      <LogoutDialog
        open={logoutOpen}
        onClose={() => {
          setLogoutOpen(false);
          // The menu item that opened it is gone; return focus to the profile row.
          requestAnimationFrame(() => accountButtonRef.current?.focus());
        }}
      />
    </>
  );
}

function SideLink({
  item,
  active,
  collapsed,
  count,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  count: number;
}) {
  const Icon = item.icon;
  const leavesDashboard = !item.href.startsWith("/dashboard");

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`lms-side-link ${collapsed ? "lg:mx-auto lg:w-11 lg:justify-center lg:px-0" : ""}`}
    >
      <span className="lms-side-icon">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
      <span className={`min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
        {item.label}
      </span>
      {count > 0 && (
        <span
          className={`lms-side-count ${
            collapsed ? "lg:absolute lg:-right-0.5 lg:-top-0.5 lg:ml-0" : ""
          }`}
        >
          <span className="sr-only">, </span>
          {badgeLabel(count)}
          <span className="sr-only"> new</span>
        </span>
      )}
      {leavesDashboard && (
        <ArrowUpRight
          aria-hidden="true"
          className={`h-3.5 w-3.5 flex-none opacity-45 ${collapsed ? "lg:hidden" : ""}`}
        />
      )}
    </Link>
  );
}
