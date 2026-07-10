"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  DEVELOPMENT: "Development",
  BUSINESS: "Business",
  FINANCE_ACCOUNTING: "Finance & Accounting",
  IT_SOFTWARE: "IT & Software",
  OFFICE_PRODUCTIVITY: "Office Productivity",
  PERSONAL_DEVELOPMENT: "Personal Development",
  DESIGN: "Design",
  MARKETING: "Marketing",
  HEALTH_FITNESS: "Health & Fitness",
  MUSIC: "Music",
  TEACHING_ACADEMICS: "Teaching & Academics",
  PHOTOGRAPHY_VIDEO: "Photography & Video",
  LIFESTYLE: "Lifestyle",
  LANGUAGE: "Language"
};

export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLevel = searchParams.get("level") || "";
  const currentIsFree = searchParams.get("is_free") === "true";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Sync state if URL changes from outside (e.g. back button)
  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset to page 1 on filter change
      params.set("page", "1");
      return params.toString();
    },
    [searchParams]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        router.push(pathname + "?" + createQueryString("search", searchTerm));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, pathname, createQueryString, router]);

  return (
    <div className="bg-white dark:bg-[#111a14] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-8 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
      {/* Search */}
      <div className="relative w-full xl:w-[40%]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-[#0a0f0c] border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:text-gray-100 transition-all outline-none"
        />
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
        {/* Category */}
        <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
          <select
            value={currentCategory}
            onChange={(e) => router.push(pathname + "?" + createQueryString("category", e.target.value))}
            className="appearance-none w-full sm:w-48 bg-gray-50 dark:bg-[#0a0f0c] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] font-medium cursor-pointer"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Level */}
        <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
          <select
            value={currentLevel}
            onChange={(e) => router.push(pathname + "?" + createQueryString("level", e.target.value))}
            className="appearance-none w-full sm:w-40 bg-gray-50 dark:bg-[#0a0f0c] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] font-medium cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Is Free Toggle */}
        <button
          onClick={() => router.push(pathname + "?" + createQueryString("is_free", currentIsFree ? "" : "true"))}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            currentIsFree 
              ? "bg-[#2D6A4F]/10 border-[#2D6A4F]/30 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:border-[#2D6A4F]/40 dark:text-[#52b788]" 
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-[#0a0f0c] dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
          }`}
        >
          <div className={`w-4 h-4 flex items-center justify-center rounded border ${currentIsFree ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-gray-300 dark:border-gray-600"}`}>
            {currentIsFree && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          Free Only
        </button>
      </div>
    </div>
  );
}
