import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * One search across the learner's world: the course catalogue, their own
 * courses, the resource library, their community rooms and live sessions.
 * Every source is asked at once and a slow or failing one never blocks the
 * rest; each answers with at most a handful of ready-to-render hits.
 */

type SessionWithAccessToken = { accessToken?: string };

export type SearchHit = {
  id: string;
  kind: "course" | "my-course" | "resource" | "community" | "live-session";
  title: string;
  subtitle?: string;
  href: string;
  thumbnail?: string | null;
  meta?: string;
};

export type SearchResponse = {
  query: string;
  courses: SearchHit[];
  my_courses: SearchHit[];
  resources: SearchHit[];
  communities: SearchHit[];
  live_sessions: SearchHit[];
};

type Json = Record<string, unknown>;

const TIMEOUT_MS = 6000;

function listFrom(json: unknown, keys: string[] = ["items", "courses", "sessions", "live_sessions"]): Json[] {
  if (!json || typeof json !== "object") return [];
  const payload = json as Json;
  if (Array.isArray(payload.data)) return payload.data as Json[];
  const data = payload.data as Json | undefined;
  for (const key of keys) {
    if (data && Array.isArray(data[key])) return data[key] as Json[];
    if (Array.isArray(payload[key])) return payload[key] as Json[];
  }
  return [];
}

const str = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

function plain(text: string | undefined, max = 110) {
  if (!text) return undefined;
  const flat = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat || undefined;
}

