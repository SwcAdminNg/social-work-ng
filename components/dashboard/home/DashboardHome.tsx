import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  Award,
  BookOpen,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Library,
  Play,
  Radio,
  TrendingUp,
} from "lucide-react";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";

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

export type ContinueLearningCourse = {
  course_id: string;
  title: string;
  thumbnail_url?: string | null;
  progress_percent?: number | null;
  last_accessed_at?: string | null;
  total_items?: number | null;
  completed_items?: number | null;
  next_item_id?: string | null;
  next_item_title?: string | null;
  next_item_type?: string | null;
  next_section_title?: string | null;
};

export type LiveSession = {
  item_id: string;
  title: string;
  course_id: string;
  course_title: string;
  course_slug?: string | null;
  section_title?: string | null;
  scheduled_start_at: string;
  scheduled_end_at?: string | null;
  duration_minutes?: number | null;
  guest_name?: string | null;
  guest_title?: string | null;
  status?: string | null;
  can_join?: boolean | null;
};

export type Certificate = {
  id: string;
  course_id: string;
  course_title: string;
  certificate_number: string;
  issued_at: string;
};

export type Subscription = {
  id: string;
  end_date?: string | null;
  is_active?: boolean | null;
  auto_renew?: boolean | null;
  plan?: {
    name?: string | null;
    price?: number | null;
    duration_days?: number | null;
  } | null;
} | null;

export type DashboardOverview = {
  stats: DashboardStats;
  continue_learning: ContinueLearningCourse[];
  upcoming_live_sessions: LiveSession[];
  recent_certificates: Certificate[];
  recent_activity: ActivityItem[];
  unread_notifications_count: number;
  unread_community_messages_count: number;
  open_support_tickets_count: number;
  cart_item_count: number;
  subscription: Subscription;
};

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** Learners are in Nigeria, so times are shown in West Africa Time wherever the page renders. */
const TIME_ZONE = "Africa/Lagos";

function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, ...options }).format(date);
}

function lastOpened(value?: string | null) {
  if (!value) return "Not opened yet";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "Not opened yet";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Opened today";
  if (days === 1) return "Opened yesterday";
  if (days < 7) return `Opened ${days} days ago`;
  return `Opened ${formatDate(value, { day: "numeric", month: "short" })}`;
}

function clampPercent(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, Math.round(numeric))) : 0;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function itemTypeLabel(type?: string | null) {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "DOCUMENT":
      return "Reading";
    case "SCORM":
      return "Interactive lesson";
    case "LINKS":
      return "Link";
    case "LIVE_SESSION":
      return "Live session";
    case "ASSESSMENT":
    case "QUIZ":
    case "ESSAY":
      return "Assessment";
    default:
      return "Lesson";
  }
}

function resumeHref(course: ContinueLearningCourse) {
  return course.next_item_id
    ? `/learn/${course.course_id}/item/${course.next_item_id}`
    : `/learn/${course.course_id}`;
}

function lessonCount(course: ContinueLearningCourse) {
  const total = Number(course.total_items) || 0;
  if (total <= 0) return null;
  const done = Math.min(total, Number(course.completed_items) || 0);
  return `${done} of ${plural(total, "lesson")} done`;
}

function summaryLine(overview: DashboardOverview) {
  const { stats } = overview;
  const sessions = overview.upcoming_live_sessions.length;
  if (stats.in_process_courses > 0) {
    const live = sessions > 0 ? ` and ${plural(sessions, "live session")} coming up` : "";
    return `You have ${plural(stats.in_process_courses, "course")} in progress${live}. A little each day keeps your practice moving.`;
  }
  if (stats.not_started_courses > 0) {
    return `${plural(stats.not_started_courses, "enrolled course")} ${stats.not_started_courses === 1 ? "is" : "are"} ready when you are. Start the first lesson today.`;
  }
  if (stats.completed_courses > 0) {
    return "You have finished everything you enrolled in. Pick your next course from the catalogue.";
  }
  return "Choose a course from the catalogue and your progress, live sessions and certificates will gather here.";
}

