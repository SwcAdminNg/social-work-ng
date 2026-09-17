"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  LifeBuoy,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";

type FAQAudience = "STUDENT" | "INSTRUCTOR" | "BOTH";
type AudienceFilter = "ALL" | FAQAudience;

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order: number;
  is_published: boolean;
  audience?: FAQAudience;
  keywords?: string[];
  escalation_route?: string;
  related_article_ids?: string[];
}

interface FAQCategory {
  id: string;
  name: string;
  order: number;
  items: FAQItem[];
}

type FAQItemWithCategory = FAQItem & { categoryName: string };

const AUDIENCE_OPTIONS: Array<{
  value: AudienceFilter;
  label: string;
  hint: string;
}> = [
  { value: "ALL", label: "Everyone", hint: "All help articles" },
  { value: "STUDENT", label: "Students", hint: "Learning and account help" },
  {
    value: "INSTRUCTOR",
    label: "Instructors",
    hint: "Teaching and cohort help",
  },
];

function matchesAudience(item: FAQItem, audience: AudienceFilter) {
  return (
    audience === "ALL" || item.audience === audience || item.audience === "BOTH"
  );
}

function searchableText(item: FAQItemWithCategory) {
  return [
    item.question,
    item.answer,
    item.categoryName,
    ...(item.keywords || []),
  ]
    .join(" ")
    .toLowerCase();
}

function cleanCategoryName(name: string) {
  return name.replace(/\s*\((Student|Instructor|Both)\)\s*$/i, "");
}

