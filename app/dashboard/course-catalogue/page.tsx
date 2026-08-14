import Link from "next/link";
import Form from "next/form";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UsersRound,
} from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";
import {
  InstructorSummary,
  type CourseInstructor,
} from "./InstructorSummary";
import { CourseBookmarkButton } from "./CourseBookmarkButton";

export const metadata = {
  title: "Course Catalogue | Dashboard",
};

type SearchParams = { [key: string]: string | string[] | undefined };

type Course = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  prerequisite?: string | null;
  level?: CourseLevel | null;
  what_you_will_learn?: string[] | null;
  category?: CourseCategory | null;
  material_includes?: string[] | null;
  requirements?: string[] | null;
  is_free?: boolean | null;
  price?: number | null;
  thumbnail_url?: string | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  instructor?: InstructorValue | null;
  instructors?: InstructorValue[] | null;
  is_exclusive?: boolean | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  is_enrolled?: boolean | null;
  is_bookmarked?: boolean | null;
  has_access?: boolean | null;
};

type InstructorValue =
  | string
  | {
      id?: string | null;
      user_id?: string | null;
      name?: string | null;
      full_name?: string | null;
      display_name?: string | null;
      first_name?: string | null;
      last_name?: string | null;
      username?: string | null;
      title?: string | null;
      role?: string | null;
      headline?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      profile_picture_url?: string | null;
      image_url?: string | null;
      photo_url?: string | null;
    };

type Catalog = {
  id: string;
  name: string;
  slug: string;
  categories?: CourseCategory[] | null;
  icon_name?: string | null;
  description?: string | null;
  total_courses?: number | null;
};

type Meta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

type CourseCategory =
  | "DEVELOPMENT"
  | "BUSINESS"
  | "FINANCE_ACCOUNTING"
  | "IT_SOFTWARE"
  | "OFFICE_PRODUCTIVITY"
  | "PERSONAL_DEVELOPMENT"
  | "DESIGN"
  | "MARKETING"
  | "HEALTH_FITNESS"
  | "MUSIC"
  | "TEACHING_ACADEMICS"
  | "PHOTOGRAPHY_VIDEO"
  | "LIFESTYLE"
  | "LANGUAGE";

const PAGE_SIZE = 12;

