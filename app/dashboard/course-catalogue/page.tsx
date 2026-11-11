import Link from "next/link";
import Form from "next/form";
import {
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Search,
  Shapes,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import { cookies } from "next/headers";
import { fetchApi, publicFetchApi } from "@/lib/fetchApi";
import { PopUpMenu, ViewSwitch } from "@/components/dashboard/PopUpMenu";
import { getCourseDurationLabel } from "@/lib/courseDuration";
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
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
  is_enrolled?: boolean | null;
  is_bookmarked?: boolean | null;
  has_access?: boolean | null;
  is_completed?: boolean | null;
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
      is_guest?: boolean | null;
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
    const courseEndpoint = `/courses?${params.toString()}`;
    const [initialCoursesRes, catalogsRes] = await Promise.all([
      fetchApi(courseEndpoint, {
        cache: "no-store",
      }),
      fetchApi("/courses/catalogs", {
        next: { revalidate: 60 * 60 },
      }),
    ]);

    const coursesRes = initialCoursesRes.ok
      ? initialCoursesRes
      : await publicFetchApi(courseEndpoint, {
          cache: "no-store",
        });
    const coursesJson = await coursesRes.json().catch(() => ({}));
    const catalogsJson = await catalogsRes.json().catch(() => ({}));
    const courseItems = getCourseItems(coursesJson);
    const courseMeta = getCourseMeta(coursesJson);

    return {
      courses: courseItems,
      catalogs: Array.isArray(catalogsJson?.data)
        ? (catalogsJson.data as Catalog[])
        : [],
      meta: { ...fallbackMeta, ...courseMeta } as Meta,
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

function getCourseItems(json: unknown): Course[] {
  if (!json || typeof json !== "object") return [];

  const payload = json as {
    data?: Course[] | { items?: Course[]; courses?: Course[] };
    items?: Course[];
    courses?: Course[];
  };

  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && !Array.isArray(payload.data)) {
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.courses)) return payload.data.courses;
  }
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.courses)) return payload.courses;

  return [];
}

