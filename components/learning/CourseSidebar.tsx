"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconChevronsLeft } from "@/components/dashboard/icons";
import { IconCheck } from "@/components/auth/shared/icons";
import {
  BookOpen,
  CalendarDays,
  FileText,
  HelpCircle,
  Link2,
  Lock,
  Menu,
  PlayCircle,
  Star,
  X,
} from "lucide-react";
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

interface CourseSidebarProps {
  courseId: string;
  curriculum: Curriculum;
  resources?: ResourceRead[];
}

export function CourseSidebar({ courseId, curriculum, resources = [] }: CourseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState<ReviewValue | null>(null);

  const progress = Math.min(Math.max(Number(curriculum.progress_percent || 0), 0), 100);
  const sections = curriculum.sections || [];
  const allItems = sections.flatMap((section) => section.items || []);
  const activeItem = allItems.find((item) =>
    pathname.startsWith(`/learn/${courseId}/item/${item.id}`),
  );
  const completedCount = allItems.filter((item) => item.is_completed).length;
  const totalEstimatedMinutes = allItems.reduce(
    (total, item) => total + getEstimatedMinutes(item),
    0,
  );

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

  const SidebarContent = (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#fbfbfd] dark:bg-[#0f1218]">
      <div className="flex h-14 flex-shrink-0 items-center justify-between px-4">
        <Link
          href="/dashboard/courses"
          className="inline-flex min-h-[44px] min-w-0 items-center gap-1.5 text-[0.9375rem] font-medium text-[#2D6A4F] transition hover:opacity-70 dark:text-[#95d5b2]"
        >
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
            <IconChevronsLeft />
          </span>
          <span className="truncate">My courses</span>
        </Link>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close curriculum"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-shrink-0 px-5 pb-5 pt-2">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
          Course
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h2 className="line-clamp-3 text-[1.0625rem] font-semibold leading-[1.3] tracking-[-0.01em] text-slate-950 dark:text-white">
            {curriculum.course_title || "Course Curriculum"}
          </h2>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex h-8 flex-shrink-0 items-center gap-1 rounded-full bg-black/[0.05] px-3 text-[0.8125rem] font-medium text-slate-700 transition hover:bg-black/[0.08] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            <Star className="h-3.5 w-3.5" />
            {userReview ? "Edit" : "Rate"}
          </button>
        </div>

        <div className="mb-2 mt-5 flex items-baseline justify-between text-[0.8125rem] text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-white">{completedCount}</span> of{" "}
            {allItems.length || 0} complete
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Curriculum progress"
          className="h-1.5 overflow-hidden rounded-full bg-black/[0.07] dark:bg-white/10"
        >
          <div
            className="h-full rounded-full bg-[#2D6A4F] transition-all duration-500 ease-out dark:bg-[#52b788]"
            style={{ width: `${progress}%` }}
          />
        </div>
        {totalEstimatedMinutes > 0 && (
          <p className="mt-2 text-[0.75rem] text-slate-500 dark:text-slate-400">
            About {formatMinutes(totalEstimatedMinutes)} of learning
          </p>
        )}

        {Number(curriculum.total_reviews || 0) > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[0.8125rem] text-slate-500 dark:text-slate-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {Number(curriculum.average_rating || 0).toFixed(1)}
            </span>
            <span>({curriculum.total_reviews} reviews)</span>
          </div>
        )}
      </div>

      <nav aria-label="Course outline" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {sections.map((section, sectionIndex) => {
          const isSectionLocked = section.is_locked === true;
          const guestLabel = formatGuestInstructors(section.guest_instructors);
          const items = section.items || [];
          const firstIncompleteIndex = items.findIndex((i) => !i.is_completed);
          const frontierIndex = firstIncompleteIndex === -1 ? items.length : firstIncompleteIndex;

          return (
            <section key={section.id} className="mb-6">
              <div className="flex items-start justify-between gap-2 px-2 pb-2">
                <div className="min-w-0">
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#2D6A4F] dark:text-[#74c69d]">
                    Module {sectionIndex + 1}
                  </p>
                  <h3 className="mt-0.5 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                  {guestLabel && (
                    <p className="mt-1 line-clamp-1 text-[0.75rem] text-slate-500 dark:text-slate-400">
                      {guestLabel}
                    </p>
                  )}
                </div>
                {isSectionLocked && (
                  <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <ul className="space-y-0.5">
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
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.75rem] font-semibold ${
                          item.is_completed
                            ? "bg-[#2D6A4F] text-white dark:bg-[#52b788] dark:text-[#06130d]"
                            : isActive
                              ? "bg-[#2D6A4F]/12 text-[#2D6A4F] ring-1 ring-inset ring-[#2D6A4F]/40 dark:bg-[#52b788]/15 dark:text-[#95d5b2] dark:ring-[#52b788]/50"
                              : "bg-black/[0.05] text-slate-500 dark:bg-white/10 dark:text-slate-400"
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
                          className={`block line-clamp-2 text-[0.9375rem] leading-5 ${
                            isActive ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.title}
                          {item.is_completed && <span className="sr-only"> (complete)</span>}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-slate-500 dark:text-slate-400">
                          <span className="[&>svg]:h-3 [&>svg]:w-3" aria-hidden>
                            {getItemIcon(item)}
                          </span>
                          {isSectionLocked
                            ? "Locked"
                            : isSequentialLocked
                              ? "Complete previous item first"
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
                          className="grid min-h-[52px] cursor-not-allowed grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2.5 py-2 text-slate-400 dark:text-slate-500"
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
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`grid min-h-[52px] grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                          isActive
                            ? "bg-white text-slate-950 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_14px_-6px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] dark:bg-white/10 dark:text-white dark:ring-white/10"
                            : "text-slate-700 hover:bg-black/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06]"
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
          <section className="mb-3">
            <div className="px-2 pb-2">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#2D6A4F] dark:text-[#74c69d]">
                Course resources
              </p>
              <h3 className="mt-0.5 text-[0.9375rem] font-semibold text-slate-900 dark:text-white">
                Templates, readings &amp; links
              </h3>
            </div>
            <ul className="space-y-0.5">
              {resources.map((resource) => {
                const resourceUrl = `/resources/${resource.slug || resource.id}`;
                const isLocked = resource.can_access === false;

                return (
                  <li key={resource.id}>
                    <Link
                      href={resourceUrl}
                      onClick={() => setIsOpen(false)}
                      className="grid min-h-[52px] grid-cols-[28px_minmax(0,1fr)] items-center gap-3 rounded-xl px-2.5 py-2 text-slate-700 transition-colors hover:bg-black/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] text-slate-500 dark:bg-white/10 dark:text-slate-400">
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : getResourceIcon(resource.category)}
                      </span>
                      <span className="min-w-0">
                        <span className="block line-clamp-2 text-[0.9375rem] font-medium leading-5">
                          {resource.name}
                        </span>
                        <span className="mt-0.5 block text-[0.75rem] text-slate-500 dark:text-slate-400">
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
              onClick={() => setIsOpen(false)}
              className="mx-2 mt-3 flex h-11 items-center justify-center rounded-xl bg-black/[0.05] text-[0.875rem] font-medium text-slate-700 transition hover:bg-black/[0.08] dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
            >
              View all course resources
            </Link>
          </section>
        )}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[320px] flex-shrink-0 overflow-hidden border-r border-black/[0.06] bg-[#fbfbfd] dark:border-white/10 dark:bg-[#0f1218] lg:flex">
        {SidebarContent}
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[88vw] max-w-[360px] flex-col overflow-hidden bg-[#fbfbfd] shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0f1218] lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {SidebarContent}
      </aside>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-[22px] bg-white/80 p-2 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.06] backdrop-blur-xl dark:bg-[#14171f]/80 dark:ring-white/10 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="grid min-h-[44px] w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#95d5b2]">
            <Menu className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">
              {activeItem?.title || curriculum.course_title || "Course outline"}
            </span>
            <span
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course progress"
              className="mt-1 block h-1 overflow-hidden rounded-full bg-[#e3ede7] dark:bg-[#24372e]"
            >
              <span
                className="block h-full bg-[#2D6A4F] dark:bg-[#52b788]"
                style={{ width: `${progress}%` }}
              />
            </span>
          </span>
          <span className="rounded-full bg-[#2D6A4F]/10 px-2.5 py-1 text-xs font-semibold text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#95d5b2]">
            {progress}%
          </span>
        </button>
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
    </>
  );
}

function getItemIcon(item: CurriculumItem) {
  const type = item.item_type;

  if (type === "VIDEO") return <PlayCircle className="h-3.5 w-3.5" />;
  if (type === "DOCUMENT") return <FileText className="h-3.5 w-3.5" />;
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
