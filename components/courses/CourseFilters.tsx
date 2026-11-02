"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { SearchableDropdown } from "./SearchableDropdown";

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
  LANGUAGE: "Language",
};

interface Catalog {
  id: string;
  name: string;
  slug: string;
  total_courses: number;
}

export function CourseFilters({ catalogs = [] }: { catalogs?: Catalog[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentCatalog = searchParams.get("catalog") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLevel = searchParams.get("level") || "";
  const currentIsFree = searchParams.get("is_free") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [showFilters, setShowFilters] = useState(false);
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  const handleToggleFilters = () => {
    if (showFilters) {
      setShowFilters(false);
      setIsFullyOpen(false);
    } else {
      setShowFilters(true);
      setTimeout(() => setIsFullyOpen(true), 400);
    }
  };

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
    [searchParams],
  );

  const updateFilter = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString(name, value));
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        router.push(pathname + "?" + createQueryString("search", searchTerm));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentSearch, pathname, createQueryString, router]);

  const catalogOptions = catalogs.map((c) => ({
    value: c.slug,
    label: c.name,
    count: c.total_courses,
  }));

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(
    ([value, label]) => ({ value, label }),
  );

  const levelOptions = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
  ];

  const priceOptions = [
    { value: "true", label: "Free" },
    { value: "false", label: "Premium" },
  ];

  const activeFiltersCount = [
    currentCatalog,
    currentCategory,
    currentLevel,
    currentIsFree,
  ].filter(Boolean).length;

  return (
    <div className="w-full mb-10 flex flex-col items-end relative z-40">
      {/* Default Collapsed State: Single Icon Button */}
      {!showFilters && (
        <button
          onClick={handleToggleFilters}
          className="inline-flex items-center gap-3 min-h-[50px] px-6 rounded-full bg-[#14402F] text-white text-[0.92rem] font-bold hover:bg-[#0c2a1e] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14402F]/40"
        >
          <Search className="w-4.5 h-4.5" aria-hidden="true" />
          <span>Search and filters</span>

          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center min-w-[22px] h-[22px] bg-[#EBA937] text-[#10291E] rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded State: The full filter component */}
      <div
        className={`grid transition-all duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] w-full origin-top-right ${
          showFilters
            ? "grid-rows-[1fr] opacity-100 scale-100"
            : "grid-rows-[0fr] opacity-0 scale-95"
        }`}
      >
        <div className={isFullyOpen ? "overflow-visible" : "overflow-hidden"}>
          <div className="bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 rounded-[28px] p-5 md:p-6 flex flex-col gap-5 mt-2 relative">
            {/* Header & Close Button */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#0F1A14] text-[#2D6A4F] dark:text-[#74c69d] ring-1 ring-black/5 dark:ring-white/10">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="text-[1.1rem] font-bold tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]">
                  Search and filters
                </h3>
              </div>

              <button
                onClick={handleToggleFilters}
                aria-label="Close filters"
                className="p-2 rounded-full text-gray-500 dark:text-[#A3B3A9] hover:bg-white dark:hover:bg-[#0F1A14] hover:text-gray-900 dark:hover:text-[#ECF2EE] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full">
              {/* Search */}
              <div className="relative w-full lg:w-auto lg:flex-1 min-w-[280px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  autoComplete="off"

                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-white/[0.06] text-[1rem] text-gray-900 dark:text-[#ECF2EE] ring-1 ring-inset ring-transparent outline-none transition-[background-color,box-shadow] duration-200 placeholder:text-gray-500 dark:placeholder:text-[#A3B3A9] hover:ring-black/10 dark:hover:ring-white/15 focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>

              {/* Catalog */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <SearchableDropdown
                  options={catalogOptions}
                  value={currentCatalog}
                  onChange={(val) => updateFilter("catalog", val)}
                  placeholder="Catalogs"
                  searchPlaceholder="Search catalogs..."
                />
              </div>

              {/* Category */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <SearchableDropdown
                  options={categoryOptions}
                  value={currentCategory}
                  onChange={(val) => updateFilter("category", val)}
                  placeholder="Categories"
                  searchPlaceholder="Search categories..."
                />
              </div>

              {/* Level */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <SearchableDropdown
                  options={levelOptions}
                  value={currentLevel}
                  onChange={(val) => updateFilter("level", val)}
                  placeholder="Levels"
                  showSearch={false}
                />
              </div>

              {/* Price */}
              <div className="w-full sm:w-auto flex-1 sm:flex-none">
                <SearchableDropdown
                  options={priceOptions}
                  value={currentIsFree}
                  onChange={(val) => updateFilter("is_free", val)}
                  placeholder="Prices"
                  showSearch={false}
                />
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => router.push(pathname)}
                  className="w-full sm:w-auto min-h-[50px] px-5 rounded-full text-[0.9rem] font-bold text-[#14402F] dark:text-[#C3D1C8] bg-white dark:bg-[#0F1A14] ring-1 ring-black/10 dark:ring-white/10 hover:bg-[#e2efe8] dark:hover:bg-[#15241b] transition-colors flex-shrink-0 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