function getCourseMeta(json: unknown): Partial<Meta> {
  if (!json || typeof json !== "object") return {};

  const payload = json as {
    meta?: Partial<Meta>;
    data?: { meta?: Partial<Meta> };
  };

  return payload.meta || payload.data?.meta || {};
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
  const cookieStore = await cookies();
  const requestedView = firstValue(searchParams.view);
  const view: "grid" | "list" =
    requestedView === "list" || requestedView === "grid"
      ? requestedView
      : cookieStore.get("swcl_catalog_view")?.value === "list"
        ? "list"
        : "grid";

  const filters = {
    page: String(page),
    search,
    catalog,
    category,
    level,
    is_free: isFree,
    view: view === "list" ? "list" : undefined,
  };

  const { courses, catalogs, meta, error } = await getCatalogueData(filters);
  const selectedCatalog = catalogs.find((item) => item.slug === catalog);
  const showingStart = courses.length ? (meta.page - 1) * meta.page_size + 1 : 0;
  const showingEnd = courses.length ? showingStart + courses.length - 1 : 0;
  const unfiltered = !search && !catalog && !category && !level && !isFree;
  // With no filters the course list's own total is the true count; catalogue counts can lag behind.
  const totalCourses = unfiltered
    ? meta.total_items
    : catalogs.reduce((sum, item) => sum + Number(item.total_courses || 0), 0);

  const levelLabel = LEVELS.find((item) => item.value === level)?.label;
  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label;
  const priceLabel = isFree === "true" ? "Free" : isFree === "false" ? "Paid" : undefined;
  const activeTokens = [
    search ? { key: "search", label: `“${search}”`, href: buildHref(filters, { page: 1, search: undefined }) } : null,
    levelLabel ? { key: "level", label: levelLabel, href: buildHref(filters, { page: 1, level: undefined }) } : null,
    categoryLabel ? { key: "category", label: categoryLabel, href: buildHref(filters, { page: 1, category: undefined }) } : null,
    priceLabel ? { key: "price", label: priceLabel, href: buildHref(filters, { page: 1, is_free: undefined }) } : null,
  ].filter((token): token is { key: string; label: string; href: string } => Boolean(token));
  const clearAllHref = buildHref(filters, { page: 1, search: undefined, catalog: undefined, category: undefined, level: undefined, is_free: undefined });

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col pb-8">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Course Catalogue</h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.98rem] text-ink-2">
          {totalCourses > 0
            ? `${totalCourses} expert-led course${totalCourses === 1 ? "" : "s"} across ${catalogs.length} catalogue${catalogs.length === 1 ? "" : "s"}, built for social work practice.`
            : "Expert-led courses built for social work practice."}
        </p>
      </header>

      {/* Search */}
      <Form action="/dashboard/course-catalogue" className="lms-rise mt-5" style={{ "--i": 1 } as React.CSSProperties}>
        {catalog && <input type="hidden" name="catalog" value={catalog} />}
        {category && <input type="hidden" name="category" value={category} />}
        {level && <input type="hidden" name="level" value={level} />}
        {isFree && <input type="hidden" name="is_free" value={isFree} />}
        {view === "list" && <input type="hidden" name="view" value="list" />}
        <div className="lms-search lms-search--lg">
          <label htmlFor="catalogue-search" className="sr-only">
            Search courses
          </label>
          <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
          <input
            id="catalogue-search"
            name="search"
            type="search"
            defaultValue={search ?? ""}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Search courses by title or topic"
          />
          {search && (
            <Link href={buildHref(filters, { page: 1, search: undefined })} aria-label="Clear search" className="lms-search-clear" scroll={false}>
              <X className="h-3 w-3" strokeWidth={3} />
            </Link>
          )}
        </div>
      </Form>

      {/* Catalogues, as capsule chips */}
      {catalogs.length > 0 && (
        <nav aria-label="Catalogues" className="lms-scroll-x -mx-3 mt-4 overflow-x-auto px-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
          <ul className="m-0 flex list-none gap-2 p-0 pb-1">
            <li>
              <Link href={buildHref(filters, { page: 1, catalog: undefined })} aria-current={!catalog ? "page" : undefined} className="lms-capsule" scroll={false}>
                All
              </Link>
            </li>
            {catalogs.map((item) => (
              <li key={item.id}>
                <Link
                  href={buildHref(filters, { page: 1, catalog: item.slug })}
                  aria-current={catalog === item.slug ? "page" : undefined}
                  className="lms-capsule"
                  scroll={false}
                >
                  {item.name}
                  <span className="lms-capsule-count">{item.total_courses ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Toolbar: filters and view, pinned under the top bar */}
      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-3 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <PopUpMenu
              ariaLabel="Level"
              label={levelLabel ?? "Level"}
              icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />}
              active={Boolean(levelLabel)}
              align="left"
              items={[
                { key: "all", label: "Any level", checked: !level, href: buildHref(filters, { page: 1, level: undefined }) },
                ...LEVELS.map((item) => ({ key: item.value, label: item.label, checked: level === item.value, href: buildHref(filters, { page: 1, level: item.value }) })),
              ]}
            />
            <PopUpMenu
              ariaLabel="Category"
              label={categoryLabel ?? "Category"}
              icon={<Shapes className="h-4 w-4" aria-hidden="true" />}
              active={Boolean(categoryLabel)}
              align="left"
              items={[
                { key: "all", label: "All categories", checked: !category, href: buildHref(filters, { page: 1, category: undefined }) },
                ...CATEGORIES.map((item) => ({ key: item.value, label: item.label, checked: category === item.value, href: buildHref(filters, { page: 1, category: item.value }) })),
              ]}
            />
            <PopUpMenu
              ariaLabel="Price"
              label={priceLabel ?? "Price"}
              icon={<Tag className="h-4 w-4" aria-hidden="true" />}
              active={Boolean(priceLabel)}
              align="left"
              items={[
                { key: "all", label: "Any price", checked: !isFree, href: buildHref(filters, { page: 1, is_free: undefined }) },
                { key: "true", label: "Free", checked: isFree === "true", href: buildHref(filters, { page: 1, is_free: "true" }) },
                { key: "false", label: "Paid", checked: isFree === "false", href: buildHref(filters, { page: 1, is_free: "false" }) },
              ]}
            />
          </div>
          <ViewSwitch
            view={view}
            gridHref={buildHref(filters, { view: undefined })}
            listHref={buildHref(filters, { view: "list" })}
          />
        </div>

        {activeTokens.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeTokens.map((token) => (
              <span key={token.key} className="lms-filter-token">
                {token.label}
                <Link href={token.href} aria-label={`Remove ${token.label}`} className="lms-filter-token-x" scroll={false}>
                  <X className="h-3 w-3" strokeWidth={2.6} />
                </Link>
              </span>
            ))}
            <Link href={clearAllHref} className="ml-1 text-[0.82rem] font-semibold text-accent no-underline hover:underline" scroll={false}>
              Clear all
            </Link>
          </div>
        )}
      </div>

      {selectedCatalog && (
        <section aria-label={selectedCatalog.name} className="lms-milk mt-2 flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <h2 className="sw-title m-0 text-[1.35rem] text-ink">{selectedCatalog.name}</h2>
            {selectedCatalog.description && (
              <p className="m-0 mt-1 max-w-2xl text-[0.92rem] leading-relaxed text-ink-2">{selectedCatalog.description}</p>
            )}
          </div>
          <span className="lms-chip-milk flex-none">
            {Number(selectedCatalog.total_courses || 0).toLocaleString()} course{Number(selectedCatalog.total_courses || 0) === 1 ? "" : "s"}
          </span>
        </section>
      )}

      {error && (
        <p role="alert" className="m-0 mt-3 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          {error}
        </p>
      )}

      {courses.length ? (
        <>
          {view === "grid" ? (
            <ul className="lms-course-grid m-0 mt-3 list-none p-0">
              {courses.map((course, index) => (
                <li key={course.id} className="lms-rise min-w-0" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="lms-group m-0 mt-3 list-none p-0">
              {courses.map((course) => (
                <li key={course.id}>
                  <CourseRow course={course} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="m-0 text-sm text-ink-3">
              {showingStart}–{showingEnd} of {meta.total_items}
            </p>
            <Pagination meta={meta} filters={filters} />
          </div>
        </>
      ) : (
        <div className="lms-milk mt-3 flex flex-col items-center px-6 py-14 text-center sm:py-20">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
            {search ? <Search className="h-7 w-7" strokeWidth={1.8} /> : <BookOpen className="h-7 w-7" strokeWidth={1.8} />}
          </span>
          <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">{search ? "No matches" : "No courses here yet"}</h2>
          <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
            {search || activeTokens.length || catalog
              ? "Try fewer words or remove a filter to see more courses."
              : "New courses appear here as soon as they are published."}
          </p>
          {(activeTokens.length > 0 || catalog) && (
            <Link href={clearAllHref} className="lms-btn lms-btn--quiet mt-6" scroll={false}>
              Clear filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function courseFacts(course: Course) {
  const rating = typeof course.average_rating === "number" ? course.average_rating : 0;
  const reviews = Number(course.total_reviews || 0);
  return {
    href: `/dashboard/course-catalogue/${course.slug || course.id}`,
    owned: course.is_enrolled === true || course.has_access === true || course.is_completed === true,
    state: course.is_completed ? "Completed" : course.is_enrolled ? "Enrolled" : course.has_access ? "Included" : null,
    rating,
    reviews,
    duration: getCourseDurationLabel(course),
    instructors: getCourseInstructors(course),
  };
}

function CourseMeta({ course, compact = false }: { course: Course; compact?: boolean }) {
  const { rating, reviews, duration } = courseFacts(course);
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8rem] text-ink-3">
      <span>{titleCaseEnum(course.level)}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-[#f5b301] text-[#f5b301]" aria-hidden="true" />
        <span className="font-semibold text-ink-2">{rating ? rating.toFixed(1) : "New"}</span>
        {reviews > 0 && <span>({reviews.toLocaleString()})</span>}
      </span>
      {duration && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {duration}
          </span>
        </>
      )}
      {!compact && course.certificate_enabled === true && (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            Certificate
          </span>
        </>
      )}
    </span>
  );
}

function CourseCard({ course }: { course: Course }) {
  const { href, owned, state, instructors } = courseFacts(course);
  return (
    <article className="lms-milk lms-milk-hover group relative flex h-full flex-col p-2.5">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="lms-art relative block aspect-[16/9] overflow-hidden bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.thumbnail_url || FALLBACK_IMAGE} alt="" loading="lazy" decoding="async" className="sw-zoom h-full w-full object-cover" />
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span className="lms-glass-pill">{titleCaseEnum(course.category)}</span>
          {course.is_exclusive && (
            <span className="lms-glass-pill lms-glass-pill--new">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Exclusive
            </span>
          )}
        </div>
        {state && (
          <span className="lms-glass-pill lms-glass-pill--done pointer-events-none absolute bottom-2.5 left-2.5">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
            {state}
          </span>
        )}
        <CourseBookmarkButton courseId={course.id} courseTitle={course.title} initialBookmarked={course.is_bookmarked} variant="glass" />
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
        <h2 className="sw-title m-0 line-clamp-2 text-[1.08rem] leading-snug text-ink">
          <Link href={href} className="text-inherit no-underline after:absolute after:inset-0 after:rounded-[24px] after:content-['']">
            {course.title}
          </Link>
        </h2>
        <p className="m-0 mt-1.5 line-clamp-2 text-[0.86rem] leading-relaxed text-ink-2">
          {course.description || "Professional learning for practical social work growth."}
        </p>
        <div className="relative z-[1] mt-3 w-fit">
          <InstructorSummary instructors={instructors} />
        </div>
        <div className="mt-3">
          <CourseMeta course={course} />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className={`text-[1.05rem] font-bold tracking-[-0.01em] ${course.is_free ? "text-accent" : "text-ink"}`}>{formatPrice(course)}</span>
          <span className={`lms-btn !min-h-9 !px-4 !text-[0.82rem] ${owned ? "" : "lms-btn--quiet"}`} aria-hidden="true">
            {owned ? "Open" : "View course"}
          </span>
        </div>
      </div>
    </article>
  );
}

function CourseRow({ course }: { course: Course }) {
  const { href, owned, state, instructors } = courseFacts(course);
  const lead = instructors[0]?.name;
  return (
    <div className="lms-row group !items-start sm:!items-center">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="lms-art relative block aspect-[16/10] w-24 flex-none overflow-hidden bg-paper-2 !rounded-[12px] sm:w-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.thumbnail_url || FALLBACK_IMAGE} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
          {titleCaseEnum(course.category)}
          {state && <span className="ml-2 normal-case tracking-normal text-accent">· {state}</span>}
        </span>
        <h2 className="m-0 mt-0.5 truncate text-[1rem] font-semibold tracking-[-0.01em] text-ink">
          <Link href={href} className="text-inherit no-underline after:absolute after:inset-0 after:content-['']">
            {course.title}
          </Link>
        </h2>
        <p className="m-0 mt-0.5 hidden truncate text-[0.85rem] text-ink-2 sm:block">
          {course.description || "Professional learning for practical social work growth."}
        </p>
        <div className="mt-1.5">
          <CourseMeta course={course} compact />
        </div>
        {lead && <p className="m-0 mt-1 truncate text-[0.8rem] text-ink-3 md:hidden">{lead}</p>}
      </div>
      <span className="hidden w-40 flex-none truncate text-[0.85rem] text-ink-2 md:block">{lead}</span>
      <div className="relative z-[1] flex flex-none flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span className={`text-[0.95rem] font-bold ${course.is_free ? "text-accent" : "text-ink"}`}>{formatPrice(course)}</span>
        <span className={`lms-row-action ${owned ? "lms-row-action--primary" : ""} hidden sm:inline-flex`} aria-hidden="true">
          {owned ? "Open" : "View"}
        </span>
        <CourseBookmarkButton courseId={course.id} courseTitle={course.title} initialBookmarked={course.is_bookmarked} variant="icon" />
      </div>
    </div>
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
    is_guest: value.is_guest,
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
  if (meta.total_pages <= 1) return null;
  const pages = Array.from({ length: Math.min(meta.total_pages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(meta.page - 2, meta.total_pages - 4));
    return start + index;
  }).filter((page) => page >= 1 && page <= meta.total_pages);

  return (
    <nav className="lms-pager" aria-label="Course pages">
      <PageLink href={buildHref(filters, { page: Math.max(1, meta.page - 1) })} disabled={!meta.has_previous} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
      {pages.map((page) => (
        <PageLink key={page} href={buildHref(filters, { page })} active={page === meta.page} label={`Page ${page}`}>
          {page}
        </PageLink>
      ))}
      {meta.total_pages > 5 && !pages.includes(meta.total_pages) && (
        <>
          <span aria-hidden="true" className="grid h-9 w-6 place-items-center text-sm text-ink-3">
            …
          </span>
          <PageLink href={buildHref(filters, { page: meta.total_pages })} label={`Page ${meta.total_pages}`}>
            {meta.total_pages}
          </PageLink>
        </>
      )}
      <PageLink href={buildHref(filters, { page: Math.min(meta.total_pages || 1, meta.page + 1) })} disabled={!meta.has_next} label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
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
  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className="lms-page opacity-35">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className="lms-page no-underline">
      {children}
    </Link>
  );
}