function Thumb({
  src,
  sizes,
  className,
}: {
  src?: string | null;
  sizes: string;
  className: string;
}) {
  return (
    <span className={`relative block flex-none overflow-hidden bg-paper-2 ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes={sizes} className="sw-zoom object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-mint text-accent">
          <BookOpen className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}

function SectionHead({
  title,
  href,
  linkLabel,
  id,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="m-0 text-[1.2rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.3rem]">
        {title}
      </h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 flex-none items-center gap-0.5 text-[0.9rem] font-medium text-accent no-underline hover:underline"
        >
          {linkLabel}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function EmptyNote({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="lms-milk flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[0.95rem] font-semibold text-ink">{title}</p>
        <p className="m-0 mt-0.5 text-sm leading-relaxed text-ink-2">{children}</p>
      </div>
      {action}
    </div>
  );
}

function Progress({ value, label, caption }: { value: number; label: string; caption: string | null }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-ink-3">
        <span className="truncate">{caption ?? "Progress"}</span>
        <span className="font-semibold tabular-nums text-ink">{value}%</span>
      </div>
      <span
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="lms-bar"
        data-empty={value === 0 || undefined}
      >
        <span style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

/* ── Greeting: plain type on the page, no panel behind it ── */
function Greeting({
  greeting,
  firstName,
  overview,
}: {
  greeting: string;
  firstName: string;
  overview: DashboardOverview;
}) {
  const { stats } = overview;
  const resume = overview.continue_learning[0];
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const primary = resume
    ? { href: resumeHref(resume), label: "Resume learning" }
    : stats.not_started_courses > 0
      ? { href: "/dashboard/courses", label: "Start a course" }
      : { href: "/dashboard/course-catalogue", label: "Browse the catalogue" };

  return (
    <section
      aria-labelledby="dashboard-greeting"
      className="lms-rise flex flex-col gap-5 pt-1 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
    >
      <div className="min-w-0">
        <p className="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-clay-ink">{today}</p>
        <h1
          id="dashboard-greeting"
          className="sw-display m-0 mt-2 text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.02] text-ink"
        >
          {greeting}, <span className="sw-em text-accent">{firstName}</span>
        </h1>
        <p className="m-0 mt-3 max-w-2xl text-[1rem] leading-relaxed text-ink-2">{summaryLine(overview)}</p>
      </div>
      <div className="flex flex-none flex-wrap gap-2.5">
        <Link href={primary.href} className="lms-btn">
          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
          {primary.label}
        </Link>
        {resume && (
          <Link href="/dashboard/course-catalogue" className="lms-btn lms-btn--quiet">
            Find a new course
          </Link>
        )}
      </div>
    </section>
  );
}

/* ── At a glance: four milk tiles ── */
function Glance({ stats }: { stats: DashboardStats }) {
  const completion = clampPercent(stats.completion_rate);
  const tiles = [
    { label: "Enrolled", value: String(stats.total_courses_enrolled), href: "/dashboard/courses", icon: Library },
    { label: "In progress", value: String(stats.in_process_courses), href: "/dashboard/courses?status=IN_PROGRESS", icon: BookOpen },
    { label: "Completed", value: String(stats.completed_courses), href: "/dashboard/courses?status=COMPLETED", icon: CircleCheck },
    { label: "Avg. completion", value: `${completion}%`, href: "/dashboard/assessments?tab=results", icon: TrendingUp },
  ];

  return (
    <section aria-label="At a glance" className="lms-rise" style={{ "--i": 1 } as Vars}>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 lg:gap-4">
        {tiles.map(({ label, value, href, icon: Icon }) => (
          <li key={label} className="min-w-0">
            <Link
              href={href}
              className="lms-milk lms-milk-hover flex h-full flex-col gap-4 p-4 text-inherit no-underline sm:p-5"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
                </span>
                <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden="true" />
              </span>
              <span>
                <span className="lms-num block text-[1.9rem] text-ink sm:text-[2.2rem]">{value}</span>
                <span className="mt-1 block truncate text-[0.85rem] text-ink-2">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Continue learning: one featured course, then the rest as milk cards ── */
function FeaturedCourse({ course }: { course: ContinueLearningCourse }) {
  const progress = clampPercent(course.progress_percent);
  return (
    <Link
      href={resumeHref(course)}
      className="lms-milk lms-milk-hover group flex flex-col gap-4 p-2.5 text-inherit no-underline sm:flex-row sm:items-stretch sm:gap-6"
    >
      <Thumb
        src={course.thumbnail_url}
        sizes="(min-width: 1280px) 340px, (min-width: 640px) 40vw, 100vw"
        className="lms-art aspect-[16/9] w-full sm:aspect-auto sm:min-h-[200px] sm:w-[42%] sm:max-w-[360px]"
      />
      <div className="flex min-w-0 flex-1 flex-col px-2.5 pb-2.5 sm:px-0 sm:py-3 sm:pr-4">
        <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-accent">
          Pick up where you left off
        </p>
        <h3 className="sw-title m-0 mt-2 line-clamp-2 text-[1.3rem] text-ink sm:text-[1.5rem]">{course.title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {course.next_item_title ? (
            <>
              <span className="lms-chip-milk">{itemTypeLabel(course.next_item_type)}</span>
              <span className="min-w-0 truncate text-sm text-ink-2">Next: {course.next_item_title}</span>
            </>
          ) : (
            <span className="text-sm text-ink-2">{lastOpened(course.last_accessed_at)}</span>
          )}
        </div>
        <div className="mt-auto flex flex-col gap-4 pt-5 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Progress value={progress} label={`${course.title} progress`} caption={lessonCount(course)} />
          </div>
          <span className="lms-btn flex-none self-start sm:self-auto" aria-hidden="true">
            <Play className="h-4 w-4 fill-current" />
            Resume
          </span>
        </div>
      </div>
    </Link>
  );
}

function CourseCard({ course }: { course: ContinueLearningCourse }) {
  const progress = clampPercent(course.progress_percent);
  return (
    <Link
      href={resumeHref(course)}
      className="lms-milk lms-milk-hover group flex h-full gap-3.5 p-2.5 text-inherit no-underline sm:flex-col sm:gap-0"
    >
      <Thumb
        src={course.thumbnail_url}
        sizes="(min-width: 1536px) 20vw, (min-width: 640px) 40vw, 112px"
        className="lms-art w-28 self-stretch sm:aspect-[16/9] sm:w-full sm:self-auto"
      />
      <div className="flex min-w-0 flex-1 flex-col py-1 pr-1.5 sm:px-2 sm:pb-2 sm:pt-3.5">
        <h3 className="sw-title m-0 line-clamp-2 text-[1.05rem] text-ink">{course.title}</h3>
        <p className="m-0 mt-1 line-clamp-1 text-sm text-ink-3">
          {course.next_item_title ? `Next: ${course.next_item_title}` : lastOpened(course.last_accessed_at)}
        </p>
        <div className="mt-auto pt-3.5">
          <Progress value={progress} label={`${course.title} progress`} caption={lessonCount(course)} />
        </div>
      </div>
    </Link>
  );
}

function ContinueLearning({ courses, stats }: { courses: ContinueLearningCourse[]; stats: DashboardStats }) {
  const [featured, ...rest] = courses;
  return (
    <section aria-labelledby="continue-title" className="flex flex-col gap-4">
      <SectionHead id="continue-title" title="Continue learning" href="/dashboard/courses" linkLabel="My courses" />
      {!featured ? (
        <EmptyNote
          icon={<BookOpen className="h-5 w-5" />}
          title="No course in progress yet"
          action={
            <Link
              href={stats.not_started_courses > 0 ? "/dashboard/courses" : "/dashboard/course-catalogue"}
              className="lms-btn flex-none"
            >
              {stats.not_started_courses > 0 ? "Open my courses" : "Browse courses"}
            </Link>
          }
        >
          {stats.not_started_courses > 0
            ? `${plural(stats.not_started_courses, "enrolled course")} waiting for a first lesson.`
            : "Browse the catalogue and start building your learning plan."}
        </EmptyNote>
      ) : (
        <>
          <FeaturedCourse course={featured} />
          {rest.length > 0 && (
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:gap-4 2xl:grid-cols-3">
              {rest.map((course) => (
                <li key={course.course_id} className="min-w-0">
                  <CourseCard course={course} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

/* ── Right column panels ── */
function Panel({
  title,
  href,
  linkLabel,
  id,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="lms-card flex flex-col gap-3 !rounded-[24px] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-ink">
          {title}
        </h2>
        {href && linkLabel && (
          <Link
            href={href}
            className="-mr-1 inline-flex min-h-11 flex-none items-center gap-0.5 px-1 text-[0.85rem] font-medium text-accent no-underline hover:underline"
          >
            {linkLabel}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function SmallEmpty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[16px] bg-[var(--lms-milk)] p-3.5">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-card text-accent dark:bg-white/[0.06]">
        {icon}
      </span>
      <p className="m-0 text-sm leading-relaxed text-ink-2">{children}</p>
    </div>
  );
}

function LiveSessions({ sessions }: { sessions: LiveSession[] }) {
  return (
    <Panel id="live-title" title="Upcoming live sessions" href="/dashboard/live-sessions" linkLabel="All">
      {sessions.length === 0 ? (
        <SmallEmpty icon={<CalendarClock className="h-[18px] w-[18px]" />}>
          Sessions from your courses appear here as soon as they are scheduled.
        </SmallEmpty>
      ) : (
        <ul className="-mx-1.5 m-0 flex list-none flex-col p-0">
          {sessions.map((session) => (
            <li key={session.item_id}>
              <Link
                href={`/courses/${session.course_slug || session.course_id}/live-session/${session.item_id}`}
                className="group flex items-center gap-3 rounded-[16px] p-1.5 text-inherit no-underline transition-colors duration-200 hover:bg-[var(--lms-milk)]"
              >
                <span className="grid h-14 w-12 flex-none content-center justify-items-center rounded-[14px] bg-[var(--lms-milk)] text-ink shadow-[inset_0_0_0_1px_var(--lms-milk-line)]">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.06em] text-clay-ink">
                    {formatDate(session.scheduled_start_at, { month: "short" })}
                  </span>
                  <span className="lms-num mt-0.5 text-[1.35rem]">
                    {formatDate(session.scheduled_start_at, { day: "numeric" })}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[0.92rem] font-semibold text-ink">{session.title}</span>
                  <span className="mt-0.5 block truncate text-[0.8rem] text-ink-3">
                    {formatDate(session.scheduled_start_at, { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true })}{" "}
                    WAT{session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
                  </span>
                  <span className="block truncate text-[0.8rem] text-ink-3">{session.course_title}</span>
                </span>
                {session.can_join ? (
                  <span className="sw-chip flex-none bg-clay text-white">
                    <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                    Join
                  </span>
                ) : (
                  <ChevronRight aria-hidden="true" className="h-4 w-4 flex-none text-ink-3" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Assessments({ stats }: { stats: DashboardStats }) {
  return (
    <Panel id="assess-title" title="Assessments" href="/dashboard/assessments" linkLabel="Open">
      <Link
        href="/dashboard/assessments?tab=results"
        className="lms-milk lms-milk-hover flex items-center gap-3.5 !rounded-[16px] p-3.5 text-inherit no-underline"
      >
        <span className="lms-num text-[1.9rem] text-ink">{stats.quizzes_attempted}</span>
        <span className="min-w-0 flex-1 text-[0.85rem] leading-snug text-ink-2">
          {stats.quizzes_attempted === 1 ? "quiz or essay attempted" : "quizzes and essays attempted"}
        </span>
        <ChevronRight className="h-4 w-4 flex-none text-ink-3" aria-hidden="true" />
      </Link>
      <Link href="/dashboard/assessments?tab=upcoming" className="lms-btn lms-btn--quiet w-full">
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        See what is due
      </Link>
    </Panel>
  );
}

function Certificates({ certificates }: { certificates: Certificate[] }) {
  return (
    <Panel id="cert-title" title="Certificates" href="/dashboard/certificates" linkLabel="All">
      {certificates.length === 0 ? (
        <SmallEmpty icon={<Award className="h-[18px] w-[18px]" />}>
          Finish a course that awards a certificate and it will be kept here, ready to download.
        </SmallEmpty>
      ) : (
        <ul className="-mx-1.5 m-0 flex list-none flex-col p-0">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <Link
                href={`/dashboard/certificates/${certificate.course_id}`}
                className="flex items-center gap-3 rounded-[16px] p-1.5 text-inherit no-underline transition-colors duration-200 hover:bg-[var(--lms-milk)]"
              >
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gold text-[#10231a]">
                  <Award className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[0.92rem] font-semibold text-ink">
                    {certificate.course_title}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.8rem] text-ink-3">
                    Issued {formatDate(certificate.issued_at, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 flex-none text-ink-3" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function DashboardHome({
  greeting,
  firstName,
  overview,
  error,
}: {
  greeting: string;
  firstName: string;
  overview: DashboardOverview;
  error?: string | null;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 lg:gap-8">
      {error && (
        <p
          role="alert"
          className="m-0 rounded-[20px] bg-clay-wash px-5 py-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]"
        >
          {error}
        </p>
      )}

      <Greeting greeting={greeting} firstName={firstName} overview={overview} />
      <Glance stats={overview.stats} />

      <div
        className="lms-rise grid items-start gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
        style={{ "--i": 2 } as Vars}
      >
        <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
          <ContinueLearning courses={overview.continue_learning} stats={overview.stats} />
          <div id="activity" className="min-w-0">
            <ActivityFeed
              initialActivities={overview.recent_activity}
              initialMeta={{ page: 1, page_size: 5, total_pages: 1, has_next: false }}
            />
          </div>
        </div>

        {/* Stacks under the main column on smaller screens, two-up on tablets. */}
        <aside aria-label="Schedule and achievements" className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-1 lg:gap-5">
          <LiveSessions sessions={overview.upcoming_live_sessions} />
          <Assessments stats={overview.stats} />
          <div className="md:col-span-2 xl:col-span-1">
            <Certificates certificates={overview.recent_certificates} />
          </div>
        </aside>
      </div>
    </div>
  );
}