function displayCategoryName(name: string, audience: AudienceFilter) {
  if (audience === "ALL") {
    return name.replace(/\s*\(Both\)\s*$/i, "");
  }

  return cleanCategoryName(name);
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
  const [selectedAudience, setSelectedAudience] =
    useState<AudienceFilter>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const allItems = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, categoryName: cat.name })),
      ),
    [categories],
  );

  const visibleCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          matchesAudience(item, selectedAudience),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, selectedAudience]);

  const visibleItems = useMemo(
    () =>
      visibleCategories.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, categoryName: cat.name })),
      ),
    [visibleCategories],
  );

  const articleById = useMemo(() => {
    return new Map(allItems.map((item) => [item.id, item]));
  }, [allItems]);

  const categoryIsVisible =
    selectedCategory === "All" ||
    visibleCategories.some((category) => category.id === selectedCategory);
  const activeCategory = categoryIsVisible ? selectedCategory : "All";

  const filteredFAQs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return visibleItems.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category_id === activeCategory;
      const matchesSearch = !query || searchableText(faq).includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, visibleItems]);

  const suggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    return visibleItems
      .filter((faq) => searchableText(faq).includes(query))
      .slice(0, 6);
  }, [searchTerm, visibleItems]);

  const popularKeywords = useMemo(() => {
    const seen = new Set<string>();
    const keywords: string[] = [];

    for (const item of visibleItems) {
      for (const keyword of item.keywords || []) {
        const normalized = keyword.trim();
        const key = normalized.toLowerCase();
        if (!normalized || seen.has(key)) continue;

        seen.add(key);
        keywords.push(normalized);
        if (keywords.length === 8) return keywords;
      }
    }

    return keywords;
  }, [visibleItems]);

  const activeAudienceLabel =
    AUDIENCE_OPTIONS.find((option) => option.value === selectedAudience)
      ?.label || "Everyone";

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const updateAudience = (audience: AudienceFilter) => {
    setSelectedAudience(audience);
    setSelectedCategory("All");
    setOpenId(null);
  };

  const openArticle = (id: string) => {
    setSelectedCategory("All");
    setSelectedAudience("ALL");
    setOpenId(id);
    window.requestAnimationFrame(() => {
      document.getElementById(`faq-${id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const buildSupportHref = (escalationRoute?: string) => {
    const params = new URLSearchParams({ new: "1" });
    if (escalationRoute) {
      params.set("subject", escalationRoute);
      params.set(
        "message",
        `I read the FAQ article for "${escalationRoute}" but still need help.`,
      );
    }

    const supportPath = `/dashboard/support-tickets?${params.toString()}`;
    return isAuthenticated
      ? supportPath
      : `/login?callbackUrl=${encodeURIComponent(supportPath)}`;
  };

  return (
    <section className="flex-1 bg-gray-50 px-4 pb-20 pt-0 dark:bg-[#0a0a0a] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative z-30 -mt-24 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-gray-200/70 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-none sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#2D6A4F] dark:text-[#52b788]">
                  Help Centre
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-950 dark:text-white">
                  Find the right answer faster
                </h2>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {filteredFAQs.length} result{filteredFAQs.length === 1 ? "" : "s"} in{" "}
                {activeAudienceLabel}
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl bg-gray-100 p-1 dark:bg-gray-800 sm:grid-cols-3">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAudience(option.value)}
                  className={`rounded-xl px-4 py-3 text-left transition-all ${
                    selectedAudience === option.value
                      ? "bg-white text-[#1B4332] shadow-sm ring-1 ring-gray-200 dark:bg-gray-950 dark:text-[#b7e4c7] dark:ring-gray-700"
                      : "text-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-900/60"
                  }`}
                >
                  <span className="block text-sm font-extrabold">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs font-medium opacity-75">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <label htmlFor="faq-search" className="sr-only">
                  Search FAQs
                </label>
                <input
                  id="faq-search"
                  type="text"
                  className="block h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-base font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-[#52b788] dark:focus:ring-[#52b788]/10"
                  autoComplete="off"
                  placeholder="Search login, certificate, payment, assessment..."
                  value={searchTerm}
                  onBlur={() => {
                    window.setTimeout(() => setSearchFocused(false), 120);
                  }}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                />

                {searchFocused && suggestions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/70 dark:border-gray-800 dark:bg-gray-950 dark:shadow-none">
                    <div className="border-b border-gray-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                      Suggested answers
                    </div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setSearchTerm(suggestion.question);
                          setSelectedCategory("All");
                          setOpenId(suggestion.id);
                          window.requestAnimationFrame(() => {
                            document
                              .getElementById(`faq-${suggestion.id}`)
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                              });
                          });
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2D6A4F] dark:text-[#52b788]" />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-gray-900 dark:text-white">
                            {suggestion.question}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                            {displayCategoryName(
                              suggestion.categoryName,
                              selectedAudience,
                            )}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="faq-topic"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Topic
                </label>
                <select
                  id="faq-topic"
                  value={activeCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setOpenId(null);
                  }}
                  className="h-14 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 outline-none transition-all focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-[#52b788] dark:focus:ring-[#52b788]/10"
                >
                  <option value="All">All topics</option>
                  {visibleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {displayCategoryName(category.name, selectedAudience)} (
                      {category.items.length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {popularKeywords.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <Tag className="h-3.5 w-3.5" />
                  Popular
                </span>
                {popularKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => {
                      setSearchTerm(keyword);
                      setOpenId(null);
                    }}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:border-[#2D6A4F] hover:text-[#2D6A4F] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-[#52b788] dark:hover:text-[#52b788]"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <BookOpen className="h-4 w-4" />
                Topics
              </p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${
                    activeCategory === "All"
                      ? "bg-[#2D6A4F] text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  All topics
                </button>
                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setOpenId(null);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${
                      activeCategory === category.id
                        ? "bg-[#2D6A4F] text-white"
                        : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="line-clamp-2">
                      {displayCategoryName(category.name, selectedAudience)}
                    </span>
                    <span className="text-xs opacity-70">
                      {category.items.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <article
                    key={faq.id}
                    id={`faq-${faq.id}`}
                    className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 dark:bg-gray-900 ${
                      isOpen
                        ? "border-[#2D6A4F]/50 shadow-lg shadow-[#2D6A4F]/10 dark:border-[#52b788]/50 dark:shadow-none"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${faq.id}-answer`}
                      className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-800/50 sm:px-6"
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-base font-extrabold transition-colors sm:text-lg ${
                            isOpen
                              ? "text-[#2D6A4F] dark:text-[#52b788]"
                              : "text-gray-950 dark:text-gray-100"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {displayCategoryName(
                            faq.categoryName,
                            selectedAudience,
                          )}
                        </span>
                      </span>
                      <span
                        className={`mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                          isOpen
                            ? "rotate-180 bg-[#2D6A4F]/10 dark:bg-[#52b788]/10"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <ChevronDown
                          className={`h-5 w-5 ${
                            isOpen
                              ? "text-[#2D6A4F] dark:text-[#52b788]"
                              : "text-gray-500"
                          }`}
                        />
                      </span>
                    </button>
                    <div
                      id={`faq-${faq.id}-answer`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="flex gap-4 border-t border-gray-100 px-5 pb-6 pt-5 leading-relaxed text-gray-600 dark:border-gray-800/50 dark:text-gray-400 sm:px-6">
                          <div className="mt-1 flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-[#2D6A4F]/60 dark:text-[#52b788]/60" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-4">
                            <p>{faq.answer}</p>

                            {faq.keywords && faq.keywords.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {faq.keywords.slice(0, 6).map((keyword) => (
                                  <button
                                    key={keyword}
                                    type="button"
                                    onClick={() => setSearchTerm(keyword)}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors hover:text-[#2D6A4F] dark:bg-gray-800 dark:text-gray-300 dark:hover:text-[#52b788]"
                                  >
                                    <Tag className="h-3 w-3" />
                                    {keyword}
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            {faq.related_article_ids &&
                            faq.related_article_ids.length > 0 ? (
                              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  Related help
                                </p>
                                <div className="flex flex-col gap-2">
                                  {faq.related_article_ids.map((relatedId) => {
                                    const related = articleById.get(relatedId);
                                    if (!related) return null;

                                    return (
                                      <button
                                        key={relatedId}
                                        type="button"
                                        onClick={() => openArticle(relatedId)}
                                        className="text-left text-sm font-semibold text-[#2D6A4F] hover:underline dark:text-[#52b788]"
                                      >
                                        {related.question}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}

                            {faq.escalation_route ? (
                              <Link
                                href={buildSupportHref(faq.escalation_route)}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#2D6A4F]/20 bg-[#2D6A4F]/5 px-4 py-2 text-sm font-bold text-[#1B4332] transition-colors hover:bg-[#2D6A4F]/10 dark:border-[#52b788]/20 dark:bg-[#52b788]/10 dark:text-[#b7e4c7]"
                              >
                                Still stuck? Contact Support
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
                <p className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  No answers found
                </p>
                <p className="mx-auto max-w-xl text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? `We couldn't find any FAQs matching "${searchTerm}". Try another search term, switch topics, or ask us directly below.`
                    : "We couldn't load the FAQ right now. Try again shortly, or ask us directly below."}
                </p>
              </div>
            )}

            <div className="mt-14 rounded-3xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] px-8 py-12 text-center shadow-xl shadow-[#2D6A4F]/20">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <LifeBuoy className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-2xl font-extrabold text-white md:text-3xl">
                Still need help?
              </h3>
              <p className="mx-auto mb-7 max-w-lg leading-relaxed text-[#d1e7dd]">
                Can&apos;t find your answer above? Open a support ticket and chat live
                with our Support Desk team.
              </p>
              <Link
                href={
                  isAuthenticated
                    ? "/dashboard/support-tickets?new=1"
                    : "/login?callbackUrl=%2Fdashboard%2Fsupport-tickets%3Fnew%3D1"
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-[#1B4332] shadow-lg transition-colors hover:bg-[#f0fdf4]"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
