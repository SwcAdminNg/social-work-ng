"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  CirclePlay,
  Clock3,
  Compass,
  LayoutGrid,
  Loader2,
  type LucideIcon,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { getCourseDurationLabel } from "@/lib/courseDuration";
import { ViewToggle } from "@/components/dashboard/PopUpMenu";

export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

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
      avatar_url?: string | null;
      profile_picture_url?: string | null;
      image_url?: string | null;
      photo_url?: string | null;
    };

type Instructor = {
  id?: string | null;
  name: string;
  title?: string | null;
  avatar_url?: string | null;
};

export type Course = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  instructor_id?: string | null;
  instructor_name?: string | null;
  instructor?: InstructorValue | null;
  instructors?: InstructorValue[] | null;
  is_bookmarked?: boolean | null;
  is_enrolled?: boolean | null;
  progress_status?: ProgressStatus | null;
  progress_percent?: number | null;
  is_completed?: boolean | null;
  content_updated_at?: string | null;
  has_new_content?: boolean | null;
  updated_at?: string | null;
  access_end_date?: string | null;
  access_start_date?: string | null;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
};

export type DashboardStats = {
  total_courses_enrolled: number;
  quizzes_attempted: number;
  completion_rate: number;
  total_reviews: number;
  in_process_courses: number;
  completed_courses: number;
  not_started_courses: number;
  bookmarked_courses: number;
};

export type Meta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type CourseView = "ALL" | "IN_PROGRESS" | "NOT_STARTED" | "COMPLETED" | "SAVED";

type DisplayCourse = Course & {
  displayStatus: ProgressStatus | null;
  displayProgress: number;
  bookmarked: boolean;
  enrolled: boolean;
  wishlist: boolean;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1573497491208-6b1acb260507?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop",
];

const tabs: Array<{ key: CourseView; label: string; icon: LucideIcon }> = [
  { key: "ALL", label: "All", icon: LayoutGrid },
  { key: "IN_PROGRESS", label: "In progress", icon: CirclePlay },
  { key: "NOT_STARTED", label: "Not started", icon: CircleDashed },
  { key: "COMPLETED", label: "Completed", icon: BadgeCheck },
  { key: "SAVED", label: "Saved", icon: Bookmark },
];

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 800;

function clampPercent(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function getStatus(course: Course): ProgressStatus | null {
  if (course.progress_status) return course.progress_status;
  if (course.is_completed) return "COMPLETED";

  const percent = clampPercent(course.progress_percent);
  if (percent === null) return null;
  if (percent >= 100) return "COMPLETED";
  if (percent > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

function getProgress(course: Course, status: ProgressStatus | null) {
  const percent = clampPercent(course.progress_percent);
  if (percent !== null) return percent;
  if (status === "COMPLETED") return 100;
  if (status === "IN_PROGRESS") return 45;
  return 0;
}

function normalizeCourse(course: Course, view: CourseView): DisplayCourse {
  const enrolled = view === "SAVED" ? course.is_enrolled === true : course.is_enrolled !== false;
  const wishlist = view === "SAVED" && !enrolled;
  const displayStatus = wishlist ? null : getStatus(course);

  return {
    ...course,
    displayStatus,
    displayProgress: getProgress(course, displayStatus),
    bookmarked: course.is_bookmarked === true,
    enrolled,
    wishlist,
  };
}

function normalizeInstructor(
  value: InstructorValue | null | undefined,
): Instructor | null {
  if (!value) return null;

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
    avatar_url:
      value.profile_picture_url ||
      value.avatar_url ||
      value.image_url ||
      value.photo_url,
  };
}

function getInstructor(course: Course): Instructor {
  const candidates: Array<InstructorValue | null | undefined> = [
    course.instructor,
    course.instructor_name,
    ...(Array.isArray(course.instructors) ? course.instructors : []),
  ];

  for (const candidate of candidates) {
    const instructor = normalizeInstructor(candidate);
    if (instructor) return instructor;
  }

  return course.instructor_id
    ? { id: course.instructor_id, name: "Course instructor" }
    : { name: "SWCL Faculty" };
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: ProgressStatus | null) {
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "COMPLETED") return "Completed";
  return "Not started";
}

function actionLabel(
  status: ProgressStatus | null,
  savedOnly: boolean,
  wishlist: boolean,
) {
  if (wishlist) return "Details";
  if (savedOnly && !status) return "Start";
  if (status === "COMPLETED") return "Review";
  if (status === "IN_PROGRESS") return "Continue";
  return "Start";
}

function actionHref(course: DisplayCourse) {
  if (course.wishlist) return `/dashboard/course-catalogue/${course.slug || course.id}`;
  if (course.enrolled) return `/learn/${course.id}`;
  if (course.displayStatus) return `/learn/${course.id}`;
  return `/dashboard/course-catalogue/${course.slug || course.id}`;
}

function uniqueCourses(courses: Course[]) {
  const seen = new Set<string>();
  return courses.filter((course) => {
    if (!course.id || seen.has(course.id)) return false;
    seen.add(course.id);
    return true;
  });
}

function normalizeCourses(courses: Course[], view: CourseView) {
  return uniqueCourses(courses).map((course) =>
    normalizeCourse(
      view === "SAVED" ? { ...course, is_bookmarked: true } : course,
      view,
    ),
  );
}

function buildApiUrl(view: CourseView, page: number, search: string) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(PAGE_SIZE),
  });

  if (view !== "SAVED") {
    if (search.trim()) params.set("search", search.trim());
    if (view !== "ALL") params.set("status", view);
    return `/api/proxy/courses/enrolled?${params.toString()}`;
  }

  return `/api/proxy/courses/bookmarked?${params.toString()}`;
}

