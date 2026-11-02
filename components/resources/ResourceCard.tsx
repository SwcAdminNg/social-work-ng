import { ResourceRead, formatResourceCategory, getResourceCta } from "@/lib/resources";
import { ArrowRight, FileText, Link2, Lock, PlayCircle } from "lucide-react";
import Link from "next/link";

/**
 * One resource as a rounded tile: its picture or an icon on mint, the
 * category and access level as small labels, the name and description,
 * and the action it invites (view, log in or enrol to unlock).
 */
export function ResourceCard({ resource }: { resource: ResourceRead }) {
  const href = `/resources/${resource.slug || resource.id}`;
  const isLocked = resource.can_access === false;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(20,64,47,0.45)] dark:hover:shadow-none">
      <Link
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-[#EEF5F1] dark:bg-[#0F1A14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2D6A4F]"
        aria-label={resource.name}
      >
        {resource.thumbnail_url ? (
          <img
            src={resource.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#2D6A4F] dark:text-[#74c69d]">
            {getResourceIcon(resource.category)}
          </div>
        )}
        {isLocked && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Locked
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#EEF5F1] dark:bg-[#0F1A14] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#2D6A4F] dark:text-[#74c69d]">
            {formatResourceCategory(resource.category)}
          </span>
          {resource.visibility && (
            <span className="rounded-full ring-1 ring-black/10 dark:ring-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-[#A3B3A9]">
              {formatVisibility(resource.visibility)}
            </span>
          )}
        </div>

        <h2 className="mt-4 line-clamp-2 text-[1.1rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]">
          <Link
            href={href}
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
          >
            {resource.name}
          </Link>
        </h2>
        {resource.description && (
          <p className="mt-2 line-clamp-3 text-[0.92rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9]">
            {resource.description}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={href}
            className={`group/cta inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full px-5 text-[0.9rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] ${
              isLocked
                ? "bg-[#EEF5F1] dark:bg-[#0F1A14] text-[#14402F] dark:text-[#C3D1C8] hover:bg-[#e2efe8] dark:hover:bg-[#15241b]"
                : "bg-[#14402F] text-white hover:bg-[#0c2a1e]"
            }`}
          >
            {isLocked && <Lock className="h-4 w-4" aria-hidden="true" />}
            {getResourceCta(resource)}
            {!isLocked && (
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover/cta:translate-x-1"
                aria-hidden="true"
              />
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

function getResourceIcon(category?: string) {
  if (category === "VIDEOS_AND_WEBINARS") return <PlayCircle className="h-12 w-12" aria-hidden="true" />;
  if (category === "USEFUL_LINKS") return <Link2 className="h-12 w-12" aria-hidden="true" />;
  return <FileText className="h-12 w-12" aria-hidden="true" />;
}

function formatVisibility(visibility: string) {
  if (visibility === "PUBLIC") return "Public";
  if (visibility === "LOGGED_IN") return "Account";
  if (visibility === "COURSE_ENROLLED") return "Enrolled";
  return visibility;
}
