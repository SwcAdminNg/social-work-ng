"use client";

import { RESOURCE_CATEGORIES, formatResourceCategory } from "@/lib/resources";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Search and category capsules for the resource library. Typing
 * searches after a short pause; a category applies at once. Both live
 * in the address bar so a filtered view can be shared.
 */
export function ResourceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search === currentSearch) return;
      const params = new URLSearchParams(searchParams.toString());
      if (search.trim()) params.set("search", search.trim());
      else params.delete("search");
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [currentSearch, pathname, router, search, searchParams]);

  function setCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearFilters() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  const hasFilters = Boolean(currentCategory || currentSearch);
  const capsule =
    "h-10 flex-shrink-0 rounded-full px-4 text-[0.85rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] cursor-pointer";
  const on = `${capsule} bg-[#14402F] text-white`;
  const off = `${capsule} bg-white dark:bg-[#16231C] text-gray-700 dark:text-[#C3D1C8] ring-1 ring-black/10 dark:ring-white/10 hover:bg-[#EEF5F1] dark:hover:bg-[#1c2d24]`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-[#A3B3A9]"
            aria-hidden="true"
          />
          <label htmlFor="resource-search" className="sr-only">
            Search resources
          </label>
          <input
            id="resource-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search policies, templates, recordings…"
            className="h-14 w-full rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06] pl-12 pr-4 text-[1rem] text-gray-900 dark:text-[#ECF2EE] ring-1 ring-inset ring-transparent outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-gray-500 dark:placeholder:text-[#A3B3A9] hover:ring-black/10 dark:hover:ring-white/15 focus:bg-white dark:focus:bg-[#0F1A14] focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {hasFilters && (
          <button type="button" onClick={clearFilters} className={off}>
            <span className="inline-flex items-center gap-2">
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </span>
          </button>
        )}
      </div>

      <div className="swcl-sidebar-scroll flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
        <button
          type="button"
          onClick={() => setCategory("")}
          aria-pressed={!currentCategory}
          className={!currentCategory ? on : off}
        >
          All
        </button>
        {RESOURCE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategory(category)}
            aria-pressed={currentCategory === category}
            className={currentCategory === category ? on : off}
          >
            {formatResourceCategory(category)}
          </button>
        ))}
      </div>
    </div>
  );
}
