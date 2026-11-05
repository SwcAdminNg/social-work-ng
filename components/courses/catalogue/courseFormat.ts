// Shared labels and formatting for the public course catalogue.

export type CatalogueCourse = {
  id: string;
  title: string;
  slug?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  is_free?: boolean;
  price?: number | null;
  level?: string;
  access_mode?: string | null;
  average_rating?: number;
  total_reviews?: number;
  estimated_total_minutes?: number | null;
  estimated_duration?: string | null;
  certificate_enabled?: boolean | null;
  is_enrolled?: boolean | null;
  has_access?: boolean | null;
  is_completed?: boolean | null;
};

export type CourseCatalog = { name: string; slug: string; total_courses?: number };

// The brief's level names, mapped from the API's levels, with plain descriptions.
export const LEVELS = [
  { value: "BEGINNER", label: "Foundation", description: "No prior study needed." },
  { value: "INTERMEDIATE", label: "Developing Practice", description: "Builds on some study or practice experience." },
  { value: "ADVANCED", label: "Advanced Practice", description: "For experienced practitioners." },
] as const;

export const COSTS = [
  { value: "true", label: "Free" },
  { value: "false", label: "Paid" },
] as const;

export function levelLabel(level?: string) {
  return LEVELS.find((l) => l.value === level)?.label ?? null;
}

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

/** Distinguishes a zero fee from an unknown fee, as the brief asks. */
export function priceLabel(course: CatalogueCourse): string | null {
  if (course.is_free) return "Free";
  if (typeof course.price === "number" && course.price > 0) return naira.format(course.price);
  return null;
}

/** First sentence or so of the description, as a short benefit statement. */
export function summaryOf(description?: string | null): string | null {
  if (!description) return null;
  const text = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

const FALLBACK_IMAGES = [
  "/images/courses/learners-collaborate.webp",
  "/images/courses/professionals-discuss.webp",
  "/images/courses/reflective-notes.webp",
];

/** A consistent stand-in photo for courses without a thumbnail. */
export function fallbackImage(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
}
