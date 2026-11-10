import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

type Listed = { id?: string; slug?: string; updated_at?: string | null; created_at?: string | null };

// Public pages, most important first.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "/mentorship", priority: 0.8, changeFrequency: "monthly" },
  { path: "/resources", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about-us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
];

// The API serves at most 100 items a page; the cap keeps a fault from looping.
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

/** Every published item of a list endpoint, or as many as could be read if the API falters. */
async function listAll(endpoint: string): Promise<Listed[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
  const items: Listed[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`${apiUrl}${endpoint}?page=${page}&page_size=${PAGE_SIZE}`, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const json = await res.json().catch(() => null);
      const data = json?.data;
      const batch: Listed[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      items.push(...batch);
      const totalPages = json?.meta?.total_pages ?? data?.meta?.total_pages ?? 1;
      if (batch.length === 0 || page >= totalPages) break;
    }
  } catch {
    // Keep whatever was read before the fault.
  }
  return items;
}

const dateOf = (item: Listed) => {
  const date = new Date(item.updated_at || item.created_at || "");
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, resources] = await Promise.all([
    listAll("/courses"),
    listAll("/resources"),
  ]);

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...courses
      .filter((course) => course.slug || course.id)
      .map((course) => ({
        url: absoluteUrl(`/courses/${course.slug || course.id}`),
        lastModified: dateOf(course),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...resources
      .filter((resource) => resource.slug || resource.id)
      .map((resource) => ({
        url: absoluteUrl(`/resources/${resource.slug || resource.id}`),
        lastModified: dateOf(resource),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
