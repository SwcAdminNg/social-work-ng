import { MetadataRoute } from "next";
import { fetchApi } from "@/lib/fetchApi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org";

  // List of all static routes in the application
  const staticRoutes = [
    "",
    "/about-us",
    "/courses",
    "/mentorship",
    "/pricing",
    "/resources",
    "/contact",
    "/faq",
    // Legal
    "/privacy-policy",
    "/terms-of-service",
    // Auth
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const sitemapRoutes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch all courses dynamically
  try {
    const res = await fetchApi(`/courses?page=1&limit=1000`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json().catch(() => ({}));
    const items = Array.isArray(data?.data)
      ? data.data
      : data?.data?.items || [];

    items.forEach((course: any) => {
      if (course.slug || course.id) {
        sitemapRoutes.push({
          url: `${baseUrl}/courses/${course.slug || course.id}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.9,
        });
      }
    });
  } catch (e) {
    console.error("Failed to fetch courses for sitemap:", e);
  }

  return sitemapRoutes;
}
