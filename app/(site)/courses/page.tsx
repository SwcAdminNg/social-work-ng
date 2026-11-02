import { fetchApi, publicFetchApi } from "@/lib/fetchApi";
import { SiteCourseCard } from "@/components/courses/SiteCourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import PageOpening from "@/components/shared/PageOpening";
import Pager from "@/components/shared/Pager";
import { absoluteUrl, shareImage, site } from "@/lib/site";

type SessionWithAccessToken = {
  accessToken?: string;
};

type EnrolledCourse = {
  id?: string;
  course?: {
    id?: string;
  };
};

type PublicCourse = {
  id: string;
  title: string;
  slug?: string;
  thumbnail_url?: string;
  is_free?: boolean;
  price?: number;
  level?: string;
  category?: string;
  average_rating?: number;
  total_reviews?: number;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
  is_enrolled?: boolean | null;
  has_access?: boolean | null;
  is_completed?: boolean | null;
};

const path = "/courses";
const title = "Our Courses";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Browse Social Work Nigeria’s catalogue of professional courses and CPD for social workers, students, educators and organisations, with clear course information before you enrol.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: path,
    title: fullTitle,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description,
    images: [shareImage],
  },
};

function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: fullTitle,
        description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        inLanguage: site.language,
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`${path}#breadcrumb`),
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: title, item: absoluteUrl(path) },
        ],
      },
    ],
  };
}

export default async function CoursesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const search = searchParams.search as string | undefined;
  const catalog = searchParams.catalog as string | undefined;
  const level = searchParams.level as string | undefined;
  const category = searchParams.category as string | undefined;
  const is_free = searchParams.is_free as string | undefined;

  let url = `/courses?page=${page}&page_size=12`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (catalog) url += `&catalog=${encodeURIComponent(catalog)}`;
  if (level) url += `&level=${encodeURIComponent(level)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (is_free === 'true') url += `&is_free=true`;
  else if (is_free === 'false') url += `&is_free=false`;

  const [initialRes, catalogsRes] = await Promise.all([
    fetchApi(url, { next: { revalidate: 60 } }),
    fetchApi("/courses/catalogs", { next: { revalidate: 3600 } }),
  ]);

  const res = initialRes.ok
    ? initialRes
    : await publicFetchApi(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => ({}));
  const items = getCourseItems(data);
  const meta = getCourseMeta(data);
  const hasNextPage = Boolean(meta.has_next ?? items.length === 12);

  let catalogs = [];
  if (catalogsRes.ok) {
    const cData = await catalogsRes.json().catch(() => ({}));
    catalogs = cData?.data || [];
  }

  // Fetch enrolled courses if the user is logged in
  const session = await auth();
  const enrolledCourseIds = new Set<string>();

  if (session && (session as SessionWithAccessToken).accessToken) {
    const enrolledRes = await fetchApi(`/learning/courses`, {
      next: { revalidate: 0 },
    });
    if (enrolledRes.ok) {
      const enrolledData = await enrolledRes.json().catch(() => ({}));
      const enrolledCourses = Array.isArray(enrolledData?.data)
        ? (enrolledData.data as EnrolledCourse[])
        : ((enrolledData?.data?.items || []) as EnrolledCourse[]);
      enrolledCourses.forEach((c) => {
        if (c.id) enrolledCourseIds.add(c.id);
        if (c.course?.id) enrolledCourseIds.add(c.course.id);
      });
    }
  }

  // Helpers to build URLs preserving all filters
  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", targetPage.toString());
    if (catalog) params.set("catalog", catalog);
    if (search) params.set("search", search);
    if (level) params.set("level", level);
    if (category) params.set("category", category);
    if (is_free) params.set("is_free", is_free);
    return `/courses?${params.toString()}`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />

      <PageOpening
        id="courses-heading"
        eyebrow="Our courses"
        title="Courses"
        tagline="Professional learning that connects social work knowledge with real situations, reflective thinking and practical application. Review who each course is for, how it is delivered and what completion involves before you enrol."
      />

      <section
        id="catalogue"
        aria-label="Course catalogue"
        className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-16 pb-24 md:pt-20 md:pb-32 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <Suspense fallback={null}>
            <CourseFilters catalogs={catalogs} />
          </Suspense>

          {items.length === 0 ? (
            <div className="rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 px-8 py-14 text-center">
              <p className="text-[1.1rem] font-bold text-gray-900 dark:text-[#ECF2EE]">
                No courses found.
              </p>
              <p className="mt-2 t-body text-gray-600 dark:text-[#A3B3A9]">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(items as PublicCourse[]).map((course) => (
                  <li key={course.id} className="flex">
                    <SiteCourseCard
                      id={course.id}
                      title={course.title}
                      thumbnail_url={course.thumbnail_url}
                      is_free={course.is_free}
                      price={course.price}
                      href={`/courses/${course.slug || course.id}`}
                      level={course.level || "Beginner"}
                      category={course.category || "Professional Development"}
                      average_rating={course.average_rating}
                      total_reviews={course.total_reviews}
                      estimated_total_minutes={course.estimated_total_minutes}
                      estimated_duration={course.estimated_duration}
                      certificate_enabled={course.certificate_enabled}
                      is_enrolled={course.is_enrolled === true || enrolledCourseIds.has(course.id)}
                      is_completed={course.is_completed === true}
                      has_access={course.has_access === true}
                    />
                  </li>
                ))}
              </ul>
              <Pager page={page} hasNext={hasNextPage} hrefFor={buildPageUrl} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

function getCourseItems(json: unknown): PublicCourse[] {
  if (!json || typeof json !== "object") return [];

  const payload = json as {
    data?: PublicCourse[] | { items?: PublicCourse[]; courses?: PublicCourse[] };
    items?: PublicCourse[];
    courses?: PublicCourse[];
  };

  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && !Array.isArray(payload.data)) {
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.courses)) return payload.data.courses;
  }
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.courses)) return payload.courses;

  return [];
}

function getCourseMeta(json: unknown) {
  if (!json || typeof json !== "object") return {};

  const payload = json as {
    meta?: { has_next?: boolean };
    data?: { meta?: { has_next?: boolean } };
  };

  return payload.meta || payload.data?.meta || {};
}
