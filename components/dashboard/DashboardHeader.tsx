"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getPageTitle } from "./nav-items";
import { useSidebar } from "./SidebarContext";
import { IconBell, IconMenu } from "./icons";
import { LogoutButton } from "./LogoutButton";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Quiz result is ready",
    detail: "Your “Child Safeguarding Basics” quiz has been graded.",
    time: "2h ago",
  },
  {
    id: 2,
    title: "New course material",
    detail: "A new module was added to your enrolled course.",
    time: "1d ago",
  },
  {
    id: 3,
    title: "Order confirmed",
    detail: "Your order #SWC-1042 has been confirmed.",
    time: "3d ago",
  },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { setMobileOpen } = useSidebar();
  const title = getPageTitle(pathname);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-[72px] flex flex-shrink-0 items-center justify-between gap-3 border-b border-[#e5e3ee] bg-white/90 px-4 backdrop-blur-xl dark:border-[#262a3d] dark:bg-[#111525]/90 sm:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile sidebar trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] lg:hidden"
        >
          <IconMenu />
        </button>

        <h1 className="truncate text-lg font-bold text-slate-950 dark:text-white sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7]"
          >
            <IconBell />
            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#f43f5e] ring-2 ring-white dark:ring-[#111525]" />
          </button>

          <div
            className={`absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] origin-top-right rounded-2xl border border-[#e5e3ee] bg-white shadow-xl transition-all duration-150 dark:border-[#262a3d] dark:bg-[#111525] ${
              notifOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#eceaf4] px-4 py-3 dark:border-[#262a3d]">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Notifications
              </p>
              <span className="text-xs font-medium text-[#2D6A4F] dark:text-[#52b788]">
                {NOTIFICATIONS.length} new
              </span>
            </div>
            <ul className="list-none m-0 p-2 max-h-80 overflow-y-auto">
              {NOTIFICATIONS.map((n) => (
                <li key={n.id}>
                  <button className="flex w-full cursor-pointer flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#f7fcf9] dark:hover:bg-[#52b788]/12">
                    <span className="text-sm font-medium text-slate-950 dark:text-gray-100">
                      {n.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {n.detail}
                    </span>
                    <span className="text-[0.7rem] text-gray-400 dark:text-gray-600 mt-0.5">
                      {n.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Logout */}
        <LogoutButton />
      </div>
    </header>
  );
}
