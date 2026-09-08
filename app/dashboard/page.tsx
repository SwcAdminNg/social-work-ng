import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/fetchApi";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
import { DashboardBadgeSync } from "@/components/dashboard/DashboardBadgeSync";
import {
  Award,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  MessageSquare,
  PlayCircle,
  ShoppingCart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | Social Work Nigeria",
};

type DashboardUser = {
  first_name?: string | null;
};

type DashboardStats = {
  total_courses_enrolled: number;
  quizzes_attempted: number;
  completion_rate: number;
  total_reviews: number;
  in_process_courses: number;
  completed_courses: number;
  not_started_courses: number;
  bookmarked_courses: number;
};

type ContinueLearningCourse = {
  course_id: string;
  title: string;
  thumbnail_url?: string | null;
  progress_percent?: number | null;
  last_accessed_at?: string | null;
};

type LiveSession = {
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

type Certificate = {
  id: string;
  course_id: string;
  course_title: string;
  certificate_number: string;
  issued_at: string;
};

type Subscription = {
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

type DashboardOverview = {
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

const emptyStats: DashboardStats = {
  total_courses_enrolled: 0,
  quizzes_attempted: 0,
  completion_rate: 0,
  total_reviews: 0,
  in_process_courses: 0,
  completed_courses: 0,
  not_started_courses: 0,
  bookmarked_courses: 0,
};

const emptyOverview: DashboardOverview = {
  stats: emptyStats,
  continue_learning: [],
  upcoming_live_sessions: [],
  recent_certificates: [],
  recent_activity: [],
  unread_notifications_count: 0,
  unread_community_messages_count: 0,
  open_support_tickets_count: 0,
  cart_item_count: 0,
  subscription: null,
};

function asNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Date pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function normalizeOverview(input: unknown): DashboardOverview {
  const data = (input ?? {}) as Partial<DashboardOverview>;
  const stats = (data.stats ?? {}) as Partial<DashboardStats>;

  return {
    stats: {
      total_courses_enrolled: asNumber(stats.total_courses_enrolled),
      quizzes_attempted: asNumber(stats.quizzes_attempted),
      completion_rate: asNumber(stats.completion_rate),
      total_reviews: asNumber(stats.total_reviews),
      in_process_courses: asNumber(stats.in_process_courses),
      completed_courses: asNumber(stats.completed_courses),
      not_started_courses: asNumber(stats.not_started_courses),
      bookmarked_courses: asNumber(stats.bookmarked_courses),
    },
    continue_learning: Array.isArray(data.continue_learning)
      ? data.continue_learning
      : [],
    upcoming_live_sessions: Array.isArray(data.upcoming_live_sessions)
      ? data.upcoming_live_sessions
      : [],
    recent_certificates: Array.isArray(data.recent_certificates)
      ? data.recent_certificates
      : [],
    recent_activity: Array.isArray(data.recent_activity)
      ? data.recent_activity
      : [],
    unread_notifications_count: asNumber(data.unread_notifications_count),
    unread_community_messages_count: asNumber(
      data.unread_community_messages_count,
    ),
    open_support_tickets_count: asNumber(data.open_support_tickets_count),
    cart_item_count: asNumber(data.cart_item_count),
    subscription: data.subscription ?? null,
  };
}

async function getDashboardData() {
  const [userRes, overviewRes] = await Promise.all([
    fetchApi("/users/me", { cache: "no-store" }),
    fetchApi("/users/me/dashboard/overview?limit=5", { cache: "no-store" }),
  ]);

  const [userJson, overviewJson] = await Promise.all([
    userRes.json().catch(() => ({})),
    overviewRes.json().catch(() => ({})),
  ]);

  return {
    user: (userJson?.data ?? null) as DashboardUser | null,
    overview: overviewRes.ok ? normalizeOverview(overviewJson?.data) : emptyOverview,
    error: overviewRes.ok
      ? null
      : overviewJson?.message || "Unable to load dashboard overview.",
  };
}

export default async function DashboardPage() {
  const { user, overview, error } = await getDashboardData();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.first_name || "there";
  const stats = overview.stats;

  const statCards = [
    {
      label: "Completion",
      value: `${stats.completion_rate.toFixed(1)}%`,
      href: "/dashboard/courses",
      icon: TrendingUp,
      color: "text-[#2D6A4F]",
      bg: "bg-[#e7f5ee]",
    },
    {
      label: "In progress",
      value: stats.in_process_courses,
      href: "/dashboard/courses?status=IN_PROGRESS",
      icon: PlayCircle,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Completed",
      value: stats.completed_courses,
      href: "/dashboard/courses?status=COMPLETED",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Enrolled",
      value: stats.total_courses_enrolled,
      href: "/dashboard/courses",
      icon: BookOpen,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  const badges = [
    {
      label: "Notifications",
      value: overview.unread_notifications_count,
      href: "#notifications",
      icon: Bell,
    },
    {
      label: "Community",
      value: overview.unread_community_messages_count,
      href: "/dashboard/community",
      icon: MessageSquare,
    },
    {
      label: "Cart",
      value: overview.cart_item_count,
      href: "/dashboard/cart",
      icon: ShoppingCart,
    },
    {
      label: "Support",
      value: overview.open_support_tickets_count,
      href: "/dashboard/support-tickets",
      icon: LifeBuoy,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 pb-8">
      <DashboardBadgeSync
        counts={{
          unread_notifications_count: overview.unread_notifications_count,
          unread_community_messages_count:
            overview.unread_community_messages_count,
          cart_item_count: overview.cart_item_count,
          open_support_tickets_count: overview.open_support_tickets_count,
        }}
      />

      <div className="flex flex-col gap-4 pt-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {greeting},{" "}
            <span className="text-[#2D6A4F] dark:text-[#52b788]">
              {firstName}
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500 dark:text-gray-400">
            Here is the compact view of your learning, billing, support, and
            community updates.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {badges.map(({ label, value, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 no-underline shadow-sm transition hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-[#52b788]/50 dark:hover:text-[#b7e4c7]"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <span className="rounded-full bg-[#2D6A4F] px-1.5 py-0.5 text-[10px] leading-none text-white dark:bg-[#74c69d] dark:text-slate-950">
                {value > 99 ? "99+" : value}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map(({ label, value, href, icon: Icon, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="group flex min-h-24 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 no-underline shadow-sm transition hover:border-[#2D6A4F]/40 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-[#52b788]/50 sm:p-4"
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${bg} ${color} dark:bg-white/10 dark:text-[#b7e4c7]`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-extrabold leading-none text-gray-950 dark:text-white">
                {value}
              </span>
              <span className="mt-1 block truncate text-xs font-bold text-gray-500 dark:text-gray-400">
                {label}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
                Continue learning
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {stats.in_process_courses} courses in progress
              </p>
            </div>
            <Link
              href="/dashboard/courses"
              className="text-xs font-extrabold text-[#2D6A4F] no-underline dark:text-[#74c69d]"
            >
              View all
            </Link>
          </div>

          {overview.continue_learning.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center">
              <BookOpen className="h-9 w-9 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                No active course yet
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500 dark:text-gray-400">
                {stats.not_started_courses > 0
                  ? `${stats.not_started_courses} enrolled course${
                      stats.not_started_courses === 1 ? "" : "s"
                    } waiting for you.`
                  : "Browse the catalogue and start building your learning plan."}
              </p>
              <Link
                href="/dashboard/course-catalogue"
                className="mt-4 rounded-lg bg-[#2D6A4F] px-4 py-2 text-xs font-extrabold text-white no-underline transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d]"
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 p-3 md:grid-cols-2 2xl:grid-cols-3">
              {overview.continue_learning.map((course) => {
                const progress = Math.max(
                  0,
                  Math.min(100, Math.round(asNumber(course.progress_percent))),
                );

                return (
                  <Link
                    key={course.course_id}
                    href={`/learn/${course.course_id}`}
                    className="group flex min-h-36 flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 no-underline transition hover:border-[#2D6A4F]/40 dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-[#52b788]/50"
                  >
                    <div className="flex gap-3">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt=""
                          width={160}
                          height={128}
                          className="h-16 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-16 w-20 shrink-0 place-items-center rounded-lg bg-[#d8f3dc] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
                          <BookOpen className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-gray-950 dark:text-white">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          Last opened {formatDateTime(course.last_accessed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-[#2D6A4F] dark:bg-[#74c69d]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div>
              <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
                Upcoming live sessions
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Soonest scheduled sessions
              </p>
            </div>
            <Link
              href="/dashboard/live-sessions"
              className="text-xs font-extrabold text-[#2D6A4F] no-underline dark:text-[#74c69d]"
            >
              View all
            </Link>
          </div>

          {overview.upcoming_live_sessions.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center">
              <Clock3 className="h-9 w-9 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                No live sessions scheduled
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Your enrolled course sessions will appear here when they are
                scheduled.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {overview.upcoming_live_sessions.map((session) => (
                <Link
                  key={session.item_id}
                  href={`/courses/${session.course_slug || session.course_id}/live-session/${session.item_id}`}
                  className="block px-4 py-3 no-underline transition hover:bg-gray-50 dark:hover:bg-gray-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-gray-950 dark:text-white">
                        {session.title}
                      </h3>
                      <p className="mt-1 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                        {session.course_title}
                        {session.section_title ? ` - ${session.section_title}` : ""}
                      </p>
                      <p className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                        {formatDateTime(session.scheduled_start_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                        session.can_join
                          ? "bg-[#2D6A4F] text-white dark:bg-[#74c69d] dark:text-slate-950"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {session.can_join ? "Join now" : "Scheduled"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
                  Subscription
                </h2>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Billing status and plan access
                </p>
              </div>
              <Sparkles className="h-5 w-5 text-[#2D6A4F] dark:text-[#74c69d]" />
            </div>

            {overview.subscription?.plan ? (
              <div className="mt-4">
                <p className="text-lg font-extrabold text-gray-950 dark:text-white">
                  {overview.subscription.plan.name || "Active plan"}
                </p>
                <p className="mt-1 text-sm font-bold text-[#2D6A4F] dark:text-[#74c69d]">
                  {formatCurrency(overview.subscription.plan.price)}
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {overview.subscription.auto_renew
                    ? `Auto-renews ${formatDateTime(overview.subscription.end_date)}`
                    : `Access through ${formatDateTime(overview.subscription.end_date)}`}
                </p>
                <Link
                  href="/dashboard/pricing"
                  className="mt-4 inline-flex rounded-lg border border-gray-200 px-3 py-2 text-xs font-extrabold text-gray-700 no-underline transition hover:border-[#2D6A4F]/40 hover:text-[#2D6A4F] dark:border-gray-800 dark:text-gray-300 dark:hover:border-[#74c69d] dark:hover:text-[#74c69d]"
                >
                  Manage plan
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  You are on the free tier
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Upgrade when you are ready for deeper course access and
                  subscription benefits.
                </p>
                <Link
                  href="/dashboard/pricing"
                  className="mt-4 inline-flex rounded-lg bg-[#2D6A4F] px-3 py-2 text-xs font-extrabold text-white no-underline transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d]"
                >
                  View plans
                </Link>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <div>
                <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
                  Recent certificates
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Latest issued awards
                </p>
              </div>
              <Link
                href="/dashboard/certificates"
                className="text-xs font-extrabold text-[#2D6A4F] no-underline dark:text-[#74c69d]"
              >
                View all
              </Link>
            </div>

            {overview.recent_certificates.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Award className="mx-auto h-9 w-9 text-gray-300 dark:text-gray-600" />
                <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                  Nothing earned yet
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Completed courses with certificates will collect here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {overview.recent_certificates.map((certificate) => (
                  <Link
                    key={certificate.id}
                    href={`/dashboard/certificates/${certificate.course_id}`}
                    className="flex items-center gap-3 px-4 py-3 no-underline transition hover:bg-gray-50 dark:hover:bg-gray-950/40"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
                      <Award className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-gray-950 dark:text-white">
                        {certificate.course_title}
                      </span>
                      <span className="block truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                        {certificate.certificate_number} -{" "}
                        {formatDateTime(certificate.issued_at)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div id="notifications">
          <ActivityFeed
            initialActivities={overview.recent_activity}
            initialMeta={{
              page: 1,
              page_size: 5,
              total_pages: 1,
              has_next: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
