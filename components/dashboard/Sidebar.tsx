"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowUpRight, ChevronsLeft, Globe, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/generic/ThemeProvider";
import { Contours } from "@/components/site/ui";
import { dashboardNavGroups, isNavItemActive, type NavItem } from "./nav-items";
import { useSidebar } from "./SidebarContext";
import { badgeLabel, useBadgeCounts } from "./BadgeCounts";
import { LogoutButton } from "./LogoutButton";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { mobileOpen, setMobileOpen, collapsed, toggleCollapsed } = useSidebar();
  const counts = useBadgeCounts();
  const { theme, toggle } = useTheme();
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const isDark = theme === "dark";
  // Labels are hidden on the narrow desktop rail, never in the mobile drawer.
  const label = collapsed ? "lg:hidden" : "";

  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Learner";
  const avatarUrl =
    session?.user?.image && session.user.image !== failedAvatar
      ? session.user.image
      : null;

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
        className={`fixed inset-0 z-40 bg-night/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="dashboard-rail"
        aria-label="Dashboard"
        className={`fixed inset-y-0 left-0 z-50 w-[min(88vw,320px)] p-2.5 transition-[width,translate,visibility] duration-500 ease-sw motion-reduce:transition-none lg:p-3 ${
          collapsed ? "lg:w-[var(--lms-rail-min)]" : "lg:w-[var(--lms-rail)]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-[105%] max-lg:invisible"} lg:translate-x-0`}
      >
        <div className="lms-panel flex h-full flex-col rounded-[28px] shadow-[0_30px_70px_-30px_rgba(4,18,11,0.75)]">
          <Contours />

          {/* Brand */}
          <div
            className={`flex h-[76px] flex-none items-center justify-between gap-2 pl-5 pr-3 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Link
              href="/dashboard"
              aria-label="Social Work Consultancy, dashboard home"
              className="flex min-w-0 flex-col no-underline"
            >
              <span
                className={`block overflow-hidden ${collapsed ? "lg:w-[38px]" : ""}`}
              >
                <Image
                  src="/images/logo/swc-logo-on-dark.webp"
                  alt=""
                  width={480}
                  height={133}
                  sizes="160px"
                  priority
                  className="h-auto w-[146px] max-w-none"
                />
              </span>
              <span
                aria-hidden="true"
                className={`mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-gold-light ${label}`}
              >
                <span className="h-px w-3 rounded-full bg-gold" />
                E-Learning Platform
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              aria-expanded={!collapsed}
              aria-controls="dashboard-rail"
              className={`lms-rail-btn hidden h-9 w-9 lg:grid ${collapsed ? "lg:hidden" : ""}`}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="lms-rail-btn lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Dashboard sections"
            className="swcl-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4"
          >
            <div className="flex flex-col gap-5">
              {dashboardNavGroups.map((group, index) => (
                <section key={group.label ?? `primary-${index}`}>
                  {group.label && (
                    <p
                      className={`sw-cap m-0 mb-2 px-3.5 text-white/40 ${label}`}
                    >
                      {group.label}
                    </p>
                  )}
                  {group.label && collapsed && (
                    <span
                      aria-hidden="true"
                      className="mx-auto mb-3 hidden h-px w-6 bg-white/15 lg:block"
                    />
                  )}
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <RailLink
                          item={item}
                          active={isNavItemActive(pathname, item.href)}
                          collapsed={collapsed}
                          count={item.badge ? counts[item.badge] : 0}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </nav>

          {/* Account */}
          <div className="flex-none border-t border-white/10 p-3">
            <Link
              href="/dashboard/settings"
              title={collapsed ? "Profile settings" : undefined}
              className={`flex items-center gap-3 rounded-full bg-white/[0.06] p-1.5 pr-4 text-inherit no-underline transition-colors duration-300 hover:bg-white/[0.12] ${
                collapsed ? "lg:justify-center lg:bg-transparent lg:p-0 lg:hover:bg-transparent" : ""
              }`}
            >
              <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-full bg-gold text-sm font-bold text-[#10231a]">
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
              <span className={`min-w-0 flex-1 leading-tight ${label}`}>
                <span className="block truncate text-sm font-semibold text-white">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-white/55">
                  Learner account
                </span>
              </span>
            </Link>

            <div
              className={`mt-3 flex items-center justify-between gap-2 ${
                collapsed ? "lg:flex-col" : ""
              }`}
            >
              <button
                type="button"
                onClick={toggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Light mode" : "Dark mode"}
                className="lms-rail-btn"
              >
                {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>
              <Link
                href="/"
                aria-label="Back to website"
                title="Back to website"
                className="lms-rail-btn"
              >
                <Globe className="h-[18px] w-[18px]" />
              </Link>
              <LogoutButton variant="rail" />
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                aria-expanded={!collapsed}
                aria-controls="dashboard-rail"
                className={`lms-rail-btn hidden ${collapsed ? "lg:grid" : ""}`}
              >
                <ChevronsLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function RailLink({
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
      className={`lms-nav-link ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
    >
      <span className="lms-nav-icon">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <span className={`min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>
        {item.label}
      </span>
      {count > 0 && (
        <span
          className={`lms-nav-count ${
            collapsed ? "lg:absolute lg:right-2 lg:top-0.5 lg:ml-0" : ""
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
          className={`h-3.5 w-3.5 flex-none opacity-50 ${collapsed ? "lg:hidden" : ""}`}
        />
      )}
    </Link>
  );
}
