import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  Radio,
} from "lucide-react";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
import { Btn, Contours } from "@/components/site/ui";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

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

function PanelHead({
  kicker,
  title,
  href,
  linkLabel,
  dot,
}: {
  kicker: string;
  title: string;
  href?: string;
  linkLabel?: string;
  dot?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="lms-kicker m-0" style={dot ? ({ "--dot": dot } as Vars) : undefined}>
          {kicker}
        </p>
        <h2 className="sw-title m-0 mt-2.5 text-[1.45rem] text-ink sm:text-[1.6rem]">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="sw-link flex-none text-sm text-accent">
          {linkLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
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
    <div className="lms-well flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)]">
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

function Hero({
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
  const progress = resume ? clampPercent(resume.progress_percent) : 0;
  const completion = clampPercent(stats.completion_rate);
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const figures = [
    { label: "Enrolled", value: stats.total_courses_enrolled, href: "/dashboard/courses" },
    { label: "In progress", value: stats.in_process_courses, href: "/dashboard/courses?status=IN_PROGRESS" },
    { label: "Completed", value: stats.completed_courses, href: "/dashboard/courses?status=COMPLETED" },
    { label: "Saved", value: stats.bookmarked_courses, href: "/dashboard/courses?tab=saved" },
  ];

  return (
    <section
      aria-labelledby="dashboard-greeting"
      className="lms-panel lms-rise rounded-[32px] px-5 pb-5 pt-7 sm:px-9 sm:pt-10 lg:rounded-[40px]"
    >
      <Contours />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] xl:items-end xl:gap-12">
        <div className="min-w-0">
          <p className="sw-eyebrow m-0 text-gold-light" style={{ "--dot": "var(--sw-gold)" } as Vars}>
            {today}
          </p>
          <h1
            id="dashboard-greeting"
            className="sw-display m-0 mt-5 text-[clamp(2.2rem,5.2vw,4rem)] text-[#f4f1e6]"
          >
            {greeting},{" "}
            <span className="sw-em text-gold-light">{firstName}</span>
          </h1>
          <p className="m-0 mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/75">
            {summaryLine(overview)}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {resume ? (
              <Btn href={resumeHref(resume)} variant="gold">
                Resume learning
              </Btn>
            ) : stats.not_started_courses > 0 ? (
              <Btn href="/dashboard/courses" variant="gold">
                Start a course
              </Btn>
            ) : (
              <Btn href="/dashboard/course-catalogue" variant="gold">
                Browse the catalogue
              </Btn>
            )}
            <Btn href={resume ? "/dashboard/course-catalogue" : "/dashboard/live-sessions"} variant="ghost">
              {resume ? "Find a new course" : "See live sessions"}
            </Btn>
          </div>
        </div>

        {resume ? (
          <Link
            href={resumeHref(resume)}
            className="group block rounded-[28px] bg-white/[0.07] p-4 text-inherit no-underline shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-[background-color,transform] duration-700 ease-sw hover:-translate-y-1 hover:bg-white/[0.12] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
          >
            <div className="flex items-start gap-4">
              <Thumb
                src={resume.thumbnail_url}
                sizes="112px"
                className="h-20 w-20 rounded-[20px] sm:h-28 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <p className="sw-cap m-0 text-gold-light">Pick up where you left off</p>
                <h2 className="sw-title m-0 mt-2 line-clamp-2 text-[1.2rem] text-white sm:text-[1.4rem]">
                  {resume.title}
                </h2>
                <p className="m-0 mt-2 line-clamp-2 text-sm leading-snug text-white/70">
                  {resume.next_item_title ? (
                    <>
                      <span className="text-white/50">Next: </span>
                      {resume.next_item_title}
                      <span className="text-white/50"> · {itemTypeLabel(resume.next_item_type)}</span>
                    </>
                  ) : (
                    lastOpened(resume.last_accessed_at)
                  )}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-white/65">
                  <span className="truncate">{lessonCount(resume) ?? "Progress"}</span>
                  <span className="font-semibold tabular-nums text-white">{progress}%</span>
                </div>
                <span
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${resume.title} progress`}
                  className="lms-bar lms-bar--on-dark"
                  data-empty={progress === 0 || undefined}
                >
                  <span style={{ width: `${progress}%` }} />
                </span>
              </div>
              <span
                aria-hidden="true"
                className="grid h-11 w-11 flex-none place-items-center rounded-full bg-gold text-[#10231a] transition-transform duration-500 ease-sw group-hover:rotate-45"
              >
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-5 rounded-[28px] bg-white/[0.07] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
            <ProgressRing value={completion} size={96} stroke={9} label="Average completion">
              <span className="lms-num text-2xl text-white">{completion}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="sw-cap m-0 text-gold-light">Average completion</p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-white/75">
                Across {plural(stats.total_courses_enrolled, "enrolled course")}. Your next
                lesson will appear here once you start one.
              </p>
            </div>
          </div>
        )}
      </div>

      <dl className="m-0 mt-8 grid grid-cols-2 overflow-hidden rounded-[24px] bg-black/20 sm:grid-cols-4">
        {figures.map(({ label, value, href }, index) => (
          <div
            key={label}
            className={`relative ${index % 2 === 1 ? "border-l border-white/10" : ""} ${
              index >= 2 ? "border-t border-white/10 sm:border-t-0" : ""
            } ${index === 2 ? "sm:border-l" : ""}`}
          >
            <Link
              href={href}
              className="flex h-full flex-col-reverse justify-end gap-1.5 px-5 py-4 text-inherit no-underline transition-colors duration-300 hover:bg-white/[0.06] sm:px-6 sm:py-5"
            >
              <dt className="text-[0.8rem] text-white/60">{label}</dt>
              <dd className="lms-num m-0 text-[2.1rem] text-white sm:text-[2.6rem]">{value}</dd>
            </Link>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ContinueLearning({ courses, stats }: { courses: ContinueLearningCourse[]; stats: DashboardStats }) {
  // The first course is already the hero's resume card.
  const rest = courses.slice(1);
  if (courses.length > 0 && rest.length === 0) return null;

  return (
    <section aria-label="Continue learning" className="lms-rise flex flex-col gap-5" style={{ "--i": 1 } as Vars}>
      <PanelHead
        kicker="Your courses"
        title={courses.length > 0 ? "Also in progress" : "Continue learning"}
        href="/dashboard/courses"
        linkLabel="All my courses"
      />
      {courses.length === 0 ? (
        <EmptyNote
          icon={<BookOpen className="h-5 w-5" />}
          title="No course in progress yet"
          action={
            <Link href={stats.not_started_courses > 0 ? "/dashboard/courses" : "/dashboard/course-catalogue"} className="lms-btn flex-none">
              {stats.not_started_courses > 0 ? "Open my courses" : "Browse courses"}
            </Link>
          }
        >
          {stats.not_started_courses > 0
            ? `${plural(stats.not_started_courses, "enrolled course")} waiting for a first lesson.`
            : "Browse the catalogue and start building your learning plan."}
        </EmptyNote>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rest.map((course) => {
            const progress = clampPercent(course.progress_percent);
            return (
              <li key={course.course_id} className="min-w-0">
                <Link
                  href={resumeHref(course)}
                  className="lms-card lms-card-hover group flex h-full overflow-hidden text-inherit no-underline sm:flex-col"
                >
                  <Thumb
                    src={course.thumbnail_url}
                    sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 28vw, (min-width: 640px) 45vw, 120px"
                    className="w-28 self-stretch sm:aspect-[16/9] sm:w-full sm:self-auto"
                  />
                  <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                    <h3 className="sw-title m-0 line-clamp-2 text-[1.08rem] text-ink">{course.title}</h3>
                    <p className="m-0 mt-1.5 line-clamp-1 text-sm text-ink-3">
                      {course.next_item_title
                        ? `Next: ${course.next_item_title}`
                        : lastOpened(course.last_accessed_at)}
                    </p>
                    <div className="mt-auto pt-4 sm:pt-5">
                      <div className="mb-2 flex items-baseline justify-between gap-3 text-xs text-ink-3">
                        <span className="truncate">{lessonCount(course) ?? "Progress"}</span>
                        <span className="font-semibold tabular-nums text-ink">{progress}%</span>
                      </div>
                      <span
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${course.title} progress`}
                        className="lms-bar"
                        data-empty={progress === 0 || undefined}
                      >
                        <span style={{ width: `${progress}%` }} />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function LiveSessions({ sessions }: { sessions: LiveSession[] }) {
  return (
    <section aria-label="Upcoming live sessions" className="lms-card flex flex-col gap-5 p-5 sm:p-7">
      <PanelHead
        kicker="Live sessions"
        title="Coming up"
        href="/dashboard/live-sessions"
        linkLabel="All sessions"
        dot="var(--sw-gold)"
      />
      {sessions.length === 0 ? (
        <EmptyNote icon={<CalendarClock className="h-5 w-5" />} title="Nothing scheduled yet">
          Live sessions from the courses you are enrolled in will appear here as soon as
          they are scheduled.
        </EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {sessions.map((session) => (
            <li key={session.item_id}>
              <Link
                href={`/courses/${session.course_slug || session.course_id}/live-session/${session.item_id}`}
                className="group flex items-center gap-4 rounded-[20px] p-2.5 text-inherit no-underline transition-colors duration-300 hover:bg-mint dark:hover:bg-white/[0.05]"
              >
                <span className="grid h-[4.25rem] w-[3.75rem] flex-none content-center justify-items-center rounded-2xl bg-paper-2 text-ink">
                  <span className="sw-cap text-clay-ink">
                    {formatDate(session.scheduled_start_at, { month: "short" })}
                  </span>
                  <span className="lms-num mt-1 text-[1.7rem]">
                    {formatDate(session.scheduled_start_at, { day: "numeric" })}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-[0.98rem] font-semibold leading-snug text-ink">
                    {session.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-ink-3">{session.course_title}</span>
                  <span className="mt-1 block text-sm text-ink-2">
                    {formatDate(session.scheduled_start_at, { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true })}{" "}
                    WAT
                    {session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
                  </span>
                </span>
                {session.can_join ? (
                  <span className="sw-chip flex-none bg-clay text-white">
                    <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                    Join now
                  </span>
                ) : (
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 flex-none text-ink-3 transition-transform duration-500 ease-sw group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Assessments({ stats }: { stats: DashboardStats }) {
  return (
    <section aria-label="Assessments" className="lms-card flex flex-col gap-5 p-5 sm:p-7">
      <PanelHead kicker="Assessments" title="Quizzes and essays" />
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard/assessments?tab=completed"
          className="lms-well block p-4 text-inherit no-underline transition-shadow duration-300 hover:shadow-[inset_0_0_0_1.5px_var(--sw-green)]"
        >
          <span className="lms-num block text-[2.2rem] text-ink">{stats.quizzes_attempted}</span>
          <span className="mt-1.5 block text-sm text-ink-3">Attempts made</span>
        </Link>
        <Link
          href="/dashboard/assessments?tab=results"
          className="lms-well block p-4 text-inherit no-underline transition-shadow duration-300 hover:shadow-[inset_0_0_0_1.5px_var(--sw-green)]"
        >
          <span className="lms-num block text-[2.2rem] text-ink">{clampPercent(stats.completion_rate)}%</span>
          <span className="mt-1.5 block text-sm text-ink-3">Average completion</span>
        </Link>
      </div>
      <div className="mt-auto flex flex-wrap gap-2.5">
        <Link href="/dashboard/assessments?tab=upcoming" className="lms-btn">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Open assessments
        </Link>
        <Link href="/dashboard/assessments?tab=results" className="lms-btn lms-btn--quiet">
          View results
        </Link>
      </div>
    </section>
  );
}

function Plan({ subscription }: { subscription: Subscription }) {
  const ends = formatDate(subscription?.end_date, { day: "numeric", month: "long", year: "numeric" });
  return (
    <section aria-label="Subscription" className="lms-card flex flex-col gap-5 p-5 sm:p-7">
      <PanelHead kicker="Your plan" title={subscription ? subscription.plan?.name || "Active plan" : "Free access"} dot="var(--sw-leaf)" />
      {subscription ? (
        <dl className="lms-well m-0 grid gap-3 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-3">Status</dt>
            <dd className="m-0 flex items-center gap-2 font-semibold text-ink">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${subscription.is_active ? "bg-brand dark:bg-leaf" : "bg-clay"}`}
              />
              {subscription.is_active ? "Active" : "Inactive"}
            </dd>
          </div>
          {ends && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-3">{subscription.auto_renew ? "Renews on" : "Ends on"}</dt>
              <dd className="m-0 font-semibold text-ink">{ends}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-3">Auto-renewal</dt>
            <dd className="m-0 font-semibold text-ink">{subscription.auto_renew ? "On" : "Off"}</dd>
          </div>
        </dl>
      ) : (
        <p className="m-0 text-[0.95rem] leading-relaxed text-ink-2">
          You are learning on free access. A plan opens the wider catalogue whenever you
          want it.
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2.5">
        <Link href="/dashboard/pricing" className="lms-btn">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          {subscription ? "Manage plan" : "See plans"}
        </Link>
        <Link href="/dashboard/orders" className="lms-btn lms-btn--quiet">
          Billing history
        </Link>
      </div>
    </section>
  );
}

function Certificates({ certificates }: { certificates: Certificate[] }) {
  return (
    <section aria-label="Recent certificates" className="lms-card flex flex-col gap-5 p-5 sm:p-7">
      <PanelHead
        kicker="Certificates"
        title="Recently earned"
        href="/dashboard/certificates"
        linkLabel="All certificates"
        dot="var(--sw-gold)"
      />
      {certificates.length === 0 ? (
        <EmptyNote icon={<Award className="h-5 w-5" />} title="Nothing earned yet">
          Finish a course that awards a certificate and it will be kept here, ready to
          download and verify.
        </EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {certificates.map((certificate) => (
            <li key={certificate.id}>
              <Link
                href={`/dashboard/certificates/${certificate.course_id}`}
                className="group flex items-center gap-4 rounded-[20px] p-2.5 text-inherit no-underline transition-colors duration-300 hover:bg-mint dark:hover:bg-white/[0.05]"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gold text-[#10231a]">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[0.98rem] font-semibold text-ink">
                    {certificate.course_title}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-3">
                    {certificate.certificate_number} ·{" "}
                    {formatDate(certificate.issued_at, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-5 w-5 flex-none text-ink-3 transition-transform duration-500 ease-sw group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
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
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 lg:gap-8">
      {error && (
        <p
          role="alert"
          className="m-0 rounded-[20px] bg-clay-wash px-5 py-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]"
        >
          {error}
        </p>
      )}

      <Hero greeting={greeting} firstName={firstName} overview={overview} />

      <ContinueLearning courses={overview.continue_learning} stats={overview.stats} />

      <div className="lms-rise grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" style={{ "--i": 2 } as Vars}>
        <LiveSessions sessions={overview.upcoming_live_sessions} />
        <Assessments stats={overview.stats} />
      </div>

      <div className="lms-rise grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" style={{ "--i": 3 } as Vars}>
        <div className="grid min-w-0 content-start gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-1">
          <Plan subscription={overview.subscription} />
          <Certificates certificates={overview.recent_certificates} />
        </div>
        <div id="activity" className="min-w-0">
          <ActivityFeed
            initialActivities={overview.recent_activity}
            initialMeta={{ page: 1, page_size: 5, total_pages: 1, has_next: false }}
          />
        </div>
      </div>
    </div>
  );
}
