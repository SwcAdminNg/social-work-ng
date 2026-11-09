import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Info, Search, Sprout, X } from "lucide-react";
import {
  RESOURCE_ACCESS_OPTIONS,
  RESOURCE_CATEGORIES,
  type ResourceCategoryCount,
  type ResourceListResult,
} from "@/lib/resources";
import AccessSelect from "./AccessSelect";
import LibraryCard, { categoryLabel } from "./LibraryCard";
import PageHero from "@/components/site/PageHero";
import { photos } from "@/lib/photos";
import s from "./Library.module.css";

export type LibraryQuery = { search: string; category: string; access: string; page: number };

type Props = {
  query: LibraryQuery;
  result: ResourceListResult;
  counts: ResourceCategoryCount[] | null;
  pageSize: number;
};

function buildHref(query: LibraryQuery, changes: Partial<LibraryQuery>) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  if (next.category) params.set("category", next.category);
  if (next.access) params.set("access", next.access);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/resources?${qs}#library` : "/resources#library";
}

export default function ResourcesLibrary({ query, result, counts, pageSize }: Props) {
  const filtered = Boolean(query.search || query.category || query.access);
  const total = result.meta.total_items ?? result.items.length;
  const totalPages = result.meta.total_pages ?? Math.max(1, Math.ceil(total / pageSize));
  // Nothing published at all: show the "under development" state instead of
  // presenting search and filters over an empty library.
  const libraryEmpty = counts
    ? counts.every((c) => c.count === 0)
    : result.ok && !filtered && total === 0;

  // Only offer categories that contain published material. If counts are not
  // available, fall back to every category.
  const chipCategories: { value: string; count?: number }[] = counts
    ? counts.filter((c) => c.count > 0).map((c) => ({ value: String(c.category), count: c.count }))
    : RESOURCE_CATEGORIES.map((value) => ({ value }));
  if (query.category && !chipCategories.some((c) => c.value === query.category)) {
    chipCategories.push({ value: query.category, count: 0 });
  }
  const allCount = counts?.reduce((sum, c) => sum + c.count, 0);
  const accessLabel = RESOURCE_ACCESS_OPTIONS.find((o) => o.value === query.access)?.label;

  const summary = [
    query.category && categoryLabel(query.category),
    accessLabel,
    query.search && `matching “${query.search}”`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHero
        id="resources-heading"
        eyebrow="Knowledge Hub"
        title="Practical resources for *informed* practice"
        lead="Explore learning materials, practice tools and guidance from Social Work Consultancy Ltd. Find resources to support reflection, professional development and your understanding of social work practice in Nigeria and the Global South."
        body={
          <span className="flex items-start gap-2">
            <Info size={16} className="mt-1 flex-none text-gold-light" aria-hidden="true" />
            <span>
              Check each resource for its intended audience, source, publication or review date, and access
              requirements.
            </span>
          </span>
        }
        photo={photos.readingTea}
        position="70% 30%"
        compact
      />

      <div className={`${s.page} sw-sheet pt-6 md:pt-10`}>
      {!libraryEmpty && (
        <section className={`${s.toolbar} ${s.container}`} aria-label="Search and filter resources">
          <Form action="/resources" className={s.searchForm} role="search">
            <label htmlFor="resource-search" className={s.searchLabel}>
              Search the resource library
            </label>
            <div className={s.searchRow}>
              <div className={s.searchField}>
                <Search size={20} aria-hidden="true" />
                <input
                  key={query.search}
                  id="resource-search"
                  name="search"
                  type="search"
                  className={s.searchInput}
                  placeholder="Search by title or topic"
                  defaultValue={query.search}
                  autoComplete="off"
                  enterKeyHint="search"
                />
              </div>
              <button type="submit" className={s.searchButton}>
                Search
              </button>
            </div>
            {query.category && <input type="hidden" name="category" value={query.category} />}

            <div className={s.filterRow}>
              <nav aria-label="Resource categories">
                <ul className={s.chips}>
                  <li>
                    <Link
                      href={buildHref(query, { category: "", page: 1 })}
                      className={`${s.chipLink} ${!query.category ? s.chipActive : ""}`}
                      aria-current={!query.category ? "page" : undefined}
                      scroll={false}
                    >
                      All
                      {allCount !== undefined && <span className={s.chipCount}>{allCount}</span>}
                    </Link>
                  </li>
                  {chipCategories.map((c) => (
                    <li key={c.value}>
                      <Link
                        href={buildHref(query, { category: c.value, page: 1 })}
                        className={`${s.chipLink} ${query.category === c.value ? s.chipActive : ""}`}
                        aria-current={query.category === c.value ? "page" : undefined}
                        scroll={false}
                      >
                        {categoryLabel(c.value)}
                        {c.count !== undefined && <span className={s.chipCount}>{c.count}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <AccessSelect key={query.access} value={query.access} />
            </div>
          </Form>
        </section>
      )}

      <section id="library" className={`${s.library} ${s.container}`} aria-labelledby="library-heading" style={{ scrollMarginTop: 96 }}>
        <div className={s.libraryHead}>
          <h2 id="library-heading">Explore the resource library</h2>
          {result.ok && !libraryEmpty && (
            <div className={s.resultMeta}>
              <p role="status" aria-live="polite">
                {total} {total === 1 ? "resource" : "resources"}
                {summary && <> · {summary}</>}
              </p>
              {filtered && (
                <Link href="/resources#library" className={s.clearLink} scroll={false}>
                  <X size={16} aria-hidden="true" /> Clear filters
                </Link>
              )}
            </div>
          )}
        </div>

        {!result.ok ? (
          <div className={s.state} role="alert">
            <h3>This resource library is temporarily unavailable.</h3>
            <p>Please try again shortly or contact support if the problem continues.</p>
            <div className={s.stateActions}>
              <Link href="/contact?topic=account" className={`${s.cta} ${s.ctaSecondary}`}>
                Contact support
              </Link>
            </div>
          </div>
        ) : libraryEmpty ? (
          <div className={s.state}>
            <div className={s.stateMedia}>
              <Image
                src="/images/resources/learning-toolkit.webp"
                alt="A planner, notebook and tablet laid out on a desk, ready for study."
                fill
                sizes="420px"
              />
            </div>
            <h3>Our resource library is under development.</h3>
            <p>Explore our courses or contact us about your learning needs.</p>
            <div className={s.stateActions}>
              <Link href="/courses" className={`${s.cta} ${s.ctaPrimary}`}>
                Explore Courses <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/contact?topic=course" className={`${s.cta} ${s.ctaSecondary}`}>
                Contact us
              </Link>
            </div>
          </div>
        ) : result.items.length === 0 ? (
          <div className={s.state}>
            <h3>No resources match your search.</h3>
            <p>Try another keyword or clear your filters.</p>
            <div className={s.stateActions}>
              <Link href="/resources#library" className={`${s.cta} ${s.ctaPrimary}`} scroll={false}>
                Clear filters
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className={s.grid}>
              {result.items.map((resource) => (
                <li key={resource.id}>
                  <LibraryCard resource={resource} />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className={s.pager} aria-label="Resource pages">
                <Link
                  href={buildHref(query, { page: query.page - 1 })}
                  className={s.pagerLink}
                  aria-disabled={query.page <= 1}
                  tabIndex={query.page <= 1 ? -1 : undefined}
                  scroll={false}
                >
                  <ChevronLeft size={18} aria-hidden="true" /> Previous
                </Link>
                <span className={s.pagerStatus}>
                  Page {query.page} of {totalPages}
                </span>
                <Link
                  href={buildHref(query, { page: query.page + 1 })}
                  className={s.pagerLink}
                  aria-disabled={query.page >= totalPages}
                  tabIndex={query.page >= totalPages ? -1 : undefined}
                  scroll={false}
                >
                  Next <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </nav>
            )}
          </>
        )}
      </section>

      <section className={s.closing} aria-labelledby="closing-heading">
        <div className={`${s.container} ${s.closingInner}`}>
          <div className={s.closingTitle}>
            <span className={s.closingIcon} aria-hidden="true">
              <Sprout size={24} />
            </span>
            <h2 id="closing-heading">Put learning into practice</h2>
          </div>
          <p>Explore courses and mentorship to build on your reading and reflection.</p>
          <div className={s.closingActions}>
            <Link href="/courses" className={s.closingGold}>
              Explore Courses <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/mentorship" className={s.closingGhost}>
              Explore Mentorship <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
