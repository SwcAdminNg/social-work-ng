"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu } from "lucide-react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { BadgeCountsProvider, badgeLabel, useBadgeCounts } from "./BadgeCounts";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { PasskeyPrompt } from "./PasskeyPrompt";
import { dashboardTabs, isNavItemActive } from "./nav-items";

function CertificatePhotoBanner() {
  return (
    <div className="lms-rise mx-auto mb-6 flex w-full max-w-[1500px] flex-col gap-4 rounded-[24px] bg-clay-wash p-4 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_30%,transparent)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-clay text-white">
          <Camera className="h-5 w-5" />
        </span>
        <div>
          <p className="m-0 text-[0.95rem] font-semibold text-ink">
            Add a profile photo before you earn a certificate
          </p>
          <p className="m-0 mt-1 max-w-3xl text-sm leading-relaxed text-ink-2">
            Certificates cannot be issued without one. Use a clear, professional
            headshot: the photo on your account when a certificate is issued is
            saved into its PDF for long-term verification.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/settings?profile_photo=certificate"
        className="lms-btn flex-none self-start sm:self-auto"
      >
        Add photo
      </Link>
    </div>
  );
}

/** Small screens: the four main destinations and the full menu, one tap away. */
function MobileTabBar() {
  const pathname = usePathname();
  const counts = useBadgeCounts();
  const { mobileOpen, setMobileOpen } = useSidebar();

  // Pages with their own bar pinned to the foot of the screen keep it to themselves.
  if (/^\/dashboard\/course-catalogue\/[^/]+/.test(pathname)) return null;

  return (
    <nav aria-label="Quick navigation" className="lms-tabbar lms-panel lg:hidden">
      {dashboardTabs.map((tab) => {
        const Icon = tab.icon;
        const count = tab.badge ? counts[tab.badge] : 0;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isNavItemActive(pathname, tab.href) ? "page" : undefined}
            className="lms-tab"
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
            <span>{tab.label}</span>
            {count > 0 && (
              <span className="lms-dot">
                {badgeLabel(count)}
                <span className="sr-only"> unread</span>
              </span>
            )}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-controls="dashboard-rail"
        className="lms-tab"
      >
        <Menu className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
}

function Content({
  children,
  userHasProfilePicture,
}: {
  children: React.ReactNode;
  userHasProfilePicture?: boolean;
}) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const showPhotoBanner =
    userHasProfilePicture === false &&
    !pathname.startsWith("/dashboard/settings");

  return (
    <div
      className={`flex min-h-dvh min-w-0 flex-col transition-[padding] duration-500 ease-sw motion-reduce:transition-none ${
        collapsed ? "lg:pl-[var(--lms-rail-min)]" : "lg:pl-[var(--lms-rail)]"
      }`}
    >
      <DashboardHeader />
      <main
        id="main-content"
        className="min-w-0 flex-1 px-3 pb-32 pt-5 sm:px-5 sm:pt-6 lg:px-7 lg:pb-10"
      >
        {showPhotoBanner && <CertificatePhotoBanner />}
        {children}
      </main>
      <MobileTabBar />
      <PasskeyPrompt />
    </div>
  );
}

export function DashboardShell({
  children,
  userHasProfilePicture,
  fontClassName = "",
}: {
  children: React.ReactNode;
  userHasProfilePicture?: boolean;
  /** Font variable classes for the display and accent faces. */
  fontClassName?: string;
}) {
  return (
    <SidebarProvider>
      <BadgeCountsProvider>
        <div className={`lms-root sw ${fontClassName}`}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-[#10231a]"
          >
            Skip to main content
          </a>
          <Sidebar />
          <Content userHasProfilePicture={userHasProfilePicture}>
            {children}
          </Content>
        </div>
      </BadgeCountsProvider>
    </SidebarProvider>
  );
}
