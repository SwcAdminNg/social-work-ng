import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Unlock,
} from "lucide-react";
import {
  RESOURCE_CATEGORIES,
  ResourceRead,
  formatResourceCategory,
  getResources,
} from "@/lib/resources";
import { ResourceSearchBar } from "./ResourceSearchBar";

export const metadata = {
  title: "Resources | Dashboard | Social Work Nigeria",
};

const PAGE_SIZE = 12;

export default async function DashboardResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const category = searchParams.category as string | undefined;
  const search = (searchParams.search as string | undefined) || "";
  const access = searchParams.access as string | undefined;

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

  const availableCount = items.filter((resource) => resource.can_access === true).length;
  const lockedCount = items.filter((resource) => resource.can_access === false).length;
  const totalPages = Math.max(1, meta.total_pages || (meta.has_next ? page + 1 : page));
  const hasNextPage = Boolean(meta.has_next ?? items.length === PAGE_SIZE);
  const hasActiveFilters = Boolean(category || search || access);

  const showingStart = filteredItems.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = filteredItems.length ? showingStart + filteredItems.length - 1 : 0;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 pb-12">
      <section className="overflow-hidden rounded-xl border border-[#dbeee4] bg-gradient-to-br from-white to-[#f3fbf6] shadow-sm dark:border-[#26384d] dark:from-[#111525] dark:to-[#0f1c17]">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e7f6ee] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
              <Sparkles className="h-3.5 w-3.5" />
              Student library
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
              Resources for your practice and learning
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
              Templates, policy guidance, research, and recordings in one focused
              workspace. Available items open immediately, locked items show
              exactly what unlocks them.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-[380px]">
            <MetricCard label="Shown" value={items.length} icon={BookOpen} tone="green" />
            <MetricCard label="Available" value={availableCount} icon={Unlock} tone="blue" />
            <MetricCard label="Locked" value={lockedCount} icon={Lock} tone="amber" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-[#e5e3ee] bg-white p-4 shadow-sm dark:border-[#262a3d] dark:bg-[#111525] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,380px)_1fr] lg:items-center">
          <ResourceSearchBar initialSearch={search} />

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="hidden text-xs font-extrabold uppercase tracking-wide text-slate-400 lg:inline">
              Access
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-[#0f1726]">
              <AccessTab href={buildFilterUrl({ category, search, access: undefined })} active={!access}>
                Any
              </AccessTab>
              <AccessTab href={buildFilterUrl({ category, search, access: "available" })} active={access === "available"}>
                Available
              </AccessTab>
              <AccessTab href={buildFilterUrl({ category, search, access: "locked" })} active={access === "locked"}>
                Locked
              </AccessTab>
            </div>
          </div>
        </div>

        <div className="swcl-sidebar-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip href={buildFilterUrl({ category: undefined, search, access })} active={!category}>
            All categories
          </FilterChip>
          {RESOURCE_CATEGORIES.map((resourceCategory) => (
            <FilterChip
              key={resourceCategory}
              href={buildFilterUrl({ category: resourceCategory, search, access })}
              active={category === resourceCategory}
            >
              {formatResourceCategory(resourceCategory)}
            </FilterChip>
          ))}
        </div>
      </section>

      {!ok ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-10 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-extrabold text-amber-900 dark:text-amber-100">
            Resources could not be loaded right now.
          </p>
          <p className="mt-1 text-sm font-medium text-amber-800/80 dark:text-amber-100/70">
            Please refresh the page or try again in a moment.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-[#111525] sm:p-14">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            <FileText className="h-7 w-7" />
          </div>
          <p className="text-lg font-extrabold text-slate-800 dark:text-white">
            No matching resources.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">
            Try a different category, search term, or access filter.
          </p>
          {hasActiveFilters && (
            <Link
              href="/dashboard/resources"
              className="mt-5 inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0f1726] dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Clear all filters
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Showing {showingStart}-{showingEnd} of this page{" "}
            {meta.total_items ? `· ${meta.total_items} total` : ""}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((resource) => (
              <DashboardResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </>
      )}

      {(page > 1 || hasNextPage) && (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Resource pages">
          <PageLink
            href={buildPageUrl(page - 1, { category, search, access })}
            disabled={page <= 1}
            label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </PageLink>

          <span className="inline-flex h-10 items-center rounded-md bg-slate-50 px-4 text-sm font-extrabold text-slate-600 dark:bg-[#0f1726] dark:text-slate-300">
            Page {page}
            {totalPages > 1 ? ` of ${totalPages}` : ""}
          </span>

          <PageLink
            href={buildPageUrl(page + 1, { category, search, access })}
            disabled={!hasNextPage}
            label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function DashboardResourceCard({ resource }: { resource: ResourceRead }) {
  const isLocked = resource.can_access === false;
  const href = `/resources/${resource.slug || resource.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e3ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#95d5b2] hover:shadow-md dark:border-[#262a3d] dark:bg-[#111525]">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[#e7f6ee] dark:bg-[#0f1726]">
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#2D6A4F] dark:text-[#b7e4c7]">
            {getResourceIcon(resource.category, "large")}
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold ${
            isLocked
              ? "bg-slate-950/80 text-white"
              : "bg-white/95 text-[#2D6A4F] shadow-sm"
          }`}
        >
          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {isLocked ? "Locked" : "Ready"}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            {getResourceIcon(resource.category)}
          </span>
          <span className="truncate text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {formatResourceCategory(resource.category)}
          </span>
        </div>

        <h2 className="line-clamp-2 text-base font-extrabold leading-6 text-slate-950 dark:text-white">
          <Link href={href}>{resource.name}</Link>
        </h2>
        {resource.description && (
          <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
            {resource.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="min-w-0 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
            {isLocked ? getLockedLabel(resource) : "Attachments available"}
          </p>
          <Link
            href={href}
            className={`inline-flex h-9 flex-shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-extrabold transition ${
              isLocked
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                : "bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            }`}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            {isLocked ? "Unlock" : "Open"}
          </Link>
        </div>
      </div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "green" | "blue" | "amber";
}) {
  const styles = {
    green: "bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  };

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white/70 p-2.5 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0f1726]/70 sm:p-3">
      <span className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md sm:h-9 sm:w-9 ${styles[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 flex-shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-xs font-extrabold transition ${
        active
          ? "border-[#2D6A4F] bg-[#2D6A4F] text-white dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d]"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#95d5b2] hover:text-[#2D6A4F] dark:border-slate-800 dark:bg-[#0f1726] dark:text-slate-300 dark:hover:border-[#52b788]/50"
      }`}
    >
      {children}
    </Link>
  );
}

function AccessTab({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-8 flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 text-xs font-extrabold transition sm:flex-none ${
        active
          ? "bg-white text-[#2D6A4F] shadow-sm dark:bg-[#1a2133] dark:text-[#b7e4c7]"
          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      }`}
    >
      {children}
    </Link>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-hidden
        className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 text-sm font-extrabold text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-600"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111525] dark:text-slate-300 dark:hover:bg-slate-900"
    >
      {children}
    </Link>
  );
}

function buildFilterUrl({
  category,
  search,
  access,
}: {
  category?: string;
  search?: string;
  access?: string;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  if (access) params.set("access", access);
  return `/dashboard/resources${params.toString() ? `?${params.toString()}` : ""}`;
}

function buildPageUrl(
  page: number,
  filters: { category?: string; search?: string; access?: string },
) {
  const params = new URLSearchParams();
  params.set("page", String(Math.max(1, page)));
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.access) params.set("access", filters.access);
  return `/dashboard/resources?${params.toString()}`;
}

function getResourceIcon(category?: string, size: "regular" | "large" = "regular") {
  const className = size === "large" ? "h-10 w-10" : "h-4 w-4";
  if (category === "VIDEOS_AND_WEBINARS") return <PlayCircle className={className} />;
  if (category === "USEFUL_LINKS") return <Link2 className={className} />;
  return <FileText className={className} />;
}

function getLockedLabel(resource: ResourceRead) {
  if (resource.access_reason === "LOGIN_REQUIRED") return "Log in to unlock";
  if (resource.access_reason === "ENROLLMENT_REQUIRED") return "Course enrollment required";
  return "Locked";
}
