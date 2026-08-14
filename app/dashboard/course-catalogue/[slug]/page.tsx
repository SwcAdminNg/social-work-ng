import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  HelpCircle,
  Layers3,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";
import {
  InstructorSummary,
  type CourseInstructor,
} from "../InstructorSummary";
import { CourseDetailAction } from "./CourseDetailAction";
import { CourseBookmarkButton } from "../CourseBookmarkButton";

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

type CourseItemType = "VIDEO" | "DOCUMENT" | "QUIZ" | "ASSESSMENT" | "ESSAY";

type CourseVideo = {
  status?: "PENDING" | "PROCESSING" | "READY" | "FAILED" | null;
  playback_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
};

type CourseDocument = {
  file_name?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  is_uploaded?: boolean | null;
};

type CourseQuiz = {
  id?: string;
  passing_score_percentage?: number | null;
  questions?: Array<{
    id: string;
    text: string;
    order_index: number;
    allow_multiple_answers: boolean;
    options: Array<{ id: string; text: string; order_index: number }>;
  }>;
};

type CourseItem = {
  id: string;
  title: string;
  item_type: CourseItemType;
  assessment_type?: "QUIZ" | "ESSAY" | string | null;
  pass_mark_percentage?: number | null;
  essay_submission_mode?: "TEXT" | "DOCUMENT" | string | null;
  estimated_minutes?: number | null;
  order_index: number;
  is_preview?: boolean | null;
  questions?: CourseQuiz["questions"] | null;
  video?: CourseVideo | null;
  document?: CourseDocument | null;
  quiz?: CourseQuiz | null;
};

