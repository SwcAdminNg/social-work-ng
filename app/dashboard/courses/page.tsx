import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import {
  EnrolledCoursesDashboard,
  type Course,
  type DashboardStats,
  type Meta,
} from "./EnrolledCoursesDashboard";

export const metadata = {
  title: "My Courses | Dashboard",
};

const PAGE_SIZE = 8;

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

const emptyMeta: Meta = {
  page: 1,
  page_size: PAGE_SIZE,
  total_items: 0,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

type SearchParams = { [key: string]: string | string[] | undefined };

async function readJson(res: Response) {
  return res.json().catch(() => ({}));
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(firstValue(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeStatus(value: string | string[] | undefined) {
  const status = firstValue(value);
  return status === "IN_PROGRESS" ||
    status === "NOT_STARTED" ||
    status === "COMPLETED"
    ? status
    : undefined;
}

export default async function EnrolledCoursesPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const search = firstValue(searchParams.search)?.trim() ?? "";
  const page = toPositiveInt(searchParams.page, 1);
  const status = normalizeStatus(searchParams.status);
  const isSavedView = firstValue(searchParams.tab) === "saved";
  const listParams = new URLSearchParams({
    page: String(page),
    page_size: String(PAGE_SIZE),
  });

  if (!isSavedView) {
    if (search) listParams.set("search", search);
    if (status) listParams.set("status", status);
  }

  const listEndpoint = isSavedView
    ? `/courses/bookmarked?${listParams.toString()}`
    : `/courses/enrolled?${listParams.toString()}`;

  const [statsRes, coursesRes] = await Promise.all([
    fetchApi("/users/me/dashboard/stats", { cache: "no-store" }),
    fetchApi(listEndpoint, {
      cache: "no-store",
    }),
  ]);

  if (statsRes.status === 401 || coursesRes.status === 401) {
    redirect("/logout?callbackUrl=/dashboard/courses");
  }

  const [statsJson, coursesJson] = await Promise.all([
    readJson(statsRes),
    readJson(coursesRes),
  ]);

  const stats = {
    ...emptyStats,
    ...(statsJson?.data ?? {}),
  } as DashboardStats;

  const courses = Array.isArray(coursesJson?.data)
    ? (coursesJson.data as Course[])
    : [];

  const meta = {
    ...emptyMeta,
    ...(coursesJson?.meta ?? {}),
  } as Meta;

  const error =
    !statsRes.ok || !coursesRes.ok
      ? statsJson?.message ||
        coursesJson?.message ||
        "Unable to load all course data right now."
      : null;

  return (
    <EnrolledCoursesDashboard
      key={`${isSavedView ? "saved" : status || "all"}-${search}-${page}`}
      stats={stats}
      courses={courses}
      meta={meta}
      activeView={isSavedView ? "SAVED" : status || "ALL"}
      currentPage={page}
      initialSearch={search}
      error={error}
    />
  );
}
