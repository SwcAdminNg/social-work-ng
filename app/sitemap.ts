import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

type CourseSummary = {
  slug?: string;
  id?: string | number;
  updated_at?: string;
  updatedAt?: string;
};

// Public pages, with how often each tends to change and how important it
// is relative to the home page. Sign-in and account pages are left out:
// they are blocked in robots.txt and should not be offered for indexing.
const staticRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/mentorship", changeFrequency: "monthly", priority: 0.7 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${site.url}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Every published course has its own page.
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    if (apiUrl) {
      const res = await fetch(`${apiUrl}/courses?page=1&limit=1000`, {
        next: { revalidate: 3600 },
      });
      const data = await res.json().catch(() => ({}));
      const items: CourseSummary[] = Array.isArray(data?.data)
        ? data.data
        : data?.data?.items || [];
      for (const course of items) {
        const key = course.slug || course.id;
        if (!key) continue;
        const modified = course.updated_at || course.updatedAt;
        entries.push({
          url: `${site.url}/courses/${key}`,
          lastModified: modified ? new Date(modified) : now,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  } catch (e) {
    console.error("Failed to fetch courses for sitemap:", e);
  }

  return entries;
}