function buildBrowserHref(view: CourseView, page: number, search: string) {
  const params = new URLSearchParams();

  if (page > 1) params.set("page", String(page));
  if (view === "SAVED") {
    params.set("tab", "saved");
  } else {
    if (search.trim()) params.set("search", search.trim());
    if (view !== "ALL") params.set("status", view);
  }

  const query = params.toString();
  return query ? `/dashboard/courses?${query}` : "/dashboard/courses";
}

function mergeMeta(meta: Meta, next: Partial<Meta> | undefined, page: number): Meta {
  return {
    ...meta,
    page,
    page_size: PAGE_SIZE,
    ...(next ?? {}),
  };
}

function updateBookmarkedStat(stats: DashboardStats, delta: number): DashboardStats {
  return {
    ...stats,
    bookmarked_courses: Math.max(0, stats.bookmarked_courses + delta),
  };
}

function updateSavedMeta(meta: Meta, delta: number): Meta {
  const totalItems = Math.max(0, meta.total_items + delta);
  const totalPages = Math.max(1, Math.ceil(totalItems / meta.page_size));

  return {
    ...meta,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: meta.page < totalPages,
    has_previous: meta.page > 1,
  };
}

export function EnrolledCoursesDashboard({
  stats,
  courses: initialCourses,
  meta,
  activeView,
  currentPage,
  initialSearch,
  initialLayout = "grid",
  error,
}: {
  stats: DashboardStats;
  courses: Course[];
  meta: Meta;
  activeView: CourseView;
  currentPage: number;
  initialSearch: string;
  initialLayout?: "grid" | "list";
  error: string | null;
}) {
  const [layout, setLayout] = useState<"grid" | "list">(initialLayout);
  const [dashboardStats, setDashboardStats] = useState(stats);
  const [view, setView] = useState<CourseView>(activeView);
  const [page, setPage] = useState(currentPage);
  const [search, setSearch] = useState(initialSearch);
  const [listMeta, setListMeta] = useState(meta);
  const [listError, setListError] = useState(error);
  const [isListLoading, setIsListLoading] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [courses, setCourses] = useState(() =>
    normalizeCourses(initialCourses, activeView),
  );
  const abortRef = useRef<AbortController | null>(null);
  const viewRef = useRef(activeView);
  const searchDidMountRef = useRef(false);

  const loadCourses = useCallback(
    async (nextView: CourseView, nextPage: number, nextSearch: string) => {
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;
      setIsListLoading(true);
      setListError(null);

      try {
        const res = await fetch(buildApiUrl(nextView, nextPage, nextSearch), {
          signal: controller.signal,
        });

        if (res.status === 401) {
          window.location.href = "/logout?callbackUrl=/dashboard/courses";
          return;
        }

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json?.message || "Unable to load courses.");
        }

        const nextCourses = Array.isArray(json?.data) ? (json.data as Course[]) : [];

        setCourses(normalizeCourses(nextCourses, nextView));
        setListMeta((current) => mergeMeta(current, json?.meta, nextPage));
        if (
          nextView === "SAVED" &&
          typeof json?.meta?.total_items === "number"
        ) {
          setDashboardStats((current) => ({
            ...current,
            bookmarked_courses: json.meta.total_items,
          }));
        }
        viewRef.current = nextView;
        setView(nextView);
        setPage(nextPage);
        window.history.replaceState(
          null,
          "",
          buildBrowserHref(nextView, nextPage, nextSearch),
        );
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }

        setListError(
          caught instanceof Error
            ? caught.message
            : "Unable to load courses right now.",
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsListLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!searchDidMountRef.current) {
      searchDidMountRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      loadCourses(viewRef.current, 1, search);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [loadCourses, search]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // On narrow screens the segmented control scrolls; keep the chosen view in sight.
  const segmentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = segmentsRef.current?.parentElement;
    const active = segmentsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!track || !active || track.scrollWidth <= track.clientWidth) return;
    const left = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [view]);

  const counts = {
    ALL: dashboardStats.total_courses_enrolled,
    IN_PROGRESS: dashboardStats.in_process_courses,
    NOT_STARTED: dashboardStats.not_started_courses,
    COMPLETED: dashboardStats.completed_courses,
    SAVED: dashboardStats.bookmarked_courses,
  };

  function toggleBookmark(course: DisplayCourse) {
    const nextBookmarked = !course.bookmarked;
    const bookmarkDelta = nextBookmarked ? 1 : -1;
    setPendingCourseId(course.id);
    setDashboardStats((current) => updateBookmarkedStat(current, bookmarkDelta));

    setCourses((current) =>
      current.map((item) =>
        item.id === course.id ? { ...item, bookmarked: nextBookmarked } : item,
      ),
    );

    if (view === "SAVED" && !nextBookmarked) {
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setListMeta((current) => updateSavedMeta(current, bookmarkDelta));
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/proxy/courses/${course.id}/bookmark`, {
          method: nextBookmarked ? "POST" : "DELETE",
        });

        if (!res.ok) throw new Error("Bookmark update failed");
      } catch {
        setDashboardStats((current) =>
          updateBookmarkedStat(current, -bookmarkDelta),
        );
        setCourses((current) =>
          current.map((item) =>
            item.id === course.id
              ? { ...item, bookmarked: !nextBookmarked }
              : item,
          ),
        );
        if (view === "SAVED" && !nextBookmarked) {
          setListMeta((current) => updateSavedMeta(current, -bookmarkDelta));
          setCourses((current) => [
            { ...course, bookmarked: true, is_bookmarked: true },
            ...current,
          ]);
        }
      } finally {
        setPendingCourseId(null);
      }
    });
  }

  const showingStart = courses.length
    ? (listMeta.page - 1) * listMeta.page_size + 1
    : 0;
  const showingEnd = courses.length ? showingStart + courses.length - 1 : 0;
  const totalItems = listMeta.total_items || courses.length;

  const summary =
    dashboardStats.total_courses_enrolled === 0
      ? "Courses you enrol in will live here, with your progress saved as you go."
      : [
          plural(dashboardStats.total_courses_enrolled, "course"),
          dashboardStats.in_process_courses > 0 ? `${dashboardStats.in_process_courses} in progress` : null,
          dashboardStats.completed_courses > 0 ? `${dashboardStats.completed_courses} completed` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col pb-8">
      {/* Title */}
      <header className="lms-rise flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">My Courses</h1>
          <p className="m-0 mt-2 text-[0.98rem] text-ink-2">{summary}</p>
        </div>
        <Link href="/dashboard/course-catalogue" className="lms-btn lms-btn--quiet flex-none self-start sm:self-auto">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Browse catalogue
        </Link>
      </header>

      {/* Toolbar: segmented views and search. Sticks under the top bar while scrolling. */}
      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-5 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="lms-scroll-x -mx-1 overflow-x-auto px-1 pb-0.5">
            <div ref={segmentsRef} role="tablist" aria-label="Show courses" className="lms-segmented">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = view === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => loadCourses(tab.key, 1, search)}
                    className="lms-segment"
                  >
                    <Icon className="h-[15px] w-[15px]" strokeWidth={2} aria-hidden="true" />
                    {tab.label}
                    <span className="lms-segment-count">{counts[tab.key]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex w-full items-center gap-2 lg:w-auto lg:flex-none">
          <div className="lms-search min-w-0 flex-1 lg:w-[min(340px,32vw)] lg:flex-none">
            <label htmlFor="my-courses-search" className="sr-only">
              Search my courses
            </label>
            <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
            <input
              id="my-courses-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && search) setSearch("");
              }}
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              disabled={view === "SAVED"}
              placeholder={view === "SAVED" ? "Search is for enrolled courses" : "Search my courses"}
              className="disabled:cursor-not-allowed disabled:opacity-60"
            />
            {isListLoading ? (
              <Loader2 aria-label="Loading" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-3" />
            ) : search ? (
              <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="lms-search-clear">
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            ) : null}
          </div>
          <ViewToggle view={layout} onChange={setLayout} cookie="swcl_courses_view" />
          </div>
        </div>
      </div>

      {listError && (
        <p
          role="alert"
          className="m-0 mt-2 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]"
        >
          {listError}
        </p>
      )}

      {courses.length ? (
        <>
          {layout === "grid" ? (
          <ul
            aria-busy={isListLoading}
            className={`lms-course-grid m-0 mt-3 list-none p-0 transition-opacity duration-300 ${isListLoading ? "opacity-55" : "opacity-100"}`}
          >
            {courses.map((course, index) => (
              <li key={course.id} className="lms-rise min-w-0" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
                <DashboardCourseCard
                  course={course}
                  image={course.thumbnail_url || fallbackImages[index % fallbackImages.length]}
                  savedOnly={view === "SAVED"}
                  pending={isPending && pendingCourseId === course.id}
                  onToggleBookmark={toggleBookmark}
                />
              </li>
            ))}
          </ul>
          ) : (
          <ul
            aria-busy={isListLoading}
            className={`lms-group m-0 mt-3 list-none p-0 transition-opacity duration-300 ${isListLoading ? "opacity-55" : "opacity-100"}`}
          >
            {courses.map((course, index) => (
              <li key={course.id}>
                <DashboardCourseRow
                  course={course}
                  image={course.thumbnail_url || fallbackImages[index % fallbackImages.length]}
                  savedOnly={view === "SAVED"}
                  pending={isPending && pendingCourseId === course.id}
                  onToggleBookmark={toggleBookmark}
                />
              </li>
            ))}
          </ul>
          )}

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="m-0 text-sm text-ink-3">
              {showingStart}–{showingEnd} of {plural(totalItems, "course")}
            </p>
            <Pagination
              currentPage={page}
              disabled={isListLoading}
              meta={listMeta}
              onPageChange={(nextPage) => {
                loadCourses(view, nextPage, search);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      ) : (
        <EmptyCourses view={view} searching={Boolean(search.trim())} onClear={() => setSearch("")} />
      )}
    </div>
  );
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function EmptyCourses({
  view,
  searching,
  onClear,
}: {
  view: CourseView;
  searching: boolean;
  onClear: () => void;
}) {
  const copy: Record<CourseView, { title: string; body: string }> = {
    ALL: { title: "No courses yet", body: "Enrol in a course and it will appear here, with your progress saved as you learn." },
    IN_PROGRESS: { title: "Nothing in progress", body: "Start a lesson in any of your courses and it will show up here." },
    NOT_STARTED: { title: "You’ve started everything", body: "Every course you enrolled in is under way. Nice work." },
    COMPLETED: { title: "No completed courses yet", body: "Finish every lesson in a course and it will move here, with its certificate if it has one." },
    SAVED: { title: "Nothing saved", body: "Tap the bookmark on any course to keep it here for later." },
  };
  const { title, body } = searching
    ? { title: "No matches", body: "No course in this view matches your search. Try fewer or different words." }
    : copy[view];

  return (
    <div className="lms-milk lms-rise mt-3 flex flex-col items-center px-6 py-14 text-center sm:py-20">
      <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
        {searching ? <Search className="h-7 w-7" strokeWidth={1.8} /> : <BookOpen className="h-7 w-7" strokeWidth={1.8} />}
      </span>
      <h2 className="m-0 mt-5 text-[1.25rem] font-bold tracking-[-0.02em] text-ink">{title}</h2>
      <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {searching ? (
          <button type="button" onClick={onClear} className="lms-btn lms-btn--quiet">
            Clear search
          </button>
        ) : (
          <Link href="/dashboard/course-catalogue" className="lms-btn">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Browse the catalogue
          </Link>
        )}
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  disabled,
  meta,
  onPageChange,
}: {
  currentPage: number;
  disabled: boolean;
  meta: Meta;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, meta.total_pages || 1);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return start + index;
  }).filter((page) => page >= 1 && page <= totalPages);

  return (
    <nav className="lms-pager" aria-label="Course pages">
      <PageButton
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={disabled || !meta.has_previous}
        label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
      {pages.map((page) => (
        <PageButton
          key={page}
          onClick={() => onPageChange(page)}
          active={page === currentPage}
          disabled={disabled}
          label={`Page ${page}`}
        >
          {page}
        </PageButton>
      ))}
      {totalPages > 5 && !pages.includes(totalPages) && (
        <>
          <span aria-hidden="true" className="grid h-9 w-6 place-items-center text-sm text-ink-3">
            …
          </span>
          <PageButton onClick={() => onPageChange(totalPages)} disabled={disabled} label={`Page ${totalPages}`}>
            {totalPages}
          </PageButton>
        </>
      )}
      <PageButton
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={disabled || !meta.has_next}
        label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="lms-page"
    >
      {children}
    </button>
  );
}

function DashboardCourseCard({
  course,
  image,
  savedOnly,
  pending,
  onToggleBookmark,
}: {
  course: DisplayCourse;
  image: string;
  savedOnly: boolean;
  pending: boolean;
  onToggleBookmark: (course: DisplayCourse) => void;
}) {
  const instructor = getInstructor(course);
  const accessDate = formatDate(course.access_end_date);
  const completionDate = formatDate(course.updated_at);
  const status = course.displayStatus;
  const isComplete = status === "COMPLETED";
  const label = actionLabel(status, savedOnly, course.wishlist);
  const durationLabel = getCourseDurationLabel(course);
  const hasCertificate = course.certificate_enabled === true;
  const href = actionHref(course);
  const ActionIcon = course.wishlist ? ArrowUpRight : isComplete ? RotateCcw : Play;

  const footnote = course.wishlist
    ? "Saved for later. Enrol to start."
    : isComplete
      ? `Completed${completionDate ? ` ${completionDate}` : ""}`
      : accessDate
        ? `Access until ${accessDate}`
        : "Lifetime access";

  return (
    <article className="lms-milk lms-milk-hover group relative flex h-full flex-col p-2.5">
      {/* Artwork in a rounded window, with frosted controls on top */}
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="lms-art relative block aspect-[16/9] overflow-hidden bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            className="sw-zoom h-full w-full object-cover"
          />
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span className={`lms-glass-pill ${course.wishlist ? "" : statusTone(status)}`}>
            {course.wishlist ? (
              <Bookmark className="h-3 w-3 fill-current" aria-hidden="true" />
            ) : isComplete ? (
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            ) : (
              <span aria-hidden="true" className="lms-glass-dot" />
            )}
            {course.wishlist ? "Saved" : formatStatus(status)}
          </span>
          {course.has_new_content && !course.wishlist && (
            <span className="lms-glass-pill lms-glass-pill--new">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              New
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggleBookmark(course)}
          aria-pressed={course.bookmarked}
          aria-label={course.bookmarked ? `Remove ${course.title} from saved` : `Save ${course.title}`}
          title={course.bookmarked ? "Saved" : "Save for later"}
          className="lms-glass-btn absolute right-2.5 top-2.5 z-[2]"
          data-on={course.bookmarked || undefined}
        >
          <Bookmark className={`h-4 w-4 ${course.bookmarked ? "fill-current" : ""}`} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
        <h2 className="sw-title m-0 line-clamp-2 text-[1.08rem] leading-snug text-ink">
          <Link href={href} className="text-inherit no-underline after:absolute after:inset-0 after:rounded-[24px] after:content-['']">
            {course.title}
          </Link>
        </h2>

        <div className="mt-2.5 flex min-w-0 items-center gap-2">
          {instructor.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={instructor.avatar_url} alt="" loading="lazy" className="h-6 w-6 flex-none rounded-full object-cover" />
          ) : (
            <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-card text-[0.68rem] font-bold text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.08]">
              {instructor.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="min-w-0 truncate text-[0.85rem] text-ink-2">{instructor.name}</span>
        </div>

        {(durationLabel || hasCertificate) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {durationLabel && (
              <span className="lms-chip-milk">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                {durationLabel}
              </span>
            )}
            {hasCertificate && (
              <span className="lms-chip-milk">
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
                Certificate
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          {!course.wishlist && (
            <div className="mb-3.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs text-ink-3">
                <span>{status === "NOT_STARTED" ? "Not started" : isComplete ? "All lessons done" : "Progress"}</span>
                <span className="font-semibold tabular-nums text-ink">{course.displayProgress}%</span>
              </div>
              <span
                role="progressbar"
                aria-valuenow={course.displayProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${course.title} progress`}
                className="lms-bar"
                data-empty={course.displayProgress === 0 || undefined}
              >
                <span style={{ width: `${course.displayProgress}%` }} />
              </span>
            </div>
          )}

          <div className="relative z-[1] flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-[0.78rem] text-ink-3">{footnote}</span>
            <div className="flex flex-none items-center gap-1.5">
              {isComplete && hasCertificate && !course.wishlist && (
                <Link
                  href={`/dashboard/certificates/${course.id}`}
                  aria-label={`View certificate for ${course.title}`}
                  title="View certificate"
                  className="grid h-9 w-9 place-items-center rounded-full bg-gold text-[#3d2700] transition-transform hover:scale-105"
                >
                  <Award className="h-4 w-4" />
                </Link>
              )}
              <Link
                href={href}
                className={`lms-btn !min-h-9 !px-4 !text-[0.82rem] ${isComplete || course.wishlist ? "lms-btn--quiet" : ""}`}
              >
                <ActionIcon className={`h-3.5 w-3.5 ${ActionIcon === Play ? "fill-current" : ""}`} aria-hidden="true" />
                {label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function statusTone(status: ProgressStatus | null) {
  if (status === "COMPLETED") return "lms-glass-pill--done";
  if (status === "IN_PROGRESS") return "lms-glass-pill--live";
  return "";
}

function DashboardCourseRow({
  course,
  image,
  savedOnly,
  pending,
  onToggleBookmark,
}: {
  course: DisplayCourse;
  image: string;
  savedOnly: boolean;
  pending: boolean;
  onToggleBookmark: (course: DisplayCourse) => void;
}) {
  const instructor = getInstructor(course);
  const status = course.displayStatus;
  const isComplete = status === "COMPLETED";
  const label = actionLabel(status, savedOnly, course.wishlist);
  const href = actionHref(course);
  const durationLabel = getCourseDurationLabel(course);
  const tone = course.wishlist ? "orange" : isComplete ? "green" : status === "IN_PROGRESS" ? "blue" : "gray";

  return (
    <div className="lms-row group">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="lms-art relative block aspect-[16/10] w-24 flex-none overflow-hidden bg-paper-2 !rounded-[12px] sm:w-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 truncate text-[1rem] font-semibold tracking-[-0.01em] text-ink">
          <Link href={href} className="lms-stretch text-inherit no-underline">
            {course.title}
          </Link>
        </h2>
        <p className="m-0 mt-0.5 truncate text-[0.82rem] text-ink-3">
          {instructor.name}
          {durationLabel ? ` · ${durationLabel}` : ""}
        </p>
        <span className="mt-1.5 flex items-center gap-3 text-[0.8rem]">
          <span className={`lms-status lms-status--${tone}`}>{course.wishlist ? "Saved" : formatStatus(status)}</span>
          {!course.wishlist && (
            <span className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[14rem]">
              <span
                role="progressbar"
                aria-valuenow={course.displayProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${course.title} progress`}
                className="lms-bar min-w-0 flex-1"
                data-empty={course.displayProgress === 0 || undefined}
              >
                <span style={{ width: `${course.displayProgress}%` }} />
              </span>
              <span className="flex-none font-semibold tabular-nums text-ink-2">{course.displayProgress}%</span>
            </span>
          )}
        </span>
      </div>
      <div className="relative z-[1] flex flex-none items-center gap-1.5">
        <span className={`lms-row-action ${isComplete || course.wishlist ? "" : "lms-row-action--primary"} hidden sm:inline-flex`} aria-hidden="true">
          {label}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggleBookmark(course)}
          aria-pressed={course.bookmarked}
          aria-label={course.bookmarked ? `Remove ${course.title} from saved` : `Save ${course.title}`}
          title={course.bookmarked ? "Saved" : "Save for later"}
          className={`lms-gpop-x !h-9 !w-9 ${course.bookmarked ? "!text-clay" : ""}`}
        >
          <Bookmark className={`h-4 w-4 ${course.bookmarked ? "fill-current" : ""}`} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
