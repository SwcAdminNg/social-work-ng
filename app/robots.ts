import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas, sign-in pages and personal pages stay out of search.
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
        "/live-session/",
        "/certificates/verify/",
        "/maintenance",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
