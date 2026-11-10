"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconCheck } from "@/components/auth/shared/icons";
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  CalendarDays,
  ChevronDown,
  FileText,
  HelpCircle,
  Link2,
  ListTree,
  Lock,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
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
 * The course player frame: the outline beside (or over) the lesson, a slim
 * top bar with the way out and overall progress, and the lesson itself.
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
  // Whether the outline stays beside the lesson on wide screens; remembered per browser.
  const outlinePinned = useSyncExternalStore(subscribeOutline, readOutlinePinned, () => true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState<ReviewValue | null>(null);

  const progress = Math.min(Math.max(Number(curriculum.progress_percent || 0), 0), 100);
  const sections = curriculum.sections || [];
  const allItems = sections.flatMap((section) => section.items || []);
  const activeItem = allItems.find((item) =>
    pathname.startsWith(`/learn/${courseId}/item/${item.id}`),
  );
  const activeSectionId = sections.find((section) =>
    (section.items || []).some((item) => item.id === activeItem?.id),
  )?.id;
  const completedCount = allItems.filter((item) => item.is_completed).length;
  const totalEstimatedMinutes = allItems.reduce(
    (total, item) => total + getEstimatedMinutes(item),
    0,
  );
  const courseTitle = curriculum.course_title || "Course";
  const isDark = theme === "dark";

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

  const outline = (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-none px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="lms-kicker m-0 mt-1.5">Course outline</p>
          <button
            type="button"
            className="lms-icon-btn -mr-2 -mt-2 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close course outline"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="sw-title m-0 mt-3 line-clamp-3 text-[1.2rem] text-ink">{courseTitle}</h2>

        <div className="lms-well mt-4 flex items-center gap-3.5 p-3">
          <ProgressRing value={progress} size={52} stroke={6} label="Course progress" className="text-ink [--ring:var(--sw-green)] dark:[--ring:var(--sw-leaf)]">
            <span className="text-[0.72rem] font-bold tabular-nums text-ink">{progress}%</span>
          </ProgressRing>
          <div className="min-w-0 flex-1 text-sm leading-snug">
            <p className="m-0 font-semibold text-ink">
              {completedCount} of {allItems.length} lessons done
            </p>
            {totalEstimatedMinutes > 0 && (
              <p className="m-0 mt-0.5 text-ink-3">
                About {formatMinutes(totalEstimatedMinutes)} in total
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {Number(curriculum.total_reviews || 0) > 0 ? (
            <p className="m-0 flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
              <span className="font-semibold text-ink">
                {Number(curriculum.average_rating || 0).toFixed(1)}
              </span>
              <span>({curriculum.total_reviews} reviews)</span>
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="lms-btn lms-btn--quiet min-h-9 px-3.5 text-[0.8125rem]"
          >
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            {userReview ? "Edit your rating" : "Rate this course"}
          </button>
        </div>
      </div>

      <nav
        aria-label="Lessons"
        className="lms-scroll min-h-0 flex-1 overflow-y-auto border-t border-line px-3 pb-6 pt-3 text-ink"
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
            <section key={section.id} className="mb-1.5">
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-2xl px-2.5 py-2.5 text-left transition-colors duration-200 hover:bg-ink/[0.05]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="sw-cap block text-accent">
                      Module {sectionIndex + 1}
                      <span className="text-ink-3">
                        {" "}
                        · {doneInSection}/{items.length}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block font-[family-name:var(--font-roboto)] text-[0.95rem] font-semibold leading-snug tracking-normal text-ink">
                      {section.title}
                    </span>
                    {guestLabel && (
                      <span className="mt-1 line-clamp-1 block font-[family-name:var(--font-roboto)] text-xs font-normal tracking-normal text-ink-3">
                        {guestLabel}
                      </span>
                    )}
                  </span>
                  {isSectionLocked && (
                    <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-ink/[0.07] text-ink-3">
                      <Lock className="h-3.5 w-3.5" aria-label="Locked" />
                    </span>
                  )}
                  <ChevronDown
                    aria-hidden="true"
                    className={`mt-1 h-4 w-4 flex-none text-ink-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </h3>

              <ul id={panelId} hidden={!isOpen} className="m-0 list-none space-y-0.5 p-0 pb-2">
                {items.map((item, itemIndex) => {
                  const itemUrl = `/learn/${courseId}/item/${item.id}`;
                  const isActive = pathname.startsWith(itemUrl);
                  const isLiveSession = item.item_type === "LIVE_SESSION";
                  const isSequentialLocked =
                    !isSectionLocked && !isLiveSession && itemIndex > frontierIndex;
                  const isItemBlocked = isSectionLocked || isSequentialLocked;

                  const itemInner = (
                    <>
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                          item.is_completed
                            ? "bg-brand text-white dark:bg-leaf dark:text-[#06130d]"
                            : isActive
                              ? "bg-gold text-[#10231a]"
                              : "bg-ink/[0.06] text-ink-3"
                        }`}
                        aria-hidden
                      >
                        {isItemBlocked ? (
                          <Lock className="h-3.5 w-3.5" />
                        ) : item.is_completed ? (
                          <span className="flex h-3.5 w-3.5 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                            <IconCheck />
                          </span>
                        ) : (
                          itemNumbers.get(item.id)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`line-clamp-2 block text-[0.92rem] leading-5 ${
                            isActive ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.title}
                          {item.is_completed && <span className="sr-only"> (complete)</span>}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                          <span className="[&>svg]:h-3 [&>svg]:w-3" aria-hidden>
                            {getItemIcon(item)}
                          </span>
                          {isSectionLocked
                            ? "Locked"
                            : isSequentialLocked
                              ? "Complete the previous item first"
                              : isLiveSession
                                ? getLiveSessionMetaLabel(item)
                                : getItemMetaLabel(item)}
                        </span>
                      </span>
                    </>
                  );

                  if (isItemBlocked) {
                    return (
                      <li key={item.id}>
                        <div
                          className="grid min-h-[52px] cursor-not-allowed grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-2xl px-2.5 py-2 text-ink-3 opacity-70"
                          aria-disabled="true"
                        >
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
                        className={`grid min-h-[52px] grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-2xl px-2.5 py-2 no-underline transition-[background-color,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                          isActive
                            ? "bg-mint text-ink shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--sw-green)_45%,transparent)] dark:bg-white/[0.08]"
                            : "text-ink-2 hover:bg-ink/[0.05]"
                        }`}
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
          <section className="mt-3 border-t border-line pt-4">
            <div className="px-2.5 pb-2">
              <p className="sw-cap m-0 text-accent">Course resources</p>
              <h3 className="m-0 mt-1 font-[family-name:var(--font-roboto)] text-[0.95rem] font-semibold tracking-normal text-ink">
                Templates, readings &amp; links
              </h3>
            </div>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {resources.map((resource) => {
                const resourceUrl = `/resources/${resource.slug || resource.id}`;
                const isLocked = resource.can_access === false;

                return (
                  <li key={resource.id}>
                    <Link
                      href={resourceUrl}
                      onClick={() => setDrawerOpen(false)}
                      className="grid min-h-[52px] grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-2xl px-2.5 py-2 text-ink-2 no-underline transition-colors hover:bg-ink/[0.05]"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ink/[0.06] text-ink-3">
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : getResourceIcon(resource.category)}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-[0.92rem] font-medium leading-5">
                          {resource.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-3">
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
              className="lms-btn lms-btn--quiet mx-2 mt-3 flex"
            >
              View all course resources
            </Link>
          </section>
        )}
      </nav>
    </div>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* The outline: a drawer on small screens, a panel beside the lesson on wide ones. */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-night/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="course-outline"
        aria-label="Course outline"
        className={`fixed inset-y-0 left-0 z-50 w-[min(90vw,380px)] flex-none overflow-hidden p-2.5 transition-[translate,visibility,width,opacity,padding] duration-500 ease-sw motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0 lg:py-3 lg:pl-3 lg:pr-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-[105%] max-lg:invisible"
        } ${outlinePinned ? "lg:w-[348px]" : "lg:invisible lg:w-0 lg:pl-0 lg:opacity-0"}`}
      >
        <div className="lms-card h-full overflow-hidden max-lg:shadow-2xl lg:w-[336px]">{outline}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex-none px-3 pt-3 sm:px-5">
          <div className="flex h-14 items-center gap-1.5 rounded-full bg-card/85 px-2 shadow-[inset_0_0_0_1px_var(--sw-line)] backdrop-blur-xl sm:gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open course outline"
              aria-expanded={drawerOpen}
              aria-controls="course-outline"
              className="lms-icon-btn h-10 w-10 lg:hidden"
            >
              <ListTree className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => writeOutlinePinned(!outlinePinned)}
              aria-label={outlinePinned ? "Hide course outline" : "Show course outline"}
              aria-expanded={outlinePinned}
              aria-controls="course-outline"
              title={outlinePinned ? "Hide outline" : "Show outline"}
              className="lms-icon-btn hidden h-10 w-10 lg:grid"
            >
              {outlinePinned ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/dashboard/courses"
              className="flex h-10 flex-none items-center gap-2 rounded-full px-2.5 text-sm font-semibold text-ink-2 no-underline transition-colors duration-300 hover:bg-ink/[0.06] hover:text-ink sm:px-3.5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">My courses</span>
              <span className="sr-only sm:hidden">Back to my courses</span>
            </Link>

            <span aria-hidden="true" className="h-5 w-px flex-none bg-line" />

            <p className="sw-title m-0 min-w-0 flex-1 truncate px-1.5 text-[0.98rem] text-ink">
              {courseTitle}
            </p>

            <div className="flex flex-none items-center gap-2.5 pl-1">
              <span className="hidden text-xs text-ink-3 md:inline">
                {completedCount}/{allItems.length} lessons
              </span>
              <ProgressRing
                value={progress}
                size={38}
                stroke={4.5}
                label="Course progress"
                className="text-ink [--ring:var(--sw-green)] dark:[--ring:var(--sw-leaf)]"
              >
                <span className="text-[0.62rem] font-bold tabular-nums text-ink">{progress}</span>
              </ProgressRing>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="lms-icon-btn h-10 w-10"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
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

  if (type === "VIDEO") return <PlayCircle className="h-3.5 w-3.5" />;
  if (type === "DOCUMENT") return <FileText className="h-3.5 w-3.5" />;
  if (type === "SCORM") return <Boxes className="h-3.5 w-3.5" />;
  if (type === "LINKS") return <Link2 className="h-3.5 w-3.5" />;
  if (type === "LIVE_SESSION") return <CalendarDays className="h-3.5 w-3.5" />;
  if (type === "ASSESSMENT" || type === "QUIZ" || type === "ESSAY") {
    return <HelpCircle className="h-3.5 w-3.5" />;
  }

  return <BookOpen className="h-3.5 w-3.5" />;
}

function getResourceIcon(category?: string) {
  if (category === "VIDEOS_AND_WEBINARS") return <PlayCircle className="h-3.5 w-3.5" />;
  if (category === "USEFUL_LINKS") return <Link2 className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
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
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function titleCaseEnum(value?: string | null) {
  if (!value) return "Item";
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}
