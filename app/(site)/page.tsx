import Home from "@/components/home/Home";
import { fetchApi } from "@/lib/fetchApi";

export default async function HomePage() {
  const res = await fetchApi("/courses/featured?limit=6", {
    cache: "no-store",
  });

  let featuredCourses = [];
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    featuredCourses = (data?.data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category
        ? c.category.replace("_", " ")
        : "Professional Practice",
      level: c.level
        ? c.level.charAt(0).toUpperCase() + c.level.slice(1).toLowerCase()
        : "Beginner",
      rating: 5,
      reviewCount: Math.floor(Math.random() * (150 - 50 + 1) + 50),
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

  return <Home featuredCourses={featuredCourses} />;
}
