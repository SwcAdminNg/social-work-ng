import { fetchApi } from "@/lib/fetchApi";
import { EnrollButton } from "./EnrollButton";
import { CourseCurriculum } from "./CourseCurriculum";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { IconBookOpen } from "@/components/dashboard/icons";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const res = await fetchApi(`/courses/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return { title: "Course Not Found | Social Work Nigeria" };

  const data = await res.json().catch(() => ({}));
  const course = data?.data;

  if (!course) return { title: "Course Not Found | Social Work Nigeria" };

  const url = `${process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org"}/courses/${course.slug || course.id}`;

  return {
    title: `${course.title} | Social Work Nigeria`,
    description:
      course.description ||
      `Enroll in ${course.title} and advance your professional skills with Social Work Nigeria.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: course.title,
      description:
        course.description ||
        `Enroll in ${course.title} and advance your professional skills.`,
      url,
      siteName: "Social Work Nigeria",
      images: [
        {
          url:
            course.thumbnail_url ||
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description,
      images: [
        course.thumbnail_url ||
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
      ],
    },
  };
}

export default async function CourseDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(`/courses/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const course = data?.data;

  if (!course) {
    return (
      <div className="p-20 text-center text-red-500">
        Failed to load course details.
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description:
      course.description || `Comprehensive course on ${course.title}`,
    provider: {
      "@type": "Organization",
      name: "Social Work Nigeria",
      sameAs:
        process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org",
    },
    image: course.thumbnail_url || undefined,
    offers: {
      "@type": "Offer",
      category: course.is_free ? "Free" : "Paid",
      price: course.price || 0,
      priceCurrency: "NGN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <div className="relative w-full py-16 lg:py-24 overflow-hidden bg-gray-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${course.thumbnail_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"}")`,
          }}
        />
        <div className="absolute inset-0 z-10 bg-black/40" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full">
          <div className="flex-1 w-full lg:pr-12 pt-4 lg:pt-8">
            {/* Back Button */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Courses
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {course.is_free ? (
                <span className="px-3 py-1.5 text-xs font-extrabold tracking-wider bg-[#F4A261] text-white rounded-lg shadow-lg">
                  FREE COURSE
                </span>
              ) : course.price !== undefined ? (
                <span className="px-3 py-1.5 text-xs font-extrabold tracking-wider bg-[#2D6A4F] text-white rounded-lg shadow-lg">
                  PREMIUM
                </span>
              ) : null}
              {course.category && (
                <span className="px-3 py-1.5 text-xs font-extrabold tracking-wider bg-white/10 text-white rounded-lg border border-white/20 backdrop-blur-md">
                  {course.category.replace("_", " ")}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1] drop-shadow-2xl">
              {course.title}
            </h1>

            {/* Rating Display */}
            {course.total_reviews !== undefined && course.total_reviews > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < (course.average_rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300/50"}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-white drop-shadow-md ml-1">
                  {Number(course.average_rating).toFixed(1)}
                </span>
                <span className="text-base font-medium text-gray-300 drop-shadow-md">
                  ({course.total_reviews} reviews)
                </span>
              </div>
            )}

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed drop-shadow-md font-medium">
              {course.description ||
                "Unlock premium insights, structured learning, and actionable strategies tailored for you."}
            </p>
          </div>

          {/* Spacer to keep text constrained when sidebar overlaps */}
          <div className="hidden lg:block w-[400px] flex-shrink-0" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column (Curriculum) */}
          <div className="flex-1 space-y-12 pt-12 lg:pt-16">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight">
                Curriculum
              </h2>
              <CourseCurriculum
                courseId={course.id}
                sections={course.sections}
              />

              {/* Course Reviews */}
              <CourseReviews courseId={course.id} />
            </div>
          </div>
          {/* Right Column (Sticky Sidebar) */}
          <div className="w-full lg:w-[400px] flex-shrink-0 lg:-mt-64 relative z-30">
            <div className="sticky top-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <IconBookOpen />
                  </div>
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.is_free
                  ? "Free"
                  : course.price !== undefined
                    ? `₦${course.price.toLocaleString()}`
                    : "Premium"}
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                {course.is_enrolled
                  ? "You are already enrolled. Jump back in and continue your progress."
                  : "Join thousands of professionals already learning."}
              </p>

              <EnrollButton
                courseId={course.id}
                isEnrolled={course.is_enrolled}
                isFree={course.is_free}
                price={course.price}
                hasAccess={course.has_access}
              />

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Full
                  lifetime access
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Access
                  on mobile and TV
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />{" "}
                  Certificate of completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
