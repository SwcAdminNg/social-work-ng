"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, CheckCircle2, LifeBuoy } from "lucide-react";

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order: number;
  is_published: boolean;
}

interface FAQCategory {
  id: string;
  name: string;
  order: number;
  items: FAQItem[];
}

export function FAQContent({
  categories,
  isAuthenticated,
}: {
  categories: FAQCategory[];
  isAuthenticated: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | string>(
    "All",
  );
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const allItems = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, categoryName: cat.name })),
      ),
    [categories],
  );

  const filteredFAQs = useMemo(() => {
    return allItems.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category_id === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allItems, searchTerm, selectedCategory]);

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-[#0a0a0a] flex-1">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="relative mb-2 transform -translate-y-28 z-30">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <div className="w-[3.25rem] h-[3.25rem] bg-gray-50 dark:bg-gray-800/80 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500">
              <Search className="h-6 w-6" />
            </div>
          </div>
          <input
            type="text"
            className="block w-full pl-20 pr-6 py-5 border-0 rounded-2xl text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 transition-all placeholder:text-gray-400"
            autoComplete="off"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto items-center md:flex-wrap md:justify-center gap-3 mb-7 mt-1 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => {
                setSelectedCategory("All");
                setOpenId(null);
              }}
              className={`flex-shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                selectedCategory === "All"
                  ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#2D6A4F] dark:hover:border-[#52b788] hover:text-[#2D6A4F] dark:hover:text-[#52b788]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenId(null);
                }}
                className={`flex-shrink-0 whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                  selectedCategory === cat.id
                    ? "bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#2D6A4F] dark:hover:border-[#52b788] hover:text-[#2D6A4F] dark:hover:text-[#52b788]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* FAQs List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-[#2D6A4F]/50 dark:border-[#52b788]/50 shadow-md"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-800/50"
                  >
                    <span
                      className={`text-[1.05rem] md:text-lg font-bold pr-4 transition-colors ${isOpen ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-gray-900 dark:text-gray-100"}`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? "bg-[#2D6A4F]/10 dark:bg-[#52b788]/10 rotate-180" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 ${isOpen ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-gray-500"}`}
                      />
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800/50 flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-5 h-5 text-[#2D6A4F]/60 dark:text-[#52b788]/60" />
                        </div>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No answers found
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? `We couldn't find any FAQs matching "${searchTerm}". Try another search term, or ask us directly below.`
                  : "We couldn't load the FAQ right now. Try again shortly, or ask us directly below."}
              </p>
            </div>
          )}
        </div>

        {/* Still need help? CTA */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] px-8 py-12 text-center shadow-xl shadow-[#2D6A4F]/20">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <LifeBuoy className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            Still need help?
          </h3>
          <p className="text-[#d1e7dd] max-w-lg mx-auto mb-7 leading-relaxed">
            Can't find your answer above? Open a support ticket and chat live
            with our Support Desk team.
          </p>
          <Link
            href={
              isAuthenticated
                ? "/dashboard/support-tickets?new=1"
                : "/login?callbackUrl=%2Fdashboard%2Fsupport-tickets"
            }
            className="inline-flex items-center gap-2 bg-white text-[#1B4332] font-bold px-7 py-3.5 rounded-xl hover:bg-[#f0fdf4] transition-colors shadow-lg"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
