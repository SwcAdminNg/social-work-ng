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
  Search,
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

export const metadata = {
  title: "Resources | Dashboard | Social Work Nigeria",
};

export default async function DashboardResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const category = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;
  const access = searchParams.access as string | undefined;

  const { items, meta, ok } = await getResources({
    page,
    pageSize: 12,
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
  const hasNextPage = Boolean(meta.has_next ?? items.length === 12);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="overflow-hidden rounded-lg border border-[#dbeee4] bg-white shadow-sm dark:border-[#26384d] dark:bg-[#111525]">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-[#e7f6ee] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
              <Sparkles className="h-3.5 w-3.5" />
              Student library
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Resources for your practice and learning
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
              Find templates, policy guidance, research, recordings, and course extras in one focused workspace. Available items open immediately, while locked items show exactly what unlocks them.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Shown"
              value={items.length}
              icon={BookOpen}
              tone="green"
            />
            <MetricCard
              label="Available"
              value={availableCount}
              icon={Unlock}
              tone="blue"
            />
            <MetricCard
              label="Locked"
              value={lockedCount}
              icon={Lock}
              tone="amber"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#e5e3ee] bg-white p-4 shadow-sm dark:border-[#262a3d] dark:bg-[#111525] sm:p-5">
        <form className="grid gap-4 xl:grid-cols-[minmax(280px,420px)_1fr_auto] xl:items-start">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            {category && <input type="hidden" name="category" value={category} />}
            {access && <input type="hidden" name="access" value={access} />}
            <input
              name="search"
              type="search"
              defaultValue={search || ""}
              placeholder="Search dashboard resources..."
              className="h-11 w-full rounded-md border border-[#e2e8ea] bg-white pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-[#273343] dark:bg-[#0f1726] dark:text-white dark:focus:border-[#52b788]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildFilterUrl({ category: undefined, search, access })} active={!category}>
              All
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

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <FilterChip href={buildFilterUrl({ category, search, access: undefined })} active={!access}>
              Any access
            </FilterChip>
            <FilterChip href={buildFilterUrl({ category, search, access: "available" })} active={access === "available"}>
              Available
            </FilterChip>
            <FilterChip href={buildFilterUrl({ category, search, access: "locked" })} active={access === "locked"}>
              Locked
            </FilterChip>
          </div>
        </form>
      </section>

      {!ok ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-extrabold text-amber-900 dark:text-amber-100">
            Resources could not be loaded right now.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#111525]">
          <p className="text-lg font-extrabold text-slate-800 dark:text-white">
            No matching resources.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Try a different category, search term, or access filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map((resource) => (
            <DashboardResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {page > 1 ? (
          <Link
            href={buildPageUrl(page - 1, { category, search, access })}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111525] dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 text-sm font-extrabold text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-600">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
          Page {page}
        </span>

        {hasNextPage ? (
          <Link
            href={buildPageUrl(page + 1, { category, search, access })}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111525] dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 text-sm font-extrabold text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-600">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}

function DashboardResourceCard({ resource }: { resource: ResourceRead }) {
  const isLocked = resource.can_access === false;
  const href = `/resources/${resource.slug || resource.id}`;

  return (
    <article className="group grid min-h-[220px] overflow-hidden rounded-lg border border-[#e5e3ee] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#95d5b2] hover:shadow-md dark:border-[#262a3d] dark:bg-[#111525] sm:grid-cols-[150px_minmax(0,1fr)]">
      <Link href={href} className="relative min-h-40 overflow-hidden bg-[#e7f6ee] dark:bg-[#0f1726]">
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center text-[#2D6A4F] dark:text-[#b7e4c7]">
            {getResourceIcon(resource.category, "large")}
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-extrabold ${
            isLocked
              ? "bg-slate-950/80 text-white"
              : "bg-white/95 text-[#2D6A4F] shadow-sm"
          }`}
        >
          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {isLocked ? "Locked" : "Ready"}
        </span>
      </Link>

      <div className="flex min-w-0 flex-col p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            {getResourceIcon(resource.category)}
          </span>
          <span className="truncate text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {formatResourceCategory(resource.category)}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-extrabold leading-6 text-slate-950 dark:text-white">
          <Link href={href}>{resource.name}</Link>
        </h2>
        {resource.description && (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
            {resource.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isLocked ? getLockedLabel(resource) : "Attachments available"}
          </p>
          <Link
            href={href}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-extrabold transition ${
              isLocked
                ? "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                : "bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            }`}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
            {isLocked ? "View unlock steps" : "Open"}
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
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-[#0f1726]">
      <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-md ${styles[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
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
      className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-extrabold transition ${
        active
          ? "border-[#2D6A4F] bg-[#2D6A4F] text-white dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d]"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#95d5b2] dark:border-slate-800 dark:bg-[#0f1726] dark:text-slate-300"
      }`}
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
  params.set("page", String(page));
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.access) params.set("access", filters.access);
  return `/dashboard/resources?${params.toString()}`;
}

function getResourceIcon(category?: string, size: "regular" | "large" = "regular") {
  const className = size === "large" ? "h-12 w-12" : "h-4 w-4";
  if (category === "VIDEOS_AND_WEBINARS") return <PlayCircle className={className} />;
  if (category === "USEFUL_LINKS") return <Link2 className={className} />;
  return <FileText className={className} />;
}

function getLockedLabel(resource: ResourceRead) {
  if (resource.access_reason === "LOGIN_REQUIRED") return "Log in to unlock";
  if (resource.access_reason === "ENROLLMENT_REQUIRED") return "Course enrollment required";
  return "Locked";
}