type CourseSection = {
  id: string;
  title: string;
  order_index: number;
  items?: CourseItem[] | null;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  created_at?: string | null;
  updated_at?: string | null;
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
  is_published?: boolean | null;
  is_exclusive?: boolean | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  is_enrolled?: boolean | null;
  is_bookmarked?: boolean | null;
  has_access?: boolean | null;
  sections?: CourseSection[] | null;
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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

async function getCourse(slug: string) {
  const res = await fetchApi(`/courses/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;

  const json = await res.json().catch(() => ({}));
  return res.ok && json?.data ? (json.data as Course) : null;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: "Course Not Found | Dashboard",
    };
  }

  return {
    title: `${course.title} | Course Catalogue`,
    description:
      course.description ||
      `Review curriculum, access, and enrollment details for ${course.title}.`,
  };
}

export default async function DashboardCourseDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const course = await getCourse(slug);

  if (!course) notFound();

  const sections = course.sections ?? [];
  const allItems = sections.flatMap((section) => section.items ?? []);
  const videoCount = allItems.filter((item) => item.item_type === "VIDEO").length;
  const documentCount = allItems.filter(
    (item) => item.item_type === "DOCUMENT",
  ).length;
  const quizCount = allItems.filter(isQuizItem).length;
  const essayCount = allItems.filter(isEssayItem).length;
  const previewCount = allItems.filter((item) => item.is_preview).length;
  const durationSeconds = allItems.reduce(
    (total, item) => total + Number(item.video?.duration_seconds || 0),
    0,
  );
  const hasAccess = course.has_access === true;
  const isEnrolled = course.is_enrolled === true;
  const canViewCourse = hasAccess || isEnrolled;
  const firstUnlockedItem = canViewCourse ? allItems[0] : null;
  const lockedCount = canViewCourse
    ? 0
    : allItems.filter((item) => item.is_preview !== true).length;
  const readyVideoCount = allItems.filter(
    (item) => item.video?.status === "READY",
  ).length;
  const uploadedDocumentCount = allItems.filter(
    (item) => item.document?.is_uploaded === true,
  ).length;
  const instructors = getCourseInstructors(course);

  return (
    <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-5 pb-8">
      <Link
        href="/dashboard/course-catalogue"
        className="inline-flex w-max items-center gap-2 text-sm font-bold text-[#2D6A4F] no-underline transition hover:text-[#1B4332] dark:text-[#b7e4c7] dark:hover:text-[#d8f3dc]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalogue
      </Link>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <CourseHero
            course={course}
            canViewCourse={canViewCourse}
            instructors={instructors}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<Layers3 className="h-5 w-5" />}
              label="Modules"
              value={sections.length.toLocaleString()}
            />
            <MetricCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Lessons"
              value={allItems.length.toLocaleString()}
            />
            <MetricCard
              icon={<Clock3 className="h-5 w-5" />}
              label="Video Time"
              value={formatDuration(durationSeconds)}
            />
            <MetricCard
              icon={<Sparkles className="h-5 w-5" />}
              label="Previews"
              value={previewCount.toLocaleString()}
            />
          </div>

          <InfoGrid course={course} />

          <section className="rounded-lg border border-[#dceee4] bg-white p-4 shadow-sm dark:border-[#27433a] dark:bg-[#111525] sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  Curriculum
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sections and items are shown in course order. Locked items are
                  visible in outline form until access is granted.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{videoCount} videos</span>
                <span>{documentCount} docs</span>
                <span>{quizCount} quizzes</span>
                {essayCount > 0 && <span>{essayCount} essays</span>}
                {lockedCount > 0 && <span>{lockedCount} locked</span>}
              </div>
            </div>

            {sections.length > 0 ? (
              <div className="grid gap-3">
                {sections.map((section, index) => (
                  <details
                    key={section.id}
                    open={index === 0}
                    className="group overflow-hidden rounded-lg border border-[#e3ede7] bg-[#fbfefd] dark:border-[#27433a] dark:bg-[#0f1726]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition hover:bg-[#f0fbf5] dark:hover:bg-[#52b788]/10">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#2D6A4F] dark:text-[#b7e4c7]">
                          Module {index + 1}
                        </p>
                        <h3 className="truncate text-sm font-extrabold text-slate-950 dark:text-white sm:text-base">
                          {section.title}
                        </h3>
                      </div>
                      <span className="flex-shrink-0 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-[#111525] dark:text-slate-300">
                        {(section.items ?? []).length} items
                      </span>
                    </summary>
                    <div className="border-t border-[#e3ede7] bg-white dark:border-[#27433a] dark:bg-[#111525]">
                      {(section.items ?? []).map((item) => (
                        <CurriculumItem
                          key={item.id}
                          courseId={course.id}
                          item={item}
                          canViewCourse={canViewCourse}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#cfe8da] px-6 py-12 text-center dark:border-[#27433a]">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-[#2D6A4F] dark:text-[#b7e4c7]" />
                <p className="font-bold text-slate-950 dark:text-white">
                  Curriculum is coming soon.
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  The course outline will appear here when modules are added.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="grid h-max gap-4 xl:sticky xl:top-[92px]">
          <div className="overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
            <div className="aspect-video bg-[#e7f6ee]">
              <img
                src={course.thumbnail_url || FALLBACK_IMAGE}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-4 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Course access
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950 dark:text-white">
                  {formatPrice(course)}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {accessLabel({ isEnrolled, hasAccess, isFree: course.is_free === true })}
                </p>
              </div>
              <CourseDetailAction
                courseId={course.id}
                slug={course.slug}
                isFree={course.is_free === true}
                price={course.price}
                isEnrolled={isEnrolled}
                hasAccess={hasAccess}
              />
              <CourseBookmarkButton
                courseId={course.id}
                courseTitle={course.title}
                initialBookmarked={course.is_bookmarked}
                variant="inline"
              />
              {firstUnlockedItem && (
                <Link
                  href={`/learn/${course.id}/item/${firstUnlockedItem.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-[#b7e4c7] bg-[#f7fcf9] px-4 text-sm font-bold text-[#2D6A4F] no-underline transition hover:bg-[#e7f6ee] dark:border-[#27433a] dark:bg-[#13231d] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
                >
                  Resume first lesson
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#dceee4] bg-white p-4 shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
              Course snapshot
            </h2>
            <dl className="mt-3 grid gap-3 text-sm">
              <SnapshotRow label="Published" value={course.is_published === false ? "No" : "Yes"} />
              <SnapshotRow label="Ready videos" value={`${readyVideoCount}/${videoCount}`} />
              <SnapshotRow
                label="Uploaded docs"
                value={`${uploadedDocumentCount}/${documentCount}`}
              />
              {course.updated_at && (
                <SnapshotRow label="Last updated" value={formatDate(course.updated_at)} />
              )}
              {!course.updated_at && course.created_at && (
                <SnapshotRow label="Created" value={formatDate(course.created_at)} />
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-[#dceee4] bg-[#f7fcf9] p-4 dark:border-[#27433a] dark:bg-[#13231d]">
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
              What access unlocks
            </h2>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-400">
              {[
                "Full curriculum content",
                "Video, document, and assessment access",
                "Progress tracking in the learning area",
                "Course access from any device",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2D6A4F] dark:text-[#b7e4c7]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function CourseHero({
  course,
  canViewCourse,
  instructors,
}: {
  course: Course;
  canViewCourse: boolean;
  instructors: CourseInstructor[];
}) {
  const rating =
    typeof course.average_rating === "number" ? course.average_rating : 0;

  return (
    <section className="overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
      <div className="relative min-h-[320px]">
        <img
          src={course.thumbnail_url || FALLBACK_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/72 to-slate-950/25" />
        <div className="relative z-10 flex min-h-[320px] flex-col justify-end p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <Pill>{titleCaseEnum(course.category)}</Pill>
            <Pill>{titleCaseEnum(course.level)}</Pill>
            <Pill>{course.is_free ? "Free" : "Premium"}</Pill>
            {course.is_exclusive && <Pill>Exclusive</Pill>}
            {canViewCourse && <Pill tone="green">Access granted</Pill>}
          </div>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base">
            {course.description ||
              "A practical professional learning experience designed for social work growth."}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-bold text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {rating ? rating.toFixed(1) : "New"} rating
            </span>
            <span>{Number(course.total_reviews || 0).toLocaleString()} reviews</span>
            <InstructorSummary instructors={instructors} variant="hero" />
            {course.is_exclusive && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Exclusive
              </span>
            )}
            {(course.updated_at || course.created_at) && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Updated {formatDate(course.updated_at || course.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoGrid({ course }: { course: Course }) {
  const panels = [
    {
      title: "What you will learn",
      items: course.what_you_will_learn ?? [],
      empty: "Learning outcomes have not been added yet.",
    },
    {
      title: "Materials included",
      items: course.material_includes ?? [],
      empty: "Materials will be listed when available.",
    },
    {
      title: "Requirements",
      items: course.requirements ?? [],
      empty: "No special requirements listed.",
    },
    {
      title: "Prerequisite",
      items: course.prerequisite ? [course.prerequisite] : [],
      empty: "No prerequisite listed.",
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
      {panels.map((panel) => (
        <div
          key={panel.title}
          className="rounded-lg border border-[#dceee4] bg-white p-4 shadow-sm dark:border-[#27433a] dark:bg-[#111525]"
        >
          <h2 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {panel.title}
          </h2>
          {panel.items.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {panel.items.slice(0, 6).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-6 text-slate-600 dark:text-slate-400"
                >
                  <BadgeCheck className="mt-1 h-4 w-4 flex-shrink-0 text-[#2D6A4F] dark:text-[#b7e4c7]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {panel.empty}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

function CurriculumItem({
  courseId,
  item,
  canViewCourse,
}: {
  courseId: string;
  item: CourseItem;
  canViewCourse: boolean;
}) {
  const unlocked = canViewCourse || item.is_preview === true;
  const canOpenInLearner = canViewCourse;
  const itemMeta = getItemMeta(item);
  const payloadStatus = getPayloadStatus(item, unlocked);

  return (
    <div className="flex flex-col gap-3 border-b border-[#edf5f0] px-4 py-3 last:border-b-0 dark:border-[#24372e] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
          {itemIcon(item)}
        </span>
        <div className="min-w-0">
          <p className="font-bold leading-5 text-slate-950 dark:text-white">
            {item.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{getItemLabel(item)}</span>
            {itemMeta.map((meta) => (
              <span key={meta}>{meta}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {payloadStatus && (
          <span className="inline-flex h-8 items-center rounded-md border border-[#dceee4] px-2.5 text-xs font-bold text-slate-600 dark:border-[#27433a] dark:text-slate-300">
            {payloadStatus}
          </span>
        )}
        {unlocked ? (
          <span className="inline-flex h-8 items-center gap-1 rounded-md bg-[#e7f6ee] px-2.5 text-xs font-bold text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
            <Check className="h-3.5 w-3.5" />
            {item.is_preview && !canViewCourse ? "Preview" : "Unlocked"}
          </span>
        ) : (
          <span className="inline-flex h-8 items-center gap-1 rounded-md bg-slate-100 px-2.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </span>
        )}
        {canOpenInLearner && (
          <Link
            href={`/learn/${courseId}/item/${item.id}`}
            className="inline-flex h-8 items-center rounded-md border border-[#b7e4c7] px-2.5 text-xs font-bold text-[#2D6A4F] no-underline transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
          >
            Open
          </Link>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#dceee4] bg-white p-4 shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#edf5f0] pb-2 last:border-b-0 last:pb-0 dark:border-[#24372e]">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-bold text-slate-950 dark:text-white">{value}</dd>
    </div>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "green";
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide shadow-sm ${
        tone === "green"
          ? "bg-[#52b788] text-[#06130d]"
          : "border border-white/20 bg-white/12 text-white backdrop-blur"
      }`}
    >
      {children}
    </span>
  );
}

function itemIcon(item: CourseItem) {
  if (item.item_type === "VIDEO") return <PlayCircle className="h-5 w-5" />;
  if (isQuizItem(item) || isEssayItem(item)) return <HelpCircle className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function getItemMeta(item: CourseItem) {
  const meta: string[] = [];

  if (item.video?.duration_seconds) {
    meta.push(formatDuration(item.video.duration_seconds));
  }

  if (item.document?.file_name) {
    meta.push(item.document.file_name);
  }

  if (item.document?.file_size_bytes) {
    meta.push(formatBytes(item.document.file_size_bytes));
  }

  if (typeof item.estimated_minutes === "number" && item.estimated_minutes > 0) {
    meta.push(formatMinutes(item.estimated_minutes));
  }

  const questions = item.questions || item.quiz?.questions;

  if (questions) {
    meta.push(`${questions.length} questions`);
  }

  const passMark = item.pass_mark_percentage ?? item.quiz?.passing_score_percentage;

  if (typeof passMark === "number") {
    meta.push(`${passMark}% pass mark`);
  }

  if (isEssayItem(item) && item.essay_submission_mode) {
    meta.push(`${titleCaseEnum(item.essay_submission_mode)} submission`);
  }

  return meta;
}

function getPayloadStatus(item: CourseItem, unlocked: boolean) {
  if (!unlocked) return "Outline only";

  if (item.item_type === "VIDEO") {
    return item.video?.status ? titleCaseEnum(item.video.status) : "Video hidden";
  }

  if (item.item_type === "DOCUMENT") {
    if (!item.document) return "Document hidden";
    return item.document.is_uploaded === false ? "Upload pending" : "Document ready";
  }

  if (isQuizItem(item)) {
    return item.questions || item.quiz ? "Quiz ready" : "Quiz hidden";
  }

  if (isEssayItem(item)) {
    return item.assessment_type || item.item_type === "ESSAY" ? "Essay ready" : "Essay hidden";
  }

  return null;
}

function isQuizItem(item: CourseItem) {
  return (
    item.item_type === "QUIZ" ||
    (item.item_type === "ASSESSMENT" && item.assessment_type === "QUIZ")
  );
}

function isEssayItem(item: CourseItem) {
  return (
    item.item_type === "ESSAY" ||
    (item.item_type === "ASSESSMENT" && item.assessment_type === "ESSAY")
  );
}

function getItemLabel(item: CourseItem) {
  if (item.item_type === "ASSESSMENT" && item.assessment_type) {
    return `${titleCaseEnum(item.assessment_type)} assessment`;
  }

  return titleCaseEnum(item.item_type);
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

function accessLabel({
  isEnrolled,
  hasAccess,
  isFree,
}: {
  isEnrolled: boolean;
  hasAccess: boolean;
  isFree: boolean;
}) {
  if (isEnrolled) return "You are enrolled in this course.";
  if (hasAccess) return "Included with your active access.";
  if (isFree) return "Free enrollment is available.";
  return "Enrollment or subscription access required.";
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
  return "Premium";
}

function formatDuration(seconds: number) {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
