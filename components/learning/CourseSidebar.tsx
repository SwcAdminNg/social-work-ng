"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Boxes,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Link2,
  Lock,
  Moon,
  PanelLeft,
  Play,
  PlayCircle,
  Star,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "@/components/generic/ThemeProvider";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { ReviewModal } from "./ReviewModal";
import { ResourceRead, formatResourceCategory } from "@/lib/resources";

type ReviewValue = {
  id: string;
  rating: number;
  review_text?: string;
};

type CurriculumItem = {
  id: string;
  title: string;
  item_type?: string | null;
  assessment_type?: string | null;
  is_completed?: boolean | null;
  estimated_minutes?: number | null;
};

type CurriculumSection = {
  id: string;
  title: string;
  items?: CurriculumItem[] | null;
  is_locked?: boolean | null;
  guest_instructors?: GuestInstructor[] | null;
};

type Curriculum = {
  course_title?: string | null;
  progress_percent?: number | null;
  total_reviews?: number | null;
  average_rating?: number | null;
  sections?: CurriculumSection[] | null;
};

type GuestInstructor = {
  user_id?: string | null;
  name?: string | null;
  profile_picture_url?: string | null;
  is_guest?: boolean | null;
};

interface CoursePlayerShellProps {
  courseId: string;
  curriculum: Curriculum;
  resources?: ResourceRead[];
  children: React.ReactNode;
}

const OUTLINE_KEY = "swcl:learn-outline";
const outlineListeners = new Set<() => void>();

function subscribeOutline(listener: () => void) {
  outlineListeners.add(listener);
  return () => outlineListeners.delete(listener);
}

function readOutlinePinned() {
  try {
    return localStorage.getItem(OUTLINE_KEY) !== "closed";
  } catch {
    return true;
  }
}

function writeOutlinePinned(open: boolean) {
  try {
    localStorage.setItem(OUTLINE_KEY, open ? "open" : "closed");
  } catch {
    // The choice simply will not be remembered.
  }
  outlineListeners.forEach((listener) => listener());
}

/**
 * The course player window, after Apple's document apps: a source-list
 * sidebar with the course and its modules, a flat toolbar over the lesson,
 * and the lesson itself. The sidebar is a drawer on small screens and can be
 * hidden on wide ones.
 */