function humanize(value: string | undefined) {
  if (!value) return undefined;
  return value
    .toLowerCase()
    .split("_")
    .map((word) => (word === "and" ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function instructorOf(course: Json) {
  const name = str(course.instructor_name);
  if (name) return name;
  const first = (course.instructor ?? (Array.isArray(course.instructors) ? course.instructors[0] : undefined)) as
    | Json
    | string
    | undefined;
  if (typeof first === "string") return first;
  if (first && typeof first === "object") {
    return (
      str(first.full_name) ||
      str(first.display_name) ||
      str(first.name) ||
      [str(first.first_name), str(first.last_name)].filter(Boolean).join(" ") ||
      undefined
    );
  }
  return undefined;
}

/** Every word of the query appears somewhere in the text. */
function matchesAll(text: string, query: string) {
  const hay = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
}

const RESOURCE_LABELS: Record<string, string> = {
  PRACTICE_RESOURCES: "Practice Tools",
  POLICIES_AND_GUIDANCE: "Policies and Guidance",
  VIDEOS_AND_WEBINARS: "Videos and Webinars",
  RESEARCH_AND_PUBLICATIONS: "Research and Reading",
  TEMPLATES_AND_FORMS: "Templates and Forms",
  COURSE_MATERIALS: "Course Materials",
  CAREER_AND_CPD: "Career and CPD",
  USEFUL_LINKS: "Useful Links",
};

const COMMUNITY_LABELS: Record<string, string> = {
  GENERAL: "Everyone",
  INSTRUCTOR_GENERAL: "Instructors",
  ADMIN_GENERAL: "Announcements",
  HELP: "Help desk",
  COURSE: "Course room",
  CUSTOM: "Group",
};

const sessionDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export async function GET(req: Request) {
  const session = (await auth()) as SessionWithAccessToken | null;
  const token = session?.accessToken;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim().slice(0, 120);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

  async function get(endpoint: string): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) return null;
      return await res.json().catch(() => null);
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  const q = encodeURIComponent(query);
  const empty: SearchResponse = {
    query,
    courses: [],
    my_courses: [],
    resources: [],
    communities: [],
    live_sessions: [],
  };

  // With nothing typed yet, offer what the learner is in the middle of.
  if (!query) {
    const enrolled = await get(`/courses/enrolled?page=1&page_size=4&status=IN_PROGRESS`);
    empty.my_courses = listFrom(enrolled).slice(0, 4).map(toMyCourse).filter(Boolean) as SearchHit[];
    return NextResponse.json(empty);
  }

  const upcomingFrom = new Date(Date.now() - 3 * 60 * 60_000).toISOString();
  const [catalogue, enrolled, resources, communities, live] = await Promise.all([
    get(`/courses?page=1&page_size=6&search=${q}`),
    get(`/courses/enrolled?page=1&page_size=5&search=${q}`),
    get(`/resources?page=1&page_size=6&search=${q}`),
    get(`/community`),
    get(`/learning/live-sessions?page=1&page_size=50&start_date=${encodeURIComponent(upcomingFrom)}`),
  ]);

  const myCourses = listFrom(enrolled).map(toMyCourse).filter(Boolean) as SearchHit[];
  const enrolledIds = new Set(myCourses.map((hit) => hit.id));

  const result: SearchResponse = {
    query,
    my_courses: myCourses.slice(0, 5),
    courses: listFrom(catalogue)
      .filter((course) => !enrolledIds.has(String(course.id)))
      .map((course): SearchHit | null => {
        const id = str(course.id);
        const title = str(course.title);
        if (!id || !title) return null;
        const instructor = instructorOf(course);
        const price = course.is_free ? "Free" : typeof course.price === "number" ? `₦${course.price.toLocaleString("en-NG")}` : undefined;
        return {
          id,
          kind: "course",
          title,
          subtitle: [instructor, humanize(str(course.level))].filter(Boolean).join(" · ") || plain(str(course.description)),
          href: `/dashboard/course-catalogue/${str(course.slug) || id}`,
          thumbnail: str(course.thumbnail_url) ?? null,
          meta: price,
        };
      })
      .filter(Boolean)
      .slice(0, 6) as SearchHit[],
    resources: listFrom(resources)
      .map((resource): SearchHit | null => {
        const id = str(resource.id);
        const title = str(resource.name) || str(resource.title);
        if (!id || !title) return null;
        const category = str(resource.category);
        return {
          id,
          kind: "resource",
          title,
          subtitle: plain(str(resource.description)) || (category ? RESOURCE_LABELS[category] ?? humanize(category) : undefined),
          href: `/resources/${str(resource.slug) || id}`,
          thumbnail: str(resource.thumbnail_url) ?? null,
          meta: resource.can_access === false ? "Locked" : category ? RESOURCE_LABELS[category] ?? humanize(category) : undefined,
        };
      })
      .filter(Boolean)
      .slice(0, 6) as SearchHit[],
    communities: listFrom(communities)
      .filter((room) => matchesAll(`${str(room.name) ?? ""} ${str(room.type) ?? ""}`, query))
      .map((room): SearchHit | null => {
        const id = str(room.id);
        const title = str(room.name);
        if (!id || !title) return null;
        const members = typeof room.member_count === "number" ? `${room.member_count.toLocaleString()} members` : undefined;
        return {
          id,
          kind: "community",
          title,
          subtitle: [COMMUNITY_LABELS[str(room.type) ?? ""] ?? "Community", members].filter(Boolean).join(" · "),
          href: `/dashboard/community?community=${encodeURIComponent(id)}`,
        };
      })
      .filter(Boolean)
      .slice(0, 5) as SearchHit[],
    live_sessions: listFrom(live)
      .filter((item) =>
        matchesAll(
          [item.title, item.course_title, item.guest_name, item.section_title].filter((v) => typeof v === "string").join(" "),
          query,
        ),
      )
      .map((item): SearchHit | null => {
        const id = str(item.item_id);
        const title = str(item.title);
        const courseId = str(item.course_id);
        if (!id || !title || !courseId) return null;
        const start = str(item.scheduled_start_at);
        const when = start && !Number.isNaN(Date.parse(start)) ? sessionDate.format(new Date(start)) : undefined;
        return {
          id,
          kind: "live-session",
          title,
          subtitle: [str(item.course_title), str(item.guest_name) && `with ${str(item.guest_name)}`].filter(Boolean).join(" · "),
          href: `/courses/${str(item.course_slug) || courseId}/live-session/${id}`,
          meta: when,
        };
      })
      .filter(Boolean)
      .slice(0, 4) as SearchHit[],
  };

  return NextResponse.json(result);
}

function toMyCourse(course: Json): SearchHit | null {
  const id = str(course.id);
  const title = str(course.title);
  if (!id || !title) return null;
  const percent = typeof course.progress_percent === "number" ? Math.round(course.progress_percent) : null;
  const done = course.is_completed === true || course.progress_status === "COMPLETED" || percent === 100;
  return {
    id,
    kind: "my-course",
    title,
    subtitle: instructorOf(course),
    href: `/learn/${id}`,
    thumbnail: str(course.thumbnail_url) ?? null,
    meta: done ? "Completed" : percent !== null ? `${percent}% done` : "Enrolled",
  };
}
