"use client";

import { ArrowRight, Clock3, Trophy } from "lucide-react";
import Link from "next/link";
import { getCourseDurationLabel } from "@/lib/courseDuration";

interface SiteCourseCardProps {
  id: string;
  title: string;
  thumbnail_url?: string;
  is_free?: boolean;
  price?: number;
  href: string;
  is_enrolled?: boolean;
  is_completed?: boolean;
  has_access?: boolean;
  // Optional fields that might not be in the API but are needed for the UI
  level?: string;
  category?: string;
  average_rating?: number;
  total_reviews?: number;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-[#14402F] text-white",
  Intermediate: "bg-[#EBA937] text-[#10291E]",
  Advanced: "bg-[#557F8F] text-white",
};

function formatEnumString(str: string): string {
  if (!str) return str;
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill={i < rating ? "#EBA937" : "none"}
          stroke="#EBA937"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 1.5l1.545 3.13 3.455.502-2.5 2.437.59 3.441L8 9.25l-3.09 1.76.59-3.44L3 5.132l3.455-.502z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * One course as a rounded tile: its picture with the level and access
 * labels, the rating when it has one, the title, category, duration and
 * certificate, and the price or enrolment state with the link to it.
 */
export function SiteCourseCard({
  id,
  title,
  thumbnail_url,
  is_free,
  price,
  href,
  is_enrolled,
  is_completed,
  has_access,
  level = "Beginner",
  category = "Professional Development",
  average_rating,
  total_reviews,
  estimated_total_minutes,
  estimated_duration,
  certificate_enabled,
}: SiteCourseCardProps) {
  const displayPrice = is_free ? "Free" : price ? `₦${price.toLocaleString()}` : "Paid";
  const fallbackImage = "/images/home/swcl/elearning.webp";
  const displayCategory = formatEnumString(category);
  const displayLevel = formatEnumString(level);
  const durationLabel = getCourseDurationLabel({ estimated_duration, estimated_total_minutes });
  const canViewCourse = is_enrolled === true || has_access === true || is_completed === true;

  return (
    <article
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(20,64,47,0.45)] dark:hover:shadow-none"
      aria-labelledby={`course-${id}-title`}
    >
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-[#EEF5F1] dark:bg-[#0F1A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2D6A4F]"
        aria-label={title}
      >
        <img
          src={thumbnail_url || fallbackImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${levelColors[displayLevel] || levelColors["Beginner"]}`}
        >
          {displayLevel}
        </span>
        {canViewCourse && (
          <span className="absolute right-3 top-3 rounded-full bg-black/45 backdrop-blur-md px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white">
            {is_completed ? "Completed" : is_enrolled ? "Enrolled" : "Access"}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {total_reviews !== undefined && total_reviews > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={average_rating || 0} />
            <span className="text-[0.8rem] font-bold text-gray-900 dark:text-[#ECF2EE]">
              {Number(average_rating).toFixed(1)}
            </span>
            <span className="text-[0.75rem] text-gray-500 dark:text-[#A3B3A9]">
              ({total_reviews} reviews)
            </span>
          </div>
        )}

        <h3
          id={`course-${id}-title`}
          className="line-clamp-2 text-[1.05rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]"
        >
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#EEF5F1] dark:bg-[#0F1A14] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#2D6A4F] dark:text-[#74c69d]">
            {displayCategory}
          </span>
          {durationLabel && (
            <span className="inline-flex items-center gap-1 rounded-full ring-1 ring-black/10 dark:ring-white/10 px-3 py-1 text-[0.72rem] font-semibold text-gray-600 dark:text-[#A3B3A9]">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {durationLabel}
            </span>
          )}
          {certificate_enabled === true && (
            <span className="inline-flex items-center gap-1 rounded-full ring-1 ring-black/10 dark:ring-white/10 px-3 py-1 text-[0.72rem] font-semibold text-[#B7791F] dark:text-[#F3C56B]">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              Certificate
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="flex items-center justify-between gap-3 border-t border-gray-900/10 dark:border-white/10 pt-4">
          <span className="text-[1rem] font-bold text-[#14402F] dark:text-[#74c69d]">
            {is_completed ? "Completed" : canViewCourse ? "Enrolled" : displayPrice}
          </span>
          <Link
            href={href}
            className="group/cta inline-flex items-center gap-1.5 text-[0.88rem] font-bold text-gray-900 dark:text-[#ECF2EE] hover:text-[#2D6A4F] dark:hover:text-[#74c69d] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
          >
            {canViewCourse ? "View course" : "Get enrolled"}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover/cta:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