export function CoursePlayerShell({
  courseId,
  curriculum,
  resources = [],
  children,
}: CoursePlayerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle, setHeaderToggle } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Whether the sidebar stays beside the lesson on wide screens; remembered per browser.
  const outlinePinned = useSyncExternalStore(subscribeOutline, readOutlinePinned, () => true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState<ReviewValue | null>(null);

  const progress = Math.min(Math.max(Math.round(Number(curriculum.progress_percent || 0)), 0), 100);
  const sections = curriculum.sections || [];
  const allItems = sections.flatMap((section) => section.items || []);
  const activeItem = allItems.find((item) =>
    pathname.startsWith(`/learn/${courseId}/item/${item.id}`),
  );
  const activeSectionIndex = sections.findIndex((section) =>
    (section.items || []).some((item) => item.id === activeItem?.id),
  );
  const activeSectionId = activeSectionIndex >= 0 ? sections[activeSectionIndex].id : undefined;
  const completedCount = allItems.filter((item) => item.is_completed).length;
  const totalEstimatedMinutes = allItems.reduce(
    (total, item) => total + getEstimatedMinutes(item),
    0,
  );
  const courseTitle = curriculum.course_title || "Course";
  const isDark = theme === "dark";
  const reviewCount = Number(curriculum.total_reviews || 0);

  // Modules fold away; the one being studied is open, as are short courses.
  const [closedSections, setClosedSections] = useState<Set<string>>(
    () =>
      new Set(
        sections.length > 2
          ? sections.filter((section) => section.id !== activeSectionId).map((section) => section.id)
          : [],
      ),
  );
  const [seenActiveSection, setSeenActiveSection] = useState(activeSectionId);
  if (activeSectionId !== seenActiveSection) {
    // Moving into another module opens it.
    setSeenActiveSection(activeSectionId);
    if (activeSectionId && closedSections.has(activeSectionId)) {
      const next = new Set(closedSections);
      next.delete(activeSectionId);
      setClosedSections(next);
    }
  }

  function toggleSection(id: string) {
    setClosedSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // The player has its own theme switch, so the floating one steps aside.
  useEffect(() => {
    setHeaderToggle(true);
    return () => setHeaderToggle(false);
  }, [setHeaderToggle]);

  // The drawer closes on Escape and holds the page still while it is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const fetchUserReview = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/reviews/me`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.id) {
          setUserReview(data.data);
          localStorage.setItem(`has_reviewed_${courseId}`, "true");
        }
      }
    } catch (e) {
      console.error("Failed to fetch user review", e);
    }
  }, [courseId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUserReview();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchUserReview]);

  const itemNumbers = new Map<string, number>();
  allItems.forEach((item, index) => itemNumbers.set(item.id, index + 1));

  const sidebar = (
    <div className="flex h-full w-[min(88vw,var(--pl-side))] flex-col lg:w-[var(--pl-side)]">
      {/* Navigation bar: the way back, and the sidebar's own toggle. */}
      <div className="flex h-[var(--pl-top)] flex-none items-center justify-between gap-2 pl-2 pr-2">
        <Link href="/dashboard/courses" className="lms-back">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={2.2} aria-hidden="true" />
          My Courses
        </Link>
        <button
          type="button"
          onClick={() => writeOutlinePinned(false)}
          aria-label="Hide sidebar"
          title="Hide sidebar"
          className="lms-side-btn hidden lg:grid"
        >
          <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close course outline"
          className="lms-side-btn lg:hidden"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>

      {/* The course: title, progress, rating. */}
      <div className="flex-none px-4 pb-4 pt-1">
        <h2 className="m-0 line-clamp-3 font-[family-name:var(--font-roboto)] text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] text-ink">
          {courseTitle}
        </h2>
        <span className="lms-meter mt-3" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
        <p
          className="m-0 mt-1.5 flex items-center justify-between gap-3 text-xs text-ink-3"
          role="progressbar"
          aria-label="Course progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span>
            {completedCount} of {allItems.length} complete
            {totalEstimatedMinutes > 0 && <> · {formatMinutes(totalEstimatedMinutes)}</>}
          </span>
          <span className="font-semibold tabular-nums text-ink-2">{progress}%</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 text-[0.8125rem]">
          {reviewCount > 0 ? (
            <span className="flex items-center gap-1 text-ink-3">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
              <span className="font-semibold text-ink">
                {Number(curriculum.average_rating || 0).toFixed(1)}
              </span>
              <span>
                ({reviewCount} {reviewCount === 1 ? "rating" : "ratings"})
              </span>
            </span>
          ) : (
            <span className="text-ink-3">No ratings yet</span>
          )}
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="cursor-pointer rounded-md px-1 font-semibold text-accent hover:opacity-75"
          >
            {userReview ? "Edit Rating" : "Rate Course"}
          </button>
        </div>
      </div>

      <nav
        aria-label="Lessons"
        className="lms-scroll min-h-0 flex-1 overflow-y-auto px-2.5 pb-6 pt-2 shadow-[inset_0_1px_0_var(--sw-line)]"
      >
        {sections.map((section, sectionIndex) => {
          const isSectionLocked = section.is_locked === true;
          const guestLabel = formatGuestInstructors(section.guest_instructors);
          const items = section.items || [];
          const firstIncompleteIndex = items.findIndex((i) => !i.is_completed);
          const frontierIndex = firstIncompleteIndex === -1 ? items.length : firstIncompleteIndex;
          const doneInSection = items.filter((i) => i.is_completed).length;
          const isOpen = !closedSections.has(section.id);
          const panelId = `module-${section.id}`;

          return (
            <section key={section.id} className="mb-1">
              <h3 className="m-0 font-[family-name:var(--font-roboto)] tracking-normal">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="lms-mod"
                >
                  <ChevronRight className="lms-mod-chev" strokeWidth={2.4} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="lms-mod-num">
                      Module {sectionIndex + 1} · {doneInSection} of {items.length}
                    </span>
                    <span className="lms-mod-title">{section.title}</span>
                    {guestLabel && <span className="lms-mod-sub line-clamp-1">{guestLabel}</span>}
                  </span>
                  {isSectionLocked ? (
                    <Lock className="mt-0.5 h-3.5 w-3.5 flex-none text-ink-3" aria-label="Locked" />
                  ) : doneInSection === items.length && items.length > 0 ? (
                    <span className="lms-glyph lms-glyph--done mt-0.5 !h-4 !w-4" aria-label="Module complete">
                      <Check className="!h-2.5 !w-2.5" strokeWidth={3.5} />
                    </span>
                  ) : null}
                </button>
              </h3>

              <ul id={panelId} hidden={!isOpen} className="m-0 list-none space-y-px p-0 pb-2 pl-3">
                {items.map((item, itemIndex) => {
                  const itemUrl = `/learn/${courseId}/item/${item.id}`;
                  const isActive = pathname.startsWith(itemUrl);
                  const isLiveSession = item.item_type === "LIVE_SESSION";
                  const isSequentialLocked =
                    !isSectionLocked && !isLiveSession && itemIndex > frontierIndex;
                  const isItemBlocked = isSectionLocked || isSequentialLocked;

                  const glyph = isItemBlocked ? (
                    <span className="lms-glyph lms-glyph--locked" aria-hidden="true">
                      <Lock strokeWidth={2.6} />
                    </span>
                  ) : item.is_completed ? (
                    <span className="lms-glyph lms-glyph--done" aria-hidden="true">
                      <Check strokeWidth={3.4} />
                    </span>
                  ) : isActive ? (
                    <span className="lms-glyph lms-glyph--now" aria-hidden="true">
                      <Play fill="currentColor" strokeWidth={0} />
                    </span>
                  ) : (
                    <span className="lms-glyph" aria-hidden="true">
                      {itemNumbers.get(item.id)}
                    </span>
                  );

                  const itemInner = (
                    <>
                      {glyph}
                      <span className="min-w-0">
                        <span className="lms-lesson-title">
                          {item.title}
                          {item.is_completed && <span className="sr-only"> (complete)</span>}
                        </span>
                        <span className="lms-lesson-meta">
                          {getItemIcon(item)}
                          <span className="truncate">
                            {isSectionLocked
                              ? "Locked"
                              : isSequentialLocked
                                ? "Finish the previous lesson first"
                                : isLiveSession
                                  ? getLiveSessionMetaLabel(item)
                                  : getItemMetaLabel(item)}
                          </span>
                        </span>
                      </span>
                    </>
                  );

                  if (isItemBlocked) {
                    return (
                      <li key={item.id}>
                        <div className="lms-lesson" aria-disabled="true">
                          {itemInner}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id}>
                      <Link
                        href={itemUrl}
                        onClick={() => setDrawerOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className="lms-lesson"
                      >
                        {itemInner}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {resources.length > 0 && (
          <section className="mt-2 pt-3 shadow-[inset_0_1px_0_var(--sw-line)]">
            <h3 className="m-0 px-2 pb-1.5 font-[family-name:var(--font-roboto)] text-xs font-bold tracking-normal text-ink-3">
              Resources
            </h3>
            <ul className="m-0 list-none space-y-px p-0">
              {resources.map((resource) => {
                const resourceUrl = `/resources/${resource.slug || resource.id}`;
                const isLocked = resource.can_access === false;

                return (
                  <li key={resource.id}>
                    <Link
                      href={resourceUrl}
                      onClick={() => setDrawerOpen(false)}
                      className="lms-lesson"
                    >
                      <span className="lms-glyph lms-glyph--locked" aria-hidden="true">
                        {isLocked ? <Lock strokeWidth={2.6} /> : getResourceIcon(resource.category)}
                      </span>
                      <span className="min-w-0">
                        <span className="lms-lesson-title">{resource.name}</span>
                        <span className="lms-lesson-meta">
                          {isLocked
                            ? getResourceLockLabel(resource)
                            : formatResourceCategory(resource.category)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={`/resources?course_id=${courseId}`}
              onClick={() => setDrawerOpen(false)}
              className="mt-1 flex items-center gap-1 rounded-lg px-2 py-2 text-[0.8125rem] font-semibold text-accent no-underline hover:opacity-75"
            >
              Show All Resources
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </section>
        )}
      </nav>
    </div>
  );

  const activeLabel = activeItem
    ? activeSectionIndex >= 0
      ? `Module ${activeSectionIndex + 1} · ${courseTitle}`
      : courseTitle
    : null;

  return (
    <div className="lms-player flex h-dvh overflow-hidden">
      {/* Small screens: the sidebar slides in over a dimmed page. */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-night/40 backdrop-blur-[2px] transition-opacity duration-500 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="course-outline"
        aria-label="Course outline"
        className={`lms-side fixed inset-y-0 left-0 z-50 flex-none overflow-hidden transition-[translate,visibility,width] duration-500 ease-sw motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-[110%] max-lg:invisible"
        } ${outlinePinned ? "lg:w-[var(--pl-side)]" : "lg:invisible lg:w-0"}`}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Window toolbar. */}
        <header className="lms-pl-top relative z-10 flex flex-none items-center gap-1 px-2 sm:px-3">
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Show course outline"
              aria-expanded={drawerOpen}
              aria-controls="course-outline"
              className="lms-tool lg:hidden"
            >
              <PanelLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>
            {!outlinePinned && (
              <>
                <button
                  type="button"
                  onClick={() => writeOutlinePinned(true)}
                  aria-label="Show sidebar"
                  title="Show sidebar"
                  aria-controls="course-outline"
                  aria-expanded={false}
                  className="lms-tool hidden lg:grid"
                >
                  <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </button>
                <Link href="/dashboard/courses" className="lms-back hidden lg:inline-flex">
                  <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={2.2} aria-hidden="true" />
                  My Courses
                </Link>
              </>
            )}
          </div>

          <div className="min-w-0 max-w-[min(34rem,56vw)] flex-none text-center leading-tight">
            <p className="m-0 truncate text-[0.875rem] font-semibold tracking-[-0.01em] text-ink">
              {activeItem?.title || courseTitle}
            </p>
            {activeLabel && (
              <p className="m-0 hidden truncate text-[0.6875rem] text-ink-3 sm:block">{activeLabel}</p>
            )}
          </div>

          <div className="flex min-w-0 flex-1 basis-0 items-center justify-end gap-1.5">
            <span className="hidden items-center gap-2 pr-1 text-xs tabular-nums text-ink-3 md:flex">
              <ProgressRing
                value={progress}
                size={22}
                stroke={3}
                label="Course progress"
                className="text-ink [--ring:var(--sw-accent)]"
              />
              {progress}%
            </span>
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="lms-tool"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />}
            </button>
          </div>
        </header>

        <main id="main-content" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>

      <ReviewModal
        courseId={courseId}
        isOpen={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onDismiss={() => {}}
        existingReview={userReview}
        onReviewSubmitted={() => {
          fetchUserReview();
          router.refresh();
        }}
      />
    </div>
  );
}

function getItemIcon(item: CurriculumItem) {
  const type = item.item_type;

  if (type === "VIDEO") return <PlayCircle aria-hidden="true" />;
  if (type === "DOCUMENT") return <FileText aria-hidden="true" />;
  if (type === "SCORM") return <Boxes aria-hidden="true" />;
  if (type === "LINKS") return <Link2 aria-hidden="true" />;
  if (type === "LIVE_SESSION") return <CalendarDays aria-hidden="true" />;
  if (type === "ASSESSMENT" || type === "QUIZ" || type === "ESSAY") {
    return <HelpCircle aria-hidden="true" />;
  }

  return <BookOpen aria-hidden="true" />;
}

function getResourceIcon(category?: string) {
  if (category === "VIDEOS_AND_WEBINARS") return <PlayCircle strokeWidth={2.2} />;
  if (category === "USEFUL_LINKS") return <Link2 strokeWidth={2.2} />;
  return <FileText strokeWidth={2.2} />;
}

function getResourceLockLabel(resource: ResourceRead) {
  if (resource.access_reason === "LOGIN_REQUIRED") return "Log in to unlock";
  if (resource.access_reason === "ENROLLMENT_REQUIRED") return "Enrollment required";
  return "Locked";
}

function formatGuestInstructors(guests?: GuestInstructor[] | null) {
  const names = (guests || [])
    .map((guest) => guest.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return null;
  return `${names.length === 1 ? "Guest lecturer" : "Guest lecturers"}: ${names.join(", ")}`;
}

function getItemLabel(item: { item_type?: string | null; assessment_type?: string | null }) {
  if (item.item_type === "ASSESSMENT" && item.assessment_type) {
    return `${titleCaseEnum(item.assessment_type)} assessment`;
  }

  if (item.item_type === "SCORM") return "Interactive lesson";
  return titleCaseEnum(item.item_type);
}

function getItemMetaLabel(item: CurriculumItem) {
  const estimate = getEstimatedMinutes(item);
  return estimate > 0
    ? `${getItemLabel(item)} · ${formatMinutes(estimate)}`
    : getItemLabel(item);
}

function getLiveSessionMetaLabel(item: CurriculumItem) {
  const estimate = getEstimatedMinutes(item);
  return estimate > 0 ? `Live session · ${formatMinutes(estimate)}` : "Live session";
}

function getEstimatedMinutes(item: { estimated_minutes?: number | null }) {
  return typeof item.estimated_minutes === "number" && item.estimated_minutes > 0
    ? item.estimated_minutes
    : 0;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function titleCaseEnum(value?: string | null) {
  if (!value) return "Item";
  const words = value.split("_").map((word) => word.toLowerCase());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
}
