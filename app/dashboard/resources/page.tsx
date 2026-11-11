import Link from "next/link";
import { cookies } from "next/headers";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  RESOURCE_CATEGORIES,
  formatResourceCategory,
  getResources,
} from "@/lib/resources";
import { PopUpMenu, ViewSwitch } from "@/components/dashboard/PopUpMenu";
import { ResourceSearchBar } from "./ResourceSearchBar";
import { ResourceCard, ResourceRow, look } from "./ResourceCards";
import { LayoutList } from "lucide-react";

export const metadata = {
  title: "Resources | Dashboard | Social Work Nigeria",
};

const PAGE_SIZE = 12;

type Filters = { category?: string; search?: string; access?: string; view?: string };

function buildUrl(filters: Filters, page?: number) {
  const params = new URLSearchParams();
  if (page && page > 1) params.set("page", String(page));
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.access) params.set("access", filters.access);
  if (filters.view === "list") params.set("view", "list");
  const query = params.toString();
  return `/dashboard/resources${query ? `?${query}` : ""}`;
}

export default async function DashboardResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Math.max(1, parseInt(searchParams.page as string) || 1) : 1;
  const category = searchParams.category as string | undefined;
  const search = (searchParams.search as string | undefined) || "";
  const access = searchParams.access as string | undefined;
  const requestedView = searchParams.view as string | undefined;
  const view: "grid" | "list" =
    requestedView === "list" || requestedView === "grid"
      ? requestedView
      : (await cookies()).get("swcl_resources_view")?.value === "list"
        ? "list"
        : "grid";
  const filters: Filters = { category, search, access, view };
  const CategoryIcon = category ? look(category).icon : LayoutList;

  const { items, meta, ok } = await getResources({
    page,
    pageSize: PAGE_SIZE,
    category,
    search,
  });

  const filteredItems =
    access === "available"
      ? items.filter((resource) => resource.can_access === true)
      : access === "locked"
        ? items.filter((resource) => resource.can_access === false)
        : items;

  const totalPages = Math.max(1, meta.total_pages || (meta.has_next ? page + 1 : page));
  const hasNextPage = Boolean(meta.has_next ?? items.length === PAGE_SIZE);
  const hasActiveFilters = Boolean(category || search || access);
  const total = meta.total_items || items.length;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col pb-10">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Resources</h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.98rem] text-ink-2">
          Templates, policy guidance, research and recordings for your practice
          {total > 0 ? `, ${total} in the library.` : "."}
        </p>
      </header>

      <div className="lms-rise mt-5" style={{ "--i": 1 } as React.CSSProperties}>
        <ResourceSearchBar initialSearch={search} />
      </div>


      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-3 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <PopUpMenu
            ariaLabel="Category"
            kind="popup"
            align="left"
            active={Boolean(category)}
            icon={<CategoryIcon className="h-4 w-4" aria-hidden="true" />}
            label={
              <span className="truncate">
                <span className="text-ink-3">Category: </span>
                {category ? formatResourceCategory(category) : "All"}
              </span>
            }
            items={[
              { key: "all", label: "All categories", checked: !category, href: buildUrl({ ...filters, category: undefined }) },
              ...RESOURCE_CATEGORIES.map((item) => ({
                key: item,
                label: formatResourceCategory(item),
                checked: category === item,
                href: buildUrl({ ...filters, category: item }),
              })),
            ]}
          />
          <div role="group" aria-label="Access" className="lms-segmented">
            {[
              { key: undefined, label: "Any" },
              { key: "available", label: "Available" },
              { key: "locked", label: "Locked" },
            ].map((option) => (
              <Link
                key={option.label}
                href={buildUrl({ ...filters, access: option.key })}
                aria-current={access === option.key ? "true" : undefined}
                className="lms-segment !px-3.5 no-underline"
                scroll={false}
              >
                {option.label}
              </Link>
            ))}
          </div>
          </div>
          <ViewSwitch
            view={view}
            gridHref={buildUrl({ ...filters, view: undefined }, page)}
            listHref={buildUrl({ ...filters, view: "list" }, page)}
            cookie="swcl_resources_view"
          />
        </div>
      </div>

      {!ok ? (
        <p role="alert" className="m-0 mt-3 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          Resources could not be loaded right now. Refresh the page or try again in a moment.
        </p>
      ) : filteredItems.length === 0 ? (
        <div className="lms-milk mt-3 flex flex-col items-center px-6 py-14 text-center sm:py-20">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
            <FileText className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">
            {hasActiveFilters ? "No matches" : "The library is empty"}
          </h2>
          <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
            {hasActiveFilters
              ? "Try another category, a different search, or show every access level."
              : "Resources appear here as soon as they are published."}
          </p>
          {hasActiveFilters && (
            <Link href={buildUrl({ view })} className="lms-btn lms-btn--quiet mt-6" scroll={false}>
              Clear filters
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <ul className="lms-course-grid m-0 mt-3 list-none p-0">
          {filteredItems.map((resource, index) => (
            <li key={resource.id} className="lms-rise min-w-0" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
              <ResourceCard resource={resource} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="lms-group m-0 mt-3 list-none p-0">
          {filteredItems.map((resource) => (
            <li key={resource.id}>
              <ResourceRow resource={resource} />
            </li>
          ))}
        </ul>
      )}

      {ok && (page > 1 || hasNextPage) && (
        <div className="mt-8 flex justify-center sm:justify-end">
          <nav className="lms-pager" aria-label="Resource pages">
            {page > 1 ? (
              <Link href={buildUrl(filters, page - 1)} aria-label="Previous page" className="lms-page no-underline">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden="true" className="lms-page opacity-35">
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
            <span className="lms-page" aria-current="page">
              {page}
            </span>
            {totalPages > 1 && <span className="px-1 text-sm text-ink-3">of {totalPages}</span>}
            {hasNextPage ? (
              <Link href={buildUrl(filters, page + 1)} aria-label="Next page" className="lms-page no-underline">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span aria-hidden="true" className="lms-page opacity-35">
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

