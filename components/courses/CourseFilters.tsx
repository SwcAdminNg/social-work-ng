"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search, Check, SlidersHorizontal } from "lucide-react";
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
  LANGUAGE: "Language"
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

  const catalogOptions = catalogs.map(c => ({
    value: c.slug,
    label: c.name,
    count: c.total_courses
  }));

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  const levelOptions = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
  ];

  return (
    <div className="bg-white dark:bg-[#111a14] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 md:p-6 mb-10 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#2D6A4F]/20 dark:text-[#52b788] rounded-lg">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Find Your Perfect Course</h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
        {/* Search */}
        <div className="relative w-full lg:w-[35%]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-[#0a0f0c] border border-gray-200 dark:border-gray-800 rounded-xl text-[0.95rem] focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] dark:text-gray-100 transition-all outline-none"
          />
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 w-full lg:w-[65%] lg:justify-end">
          {/* Catalog */}
          <div className="w-full sm:w-auto sm:flex-1 lg:flex-none">
            <SearchableDropdown
              options={catalogOptions}
              value={currentCatalog}
              onChange={(val) => updateFilter("catalog", val)}
              placeholder="Catalogs"
              searchPlaceholder="Search catalogs..."
            />
          </div>

          {/* Category */}
          <div className="w-full sm:w-auto sm:flex-1 lg:flex-none">
            <SearchableDropdown
              options={categoryOptions}
              value={currentCategory}
              onChange={(val) => updateFilter("category", val)}
              placeholder="Categories"
              searchPlaceholder="Search categories..."
            />
          </div>

          {/* Level */}
          <div className="w-full sm:w-auto sm:flex-1 lg:flex-none">
            <SearchableDropdown
              options={levelOptions}
              value={currentLevel}
              onChange={(val) => updateFilter("level", val)}
              placeholder="Levels"
              showSearch={false}
            />
          </div>

          {/* Is Free Toggle */}
          <button
            onClick={() => updateFilter("is_free", currentIsFree ? "" : "true")}
            className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border text-[0.95rem] font-bold transition-all ${
              currentIsFree 
                ? "bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-md shadow-green-900/20" 
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-[#0a0f0c] dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
            }`}
          >
            <div className={`w-4 h-4 flex items-center justify-center rounded border transition-colors ${currentIsFree ? "bg-white border-white" : "border-gray-400 dark:border-gray-600"}`}>
              {currentIsFree && <Check className="w-3 h-3 text-[#2D6A4F]" strokeWidth={4} />}
            </div>
            Free Only
          </button>
        </div>
      </div>
    </div>
  );
}