const LEVELS: Array<{ value: CourseLevel; label: string }> = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const CATEGORIES: Array<{ value: CourseCategory; label: string }> = [
  { value: "DEVELOPMENT", label: "Development" },
  { value: "BUSINESS", label: "Business" },
  { value: "FINANCE_ACCOUNTING", label: "Finance & Accounting" },
  { value: "IT_SOFTWARE", label: "IT & Software" },
  { value: "OFFICE_PRODUCTIVITY", label: "Office Productivity" },
  { value: "PERSONAL_DEVELOPMENT", label: "Personal Development" },
  { value: "DESIGN", label: "Design" },
  { value: "MARKETING", label: "Marketing" },
  { value: "HEALTH_FITNESS", label: "Health & Fitness" },
  { value: "MUSIC", label: "Music" },
  { value: "TEACHING_ACADEMICS", label: "Teaching & Academics" },
  { value: "PHOTOGRAPHY_VIDEO", label: "Photography & Video" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  { value: "LANGUAGE", label: "Language" },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(firstValue(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeBool(value: string | string[] | undefined) {
  const current = firstValue(value);
  return current === "true" || current === "false" ? current : undefined;
}

function titleCaseEnum(value?: string | null) {
  if (!value) return "General";
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function formatPrice(course: Course) {
  if (course.is_free) return "Free";
  if (typeof course.price === "number") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(course.price);
  }
  return "Paid";
}

function buildHref(
  current: Record<string, string | undefined>,
  updates: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  const next = { ...current, ...updates };

  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === "" || value === "ALL") continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `/dashboard/course-catalogue?${query}` : "/dashboard/course-catalogue";
}

async function getCatalogueData(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  params.set("page", filters.page ?? "1");
  params.set("page_size", String(PAGE_SIZE));

  for (const key of ["category", "level", "is_free", "search", "catalog"]) {
    const value = filters[key];
    if (value) params.set(key, value);
  }

  const fallbackMeta: Meta = {
    page: Number(filters.page ?? 1),
    page_size: PAGE_SIZE,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  };

  try {
    const [coursesRes, catalogsRes] = await Promise.all([
      fetchApi(`/courses?${params.toString()}`, {
        cache: "no-store",
      }),
      fetchApi("/courses/catalogs", {
        next: { revalidate: 60 * 60 },
      }),
    ]);

    const coursesJson = await coursesRes.json().catch(() => ({}));
    const catalogsJson = await catalogsRes.json().catch(() => ({}));

    return {
      courses: Array.isArray(coursesJson?.data) ? (coursesJson.data as Course[]) : [],
      catalogs: Array.isArray(catalogsJson?.data)
        ? (catalogsJson.data as Catalog[])
        : [],
      meta: { ...fallbackMeta, ...(coursesJson?.meta ?? {}) } as Meta,
      error: coursesRes.ok ? null : coursesJson?.message ?? "Unable to load courses.",
    };
  } catch {
    return {
      courses: [],
      catalogs: [],
      meta: fallbackMeta,
      error: "Unable to load the course catalogue right now.",
    };
  }
}

export default async function CourseCataloguePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const page = toPositiveInt(searchParams.page, 1);
  const search = firstValue(searchParams.search);
  const catalog = firstValue(searchParams.catalog);
  const category = firstValue(searchParams.category);
  const level = firstValue(searchParams.level);
  const isFree = normalizeBool(searchParams.is_free);

  const filters = {
    page: String(page),
    search,
    catalog,
    category,
    level,
    is_free: isFree,
  };

  const { courses, catalogs, meta, error } = await getCatalogueData(filters);
  const selectedCatalog = catalogs.find((item) => item.slug === catalog);
  const enrolledCount = courses.filter((course) => course.is_enrolled).length;
  const accessCount = courses.filter((course) => course.has_access).length;
  const showingStart = courses.length ? (meta.page - 1) * meta.page_size + 1 : 0;
  const showingEnd = courses.length ? showingStart + courses.length - 1 : 0;

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Course Catalogue
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Explore expert-led courses for social work professionals, with
                catalog browsing, complete filtering, and personalized access
                flags when you are signed in.
              </p>
            </div>
            <Link
              href={buildHref(filters, {
                page: 1,
                search: undefined,
                catalog: undefined,
                category: undefined,
                level: undefined,
                is_free: undefined,
              })}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#b7e4c7] bg-white px-4 text-sm font-bold text-[#2D6A4F] shadow-sm transition hover:bg-[#f0fbf5] dark:border-[#315244] dark:bg-[#13231d] dark:text-[#b7e4c7] dark:hover:bg-[#183026] sm:flex-shrink-0"
            >
              Reset filters
            </Link>
          </div>

          <Form
            action="/dashboard/course-catalogue"
            className="mb-4 flex flex-col gap-3 sm:flex-row"
          >
            <input type="hidden" name="page" value="1" />
            {catalog && <input type="hidden" name="catalog" value={catalog} />}
            {category && <input type="hidden" name="category" value={category} />}
            {level && <input type="hidden" name="level" value={level} />}
            {isFree && <input type="hidden" name="is_free" value={isFree} />}
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Search courses</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                defaultValue={search ?? ""}
                placeholder="Search by course title or description..."
                className="h-12 w-full rounded-md border border-[#dceee4] bg-white pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-100 dark:focus:border-[#52b788]"
              />
            </label>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="inline-flex h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-5 text-sm font-bold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
              <a
                href="#catalogue-filters"
                className="inline-flex h-12 flex-1 sm:flex-none items-center justify-center gap-2 rounded-md border border-[#dceee4] bg-white px-5 text-sm font-bold text-[#2D6A4F] transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:bg-[#111525] dark:text-[#b7e4c7] dark:hover:bg-[#183026] xl:hidden"
              >
                <Filter className="h-4 w-4" />
                Filters
              </a>
            </div>
          </Form>

          <div className="swcl-sidebar-scroll mb-5 flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              href={buildHref(filters, { page: 1, catalog: undefined })}
              active={!catalog}
            >
              All Catalogs
            </FilterChip>
            {catalogs.slice(0, 12).map((item) => (
              <FilterChip
                key={item.id}
                href={buildHref(filters, { page: 1, catalog: item.slug })}
                active={catalog === item.slug}
              >
                {item.name}
                <span className="text-xs opacity-70">{item.total_courses ?? 0}</span>
              </FilterChip>
            ))}
          </div>

          {selectedCatalog && (
            <div className="mb-5 rounded-lg border border-[#dceee4] bg-[#f7fcf9] p-4 dark:border-[#27433a] dark:bg-[#13231d]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#2D6A4F] dark:text-[#b7e4c7]">
                    Selected catalog
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950 dark:text-white">
                    {selectedCatalog.name}
                  </h2>
                  {selectedCatalog.description && (
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {selectedCatalog.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-md bg-white px-2.5 py-1 text-[#2D6A4F] shadow-sm dark:bg-[#111525] dark:text-[#b7e4c7]">
                    {Number(selectedCatalog.total_courses || 0).toLocaleString()} courses
                  </span>
                  {(selectedCatalog.categories ?? []).slice(0, 2).map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-[#dceee4] px-2.5 py-1 text-slate-600 dark:border-[#27433a] dark:text-slate-300"
                    >
                      {titleCaseEnum(item)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              {error}
            </div>
          )}

          {courses.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseTile key={course.id} course={course} />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Showing {showingStart} to {showingEnd} of {meta.total_items} courses
                  {enrolledCount > 0 && (
                    <span className="ml-2 font-bold text-[#2D6A4F] dark:text-[#b7e4c7]">
                      {enrolledCount} enrolled
                    </span>
                  )}
                  {accessCount > enrolledCount && (
                    <span className="ml-2 font-bold text-[#2D6A4F] dark:text-[#b7e4c7]">
                      {accessCount - enrolledCount} subscription access
                    </span>
                  )}
                </p>
                <Pagination meta={meta} filters={filters} />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-[#cfe8da] bg-white px-6 py-16 text-center dark:border-[#27433a] dark:bg-[#111525]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                No courses found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Try a broader search or remove one of the active filters.
                Published courses will appear here as soon as the API returns
                them.
              </p>
            </div>
          )}
        </div>

        <aside
          id="catalogue-filters"
          className="grid h-max gap-4 xl:sticky xl:top-[92px]"
        >
          <FilterPanel
            title="Level"
            filters={filters}
            param="level"
            options={LEVELS}
          />
          <FilterPanel
            title="Category"
            filters={filters}
            param="category"
            options={CATEGORIES}
          />
          <FilterPanel
            title="Price"
            filters={filters}
            param="is_free"
            options={[
              { value: "true", label: "Free courses" },
              { value: "false", label: "Paid courses" },
            ]}
          />
          <div className="rounded-lg border border-[#dceee4] bg-[#f7fcf9] p-4 dark:border-[#27433a] dark:bg-[#13231d]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#2D6A4F] shadow-sm dark:bg-[#111525] dark:text-[#b7e4c7]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
              Build your learning path
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Catalog tiles use live published-course counts. You can combine
              search, catalog, category, level, and price filters in one
              bookmarkable view.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-bold no-underline transition ${
        active
          ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-[0_10px_24px_-18px_rgba(45,106,79,0.9)] dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d]"
          : "border-[#dceee4] bg-white text-slate-700 hover:border-[#95d5b2] hover:bg-[#f7fcf9] hover:text-[#2D6A4F] dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-300 dark:hover:border-[#52b788] dark:hover:bg-[#183026] dark:hover:text-[#b7e4c7]"
      }`}
    >
      {children}
    </Link>
  );
}

function FilterPanel({
  title,
  filters,
  param,
  options,
}: {
  title: string;
  filters: Record<string, string | undefined>;
  param: string;
  options: Array<{ value: string; label: string }>;
}) {
  const hasActiveFilter = filters[param] !== undefined;
  return (
    <details
      className="group rounded-lg border border-[#dceee4] bg-white p-4 shadow-sm dark:border-[#27433a] dark:bg-[#111525] [&_summary::-webkit-details-marker]:hidden"
      open={true}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 outline-none select-none">
        <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
          {title}
        </h2>
        <span className="flex items-center justify-center transition-transform duration-200 group-open:rotate-180">
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </span>
      </summary>
      <div className="mt-4 grid gap-2">
        <SideFilterLink
          href={buildHref(filters, { page: 1, [param]: undefined })}
          active={!filters[param]}
          label={`All ${title}`}
        />
        {options.map((option) => (
          <SideFilterLink
            key={option.value}
            href={buildHref(filters, { page: 1, [param]: option.value })}
            active={filters[param] === option.value}
            label={option.label}
          />
        ))}
      </div>
    </details>
  );
}

function SideFilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-8 items-center justify-between gap-3 rounded-md px-1.5 py-1 text-sm font-medium text-slate-600 no-underline transition hover:bg-[#f0fbf5] hover:text-[#2D6A4F] dark:text-slate-400 dark:hover:bg-[#52b788]/10 dark:hover:text-[#b7e4c7]"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
            active
              ? "border-[#2D6A4F] bg-[#2D6A4F] text-white dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d]"
              : "border-slate-300 text-transparent group-hover:border-[#95d5b2] dark:border-slate-600"
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span className="min-w-0 truncate">{label}</span>
      </span>
    </Link>
  );
}

function CourseTile({ course }: { course: Course }) {
  const courseHref = `/dashboard/course-catalogue/${course.slug || course.id}`;
  const isEnrolled = course.is_enrolled === true;
  const hasAccess = course.has_access === true;
  const rating = typeof course.average_rating === "number" ? course.average_rating : 0;
  const reviews = Number(course.total_reviews || 0);
  const outcomeCount = course.what_you_will_learn?.length ?? 0;
  const materialCount = course.material_includes?.length ?? 0;
  const instructors = getCourseInstructors(course);

  return (
    <article
      className={`group flex min-h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#95d5b2] hover:shadow-lg dark:bg-[#111525] ${
        isEnrolled
          ? "border-[#2D6A4F]/55 ring-1 ring-[#2D6A4F]/20 dark:border-[#52b788]/60 dark:ring-[#52b788]/20"
          : "border-[#e3ede7] dark:border-[#27433a]"
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#e7f6ee]">
        <Link href={courseHref} className="block h-full w-full">
          <img
            src={course.thumbnail_url || FALLBACK_IMAGE}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-md bg-[#2D6A4F] px-2.5 py-1 text-xs font-bold text-white shadow-sm dark:bg-[#52b788] dark:text-[#06130d]">
            {titleCaseEnum(course.category)}
          </span>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {course.is_exclusive && (
              <span className="rounded-md bg-slate-950/85 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
                Exclusive
              </span>
            )}
          </div>
          {(isEnrolled || hasAccess) && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] shadow-sm dark:bg-[#111525]/95 dark:text-[#b7e4c7]">
              <Check className="h-3 w-3" strokeWidth={3} />
              {isEnrolled ? "Enrolled" : "Access"}
            </span>
          )}
        </Link>
        <CourseBookmarkButton
          courseId={course.id}
          courseTitle={course.title}
          initialBookmarked={course.is_bookmarked}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            {titleCaseEnum(course.level)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating ? rating.toFixed(1) : "New"}
          </span>
          {reviews > 0 && (
            <span className="inline-flex items-center gap-1">
              <UsersRound className="h-3.5 w-3.5" />
              {reviews.toLocaleString()}
            </span>
          )}
          {outcomeCount > 0 && <span>{outcomeCount} outcomes</span>}
          {materialCount > 0 && <span>{materialCount} materials</span>}
        </div>

        <div>
          <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-950 dark:text-white">
            <Link href={courseHref} className="no-underline hover:text-[#2D6A4F] dark:hover:text-[#b7e4c7]">
              {course.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-400">
            {course.description || "Professional learning designed for practical social work growth."}
          </p>
          <div className="mt-3">
            <InstructorSummary instructors={instructors} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e6f2eb] pt-3 dark:border-[#27433a]">
          <span className="text-sm font-extrabold text-[#2D6A4F] dark:text-[#b7e4c7]">
            {formatPrice(course)}
          </span>
          <Link
            href={courseHref}
            className={`inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-bold no-underline transition ${
              isEnrolled || hasAccess
                ? "border-[#2D6A4F] bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
                : "border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white dark:border-[#52b788] dark:text-[#b7e4c7] dark:hover:bg-[#52b788] dark:hover:text-[#06130d]"
            }`}
          >
            {isEnrolled || hasAccess ? "View Course" : "Enroll"}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getCourseInstructors(course: Course): CourseInstructor[] {
  const candidates: InstructorValue[] = [];

  if (course.instructor) candidates.push(course.instructor);
  if (course.instructor_name) candidates.push(course.instructor_name);
  if (Array.isArray(course.instructors)) candidates.push(...course.instructors);

  const normalized = candidates
    .map(normalizeInstructor)
    .filter((instructor): instructor is CourseInstructor => Boolean(instructor));

  if (normalized.length > 0) return dedupeInstructors(normalized);

  if (course.instructor_id) {
    return [{ id: course.instructor_id, name: "Course instructor" }];
  }

  return [];
}

function normalizeInstructor(value: InstructorValue): CourseInstructor | null {
  if (typeof value === "string") {
    const name = value.trim();
    return name ? { name } : null;
  }

  const firstLast = [value.first_name, value.last_name].filter(Boolean).join(" ");
  const name =
    value.name ||
    value.full_name ||
    value.display_name ||
    firstLast ||
    value.username;

  if (!name) return null;

  return {
    id: value.id || value.user_id,
    name,
    title: value.title || value.role || value.headline,
    bio: value.bio,
    avatar_url:
      value.profile_picture_url ||
      value.avatar_url ||
      value.image_url ||
      value.photo_url,
  };
}

function dedupeInstructors(instructors: CourseInstructor[]) {
  const seen = new Set<string>();
  return instructors.filter((instructor) => {
    const key = instructor.id || instructor.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function Pagination({
  meta,
  filters,
}: {
  meta: Meta;
  filters: Record<string, string | undefined>;
}) {
  const pages = Array.from({ length: Math.min(meta.total_pages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(meta.page - 2, meta.total_pages - 4));
    return start + index;
  }).filter((page) => page >= 1 && page <= meta.total_pages);

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Course pages">
      <PageButton
        href={buildHref(filters, { page: Math.max(1, meta.page - 1) })}
        disabled={!meta.has_previous}
        label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
      {pages.map((page) => (
        <PageButton
          key={page}
          href={buildHref(filters, { page })}
          active={page === meta.page}
          label={`Page ${page}`}
        >
          {page}
        </PageButton>
      ))}
      {meta.total_pages > 5 && meta.page < meta.total_pages - 2 && (
        <span className="flex h-9 w-9 items-center justify-center text-sm font-bold text-slate-500">
          ...
        </span>
      )}
      {meta.total_pages > 5 && !pages.includes(meta.total_pages) && (
        <PageButton
          href={buildHref(filters, { page: meta.total_pages })}
          label={`Page ${meta.total_pages}`}
        >
          {meta.total_pages}
        </PageButton>
      )}
      <PageButton
        href={buildHref(filters, { page: Math.min(meta.total_pages || 1, meta.page + 1) })}
        disabled={!meta.has_next}
        label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  href,
  active = false,
  disabled = false,
  label,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = `flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-bold no-underline transition ${
    active
      ? "border-[#2D6A4F] bg-[#2D6A4F] text-white dark:border-[#52b788] dark:bg-[#52b788] dark:text-[#06130d]"
      : disabled
        ? "pointer-events-none border-[#e8eee9] bg-[#f8faf8] text-slate-300 dark:border-[#223329] dark:bg-[#111a14] dark:text-slate-700"
        : "border-[#dceee4] bg-white text-slate-700 hover:border-[#95d5b2] hover:bg-[#f7fcf9] hover:text-[#2D6A4F] dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-300 dark:hover:border-[#52b788] dark:hover:bg-[#183026] dark:hover:text-[#b7e4c7]"
  }`;

  return (
    <Link href={disabled ? "#" : href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}
