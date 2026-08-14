"use client";

import Link from "next/link";
import Form from "next/form";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  MessageSquare,
  Search,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { IconMenu } from "./icons";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Quiz result is ready",
    detail: "Your Child Safeguarding Basics quiz has been graded.",
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
  const { data: session } = useSession();
  const { setMobileOpen, toggleCollapsed } = useSidebar();
  const [notifOpen, setNotifOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            placeholder="Search courses..."
            className="h-10 sm:h-11 w-full rounded-md border border-[#e2e8ea] bg-white pl-9 sm:pl-12 pr-3 sm:pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-[#273343] dark:bg-[#0f1726] dark:text-slate-100 dark:focus:border-[#52b788]"
          />
        </Form>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7]"
          >
            <Bell className="h-5 w-5" strokeWidth={1.9} />
            <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-[#111525]">
              {NOTIFICATIONS.length}
            </span>
          </button>

          <div
            className={`absolute right-0 mt-2 w-80 z-50 max-w-[calc(100vw-2rem)] origin-top-right rounded-lg border border-[#e5e3ee] bg-white shadow-xl transition-all duration-150 dark:border-[#262a3d] dark:bg-[#111525] ${
              notifOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
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
            <ul className="m-0 max-h-80 list-none overflow-y-auto p-2">
              {NOTIFICATIONS.map((notification) => (
                <li key={notification.id}>
                  <button className="flex w-full cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#f7fcf9] dark:hover:bg-[#52b788]/12">
                    <span className="text-sm font-medium text-slate-950 dark:text-gray-100">
                      {notification.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.detail}
                    </span>
                    <span className="mt-0.5 text-[0.7rem] text-gray-400 dark:text-gray-600">
                      {notification.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          aria-label="Messages"
          className="relative hidden h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] sm:flex"
        >
          <MessageSquare className="h-5 w-5" strokeWidth={1.9} />
          <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f43f5e] px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-white dark:ring-[#111525]">
            2
          </span>
        </button>

        <Link
          href="/contact"
          aria-label="Help centre"
          className="hidden h-10 w-10 items-center justify-center rounded-md text-slate-600 no-underline transition-colors hover:bg-[#eef8f2] hover:text-[#2D6A4F] dark:text-slate-300 dark:hover:bg-[#52b788]/12 dark:hover:text-[#b7e4c7] md:flex"
        >
          <CircleHelp className="h-5 w-5" strokeWidth={1.9} />
        </Link>

        <Link
          href="/dashboard/settings"
          className="ml-1 flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 no-underline transition-colors hover:bg-[#eef8f2] dark:hover:bg-[#52b788]/12 sm:ml-2 sm:gap-3 sm:px-2"
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
            className="hidden h-4 w-4 flex-shrink-0 text-slate-500 lg:block"
            strokeWidth={2}
          />
        </Link>
      </div>
    </header>
  );
}
