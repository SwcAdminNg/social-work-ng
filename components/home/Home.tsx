import { fetchApi, publicFetchApi } from "@/lib/fetchApi";
import CourseCategories from "./CourseCategories";
import CTABanner from "./CTABanner";
import FeaturedCourses from "./FeaturedCourses";
import Hero from "./Hero";
import LearningTransform from "./LearningTransform";
import WhyChooseUs from "./WhyChooseUs";

type FeaturedLevel = "Beginner" | "Intermediate" | "Advanced";

type FeaturedCourseApi = {
  id: string;
  title: string;
  slug?: string | null;
  category?: string | null;
  level?: string | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  is_free?: boolean | null;
  price?: number | null;
  thumbnail_url?: string | null;
  is_enrolled?: boolean | null;
  is_completed?: boolean | null;
  has_access?: boolean | null;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
};

type FeaturedCourse = {
  id: string;
  title: string;
  category: string;
  level: FeaturedLevel;
  rating: number;
  reviewCount: number;
  price: "Free" | string;
  image: string;
  href: string;
  is_enrolled?: boolean;
  is_completed?: boolean;
  has_access?: boolean;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
};

export default async function Home() {
  const [initialFeaturedRes, catalogsRes, statsRes] = await Promise.all([
    fetchApi("/courses/featured?limit=6", { cache: "no-store" }),
    fetchApi("/courses/catalogs", { next: { revalidate: 3600 } }),
    fetchApi("/home/stats", { next: { revalidate: 3600 } }),
  ]);

  const featuredRes = initialFeaturedRes.ok
    ? initialFeaturedRes
    : await publicFetchApi("/courses/featured?limit=6", { cache: "no-store" });
  let featuredCourses: FeaturedCourse[] = [];
  if (featuredRes.ok) {
    const data = await featuredRes.json().catch(() => ({}));
    const rawCourses = getFeaturedCourseItems(data);

    featuredCourses = rawCourses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category
        ? c.category.replace("_", " ")
        : "Professional Practice",
      level: toFeaturedLevel(c.level),
      rating: c.average_rating || 0,
      reviewCount: c.total_reviews || 0,
      price: c.is_free
        ? "Free"
        : c.price !== null && c.price !== undefined
          ? `₦${c.price.toLocaleString()}`
          : "Premium",
      image: c.thumbnail_url || "/images/auth/social-work.jpg",
      href: `/courses/${c.slug || c.id}`,
      is_enrolled: c.is_enrolled ?? undefined,
      is_completed: c.is_completed ?? undefined,
      has_access: c.has_access ?? undefined,
      estimated_total_minutes: c.estimated_total_minutes,
      estimated_duration: c.estimated_duration,
      certificate_enabled: c.certificate_enabled,
    }));
  }

  let catalogs = [];
  if (catalogsRes.ok) {
    const data = await catalogsRes.json().catch(() => ({}));
    catalogs = data?.data || [];
  }

  let stats = null;
  if (statsRes.ok) {
    const data = await statsRes.json().catch(() => ({}));
    stats = data?.data || null;
  }

  return (
    <>
      <Hero />
      <WhyChooseUs />
      <CourseCategories catalogs={catalogs} />
      <LearningTransform />
      <FeaturedCourses initialCourses={featuredCourses} />
      <CTABanner statsData={stats} />
    </>
  );
}

function getFeaturedCourseItems(json: unknown): FeaturedCourseApi[] {
  if (!json || typeof json !== "object") return [];

  const payload = json as {
    data?: FeaturedCourseApi[] | {
      items?: FeaturedCourseApi[];
      courses?: FeaturedCourseApi[];
    };
    items?: FeaturedCourseApi[];
    courses?: FeaturedCourseApi[];
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

function toFeaturedLevel(value?: string | null): FeaturedLevel {
  const normalized = value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : "";

  return normalized === "Intermediate" || normalized === "Advanced"
    ? normalized
    : "Beginner";
}
