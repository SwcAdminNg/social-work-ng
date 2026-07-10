import { fetchApi } from "@/lib/fetchApi";
import Navbar from "../generic/essentials/Navbar";
import CourseCategories from "./CourseCategories";
import CTABanner from "./CTABanner";
import FeaturedCourses from "./FeaturedCourses";
import Hero from "./Hero";
import LearningTransform from "./LearningTransform";
import WhyChooseUs from "./WhyChooseUs";

export default async function Home() {
  const [featuredRes, catalogsRes, statsRes] = await Promise.all([
    fetchApi("/courses/featured?limit=6", { cache: "no-store" }),
    fetchApi("/courses/catalogs", { next: { revalidate: 3600 } }),
    fetchApi("/home/stats", { next: { revalidate: 3600 } }),
  ]);

  let featuredCourses = [];
  if (featuredRes.ok) {
    const data = await featuredRes.json().catch(() => ({}));
    featuredCourses = (data?.data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category
        ? c.category.replace("_", " ")
        : "Professional Practice",
      level: c.level
        ? c.level.charAt(0).toUpperCase() + c.level.slice(1).toLowerCase()
        : "Beginner",
      rating: c.average_rating || 0,
      reviewCount: c.total_reviews || 0,
      price: c.is_free
        ? "Free"
        : c.price !== null && c.price !== undefined
          ? `₦${c.price.toLocaleString()}`
          : "Premium",
      image: c.thumbnail_url || "/images/auth/social-work.jpg",
      href: `/courses/${c.slug || c.id}`,
      is_enrolled: c.is_enrolled,
      has_access: c.has_access,
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
    <main>
      <Hero />
      <WhyChooseUs />
      <CourseCategories catalogs={catalogs} />
      <LearningTransform />
      <FeaturedCourses initialCourses={featuredCourses} />
      <CTABanner statsData={stats} />
    </main>
  );
}
