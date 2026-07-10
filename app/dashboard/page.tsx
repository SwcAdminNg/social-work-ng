import Link from "next/link";
import { fetchApi } from "@/lib/fetchApi";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  IconBookOpen,
  IconClipboardCheck,
  IconStar,
  IconReceipt,
} from "@/components/dashboard/icons";
import { PlayCircle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Dashboard | Social Work Nigeria",
};

export default async function DashboardPage() {
  // Fetch user profile and stats concurrently for performance
  const [userRes, statsRes] = await Promise.all([
    fetchApi("/users/me", { next: { revalidate: 60 } }),
    fetchApi("/users/me/dashboard/stats", { next: { revalidate: 0 } }), // Real-time stats
  ]);

  const userData = await userRes.json().catch(() => ({}));
  const statsData = await statsRes.json().catch(() => ({}));

  const user = userData?.data;
  const stats = statsData?.data || {
    total_courses_enrolled: 0,
    quizzes_attempted: 0,
    completion_rate: 0,
    total_reviews: 0,
    in_process_courses: 0,
    completed_courses: 0,
  };

  // Determine dynamic greeting based on server time
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const firstName = user?.first_name || "there";

  // Map backend stats to UI cards
  const STATS_CARDS = [
    {
      label: "Enrolled Courses",
      value: stats.total_courses_enrolled,
      icon: IconBookOpen,
      href: "/dashboard/courses",
      color: "text-[#2D6A4F] dark:text-[#52b788]",
      bg: "bg-[#2D6A4F]/10 dark:bg-[#52b788]/15",
    },
    {
      label: "In-Progress",
      value: stats.in_process_courses,
      icon: PlayCircle,
      href: "/dashboard/courses",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Completed",
      value: stats.completed_courses,
      icon: CheckCircle2,
      href: "/dashboard/courses",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Completion Rate",
      value: `${Number(stats.completion_rate || 0).toFixed(1)}%`,
      icon: IconReceipt,
      href: "/dashboard/courses",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Quiz Attempts",
      value: stats.quizzes_attempted,
      icon: IconClipboardCheck,
      href: "/dashboard/quiz-attempts",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      label: "Reviews Given",
      value: stats.total_reviews,
      icon: IconStar,
      href: "/dashboard/courses",
      color: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Dynamic Greeting */}
      <div className="pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {greeting}, <span className="text-[#2D6A4F] dark:text-[#52b788]">{firstName}</span>!
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
          Here is what is happening with your learning journey today.
        </p>
      </div>

      {/* Dynamic Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
        {STATS_CARDS.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 no-underline hover:border-[#2D6A4F]/40 dark:hover:border-[#52b788]/40 hover:shadow-md transition-all duration-200"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl sm:rounded-2xl ${bg} ${color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
              <div className="[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                <Icon />
              </div>
            </div>
            <div className="mt-1 sm:mt-0">
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-none mb-1">
                {value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Client-Side Activity Feed */}
      <ActivityFeed />
    </div>
  );
}
