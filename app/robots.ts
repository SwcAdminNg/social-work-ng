import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Public pages may be crawled; account, learning and transactional routes
// may not. The sitemap lists only the pages worth indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/learn/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/logout",
          "/payment-confirmation",
          "/maintenance",
          "/live-session/",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
