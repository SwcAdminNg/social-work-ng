import { fetchApi } from "@/lib/fetchApi";
import { DashboardBadgeSync } from "@/components/dashboard/DashboardBadgeSync";
import {
  DashboardHome,
  type DashboardOverview,
  type DashboardStats,
} from "@/components/dashboard/home/DashboardHome";

export const metadata = {
  title: "Dashboard | Social Work Nigeria",
};

type DashboardUser = {
  first_name?: string | null;
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

/** Greets by the hour in Nigeria, not by wherever the server happens to run. */
function greetingForNow() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Africa/Lagos",
    }).format(new Date()),
  );
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage() {
  const { user, overview, error } = await getDashboardData();

  return (
    <>
      <DashboardBadgeSync
        counts={{
          unread_notifications_count: overview.unread_notifications_count,
          unread_community_messages_count:
            overview.unread_community_messages_count,
          cart_item_count: overview.cart_item_count,
          open_support_tickets_count: overview.open_support_tickets_count,
        }}
      />
      <DashboardHome
        greeting={greetingForNow()}
        firstName={user?.first_name?.trim() || "there"}
        overview={overview}
        error={error}
      />
    </>
  );
}
