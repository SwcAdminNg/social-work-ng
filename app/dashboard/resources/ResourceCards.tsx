import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  ChevronRight,
  FileText,
  FlaskConical,
  Link2,
  Lock,
  PlayCircle,
  Scale,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { type ResourceRead, formatResourceCategory } from "@/lib/resources";

/** Each category has its own symbol and colour, like file kinds in Files. */
const CATEGORY_LOOK: Record<string, { icon: LucideIcon; tone: string }> = {
  COURSE_MATERIALS: { icon: BookOpen, tone: "green" },
  PRACTICE_RESOURCES: { icon: Wrench, tone: "blue" },
  POLICIES_AND_GUIDANCE: { icon: Scale, tone: "indigo" },
  TEMPLATES_AND_FORMS: { icon: FileText, tone: "orange" },
  VIDEOS_AND_WEBINARS: { icon: PlayCircle, tone: "red" },
  RESEARCH_AND_PUBLICATIONS: { icon: FlaskConical, tone: "gold" },
  CAREER_AND_CPD: { icon: Briefcase, tone: "green" },
  USEFUL_LINKS: { icon: Link2, tone: "blue" },
};

export function look(category?: string) {
  return CATEGORY_LOOK[category ?? ""] ?? { icon: FileText, tone: "gray" };
}

function lockedLabel(resource: ResourceRead) {
  if (resource.access_reason === "LOGIN_REQUIRED") return "Sign in to open";
  if (resource.access_reason === "ENROLLMENT_REQUIRED") return "Enrol in the course to open";
  return "Locked";
}

export function ResourceCard({ resource }: { resource: ResourceRead }) {
  const locked = resource.can_access === false;
  const href = `/resources/${resource.slug || resource.id}`;
  const { icon: Icon, tone } = look(resource.category);

  return (
    <article className="lms-milk lms-milk-hover group relative flex h-full flex-col p-2.5">
      <div className="relative">
        {resource.thumbnail_url ? (
          <span className="lms-art relative block aspect-[16/10] overflow-hidden bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resource.thumbnail_url} alt="" loading="lazy" decoding="async" className="sw-zoom h-full w-full object-cover" />
          </span>
        ) : (
          <span className={`lms-art lms-doc lms-doc--${tone} relative grid aspect-[16/10] place-items-center overflow-hidden`}>
            <span className="lms-doc-glyph">
              <Icon className="h-8 w-8" strokeWidth={1.8} aria-hidden="true" />
            </span>
          </span>
        )}
        <span className={`lms-glass-pill pointer-events-none absolute left-2.5 top-2.5 ${locked ? "" : "lms-glass-pill--done"}`}>
          {locked ? <Lock className="h-3 w-3" aria-hidden="true" /> : <ShieldCheck className="h-3 w-3" aria-hidden="true" />}
          {locked ? "Locked" : "Ready"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-ink-3">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {formatResourceCategory(resource.category)}
        </span>
        <h2 className="sw-title m-0 mt-1.5 line-clamp-2 text-[1.06rem] leading-snug text-ink">
          <Link href={href} className="lms-stretch text-inherit no-underline">
            {resource.name}
          </Link>
        </h2>
        {resource.description && (
          <p className="m-0 mt-1.5 line-clamp-2 text-[0.86rem] leading-relaxed text-ink-2">{resource.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="min-w-0 truncate text-[0.78rem] text-ink-3">
            {locked ? lockedLabel(resource) : resource.course_title ? resource.course_title : "Open to read or download"}
          </span>
          <span className={`lms-btn !min-h-9 !px-4 !text-[0.82rem] ${locked ? "lms-btn--quiet" : ""}`} aria-hidden="true">
            {locked ? <Lock className="h-3.5 w-3.5" /> : null}
            {locked ? "Details" : "Open"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function ResourceRow({ resource }: { resource: ResourceRead }) {
  const locked = resource.can_access === false;
  const href = `/resources/${resource.slug || resource.id}`;
  const { icon: Icon, tone } = look(resource.category);

  return (
    <div className="lms-row group">
      <span className={`lms-sym lms-sym--lg lms-sym--${tone}`}>
        <Icon className="h-5 w-5" strokeWidth={2.1} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 truncate text-[0.98rem] font-semibold tracking-[-0.01em] text-ink">
          <Link href={href} className="lms-stretch text-inherit no-underline">
            {resource.name}
          </Link>
        </h2>
        {resource.description && <p className="m-0 mt-0.5 truncate text-[0.84rem] text-ink-2">{resource.description}</p>}
        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.78rem]">
          <span className="text-ink-3">{formatResourceCategory(resource.category)}</span>
          <span className={`lms-status ${locked ? "lms-status--gray" : "lms-status--green"}`}>
            {locked ? lockedLabel(resource) : "Ready"}
          </span>
        </span>
      </div>
      <span className={`lms-row-action ${locked ? "" : "lms-row-action--primary"} hidden sm:inline-flex`} aria-hidden="true">
        {locked ? "Details" : "Open"}
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-ink-3 sm:hidden" aria-hidden="true" />
    </div>
  );
}
