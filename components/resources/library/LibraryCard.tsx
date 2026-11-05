import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutTemplate,
  Link2,
  LogIn,
  PlayCircle,
  ScrollText,
} from "lucide-react";
import {
  RESOURCE_CATEGORY_LABELS,
  type ResourceCategory,
  type ResourceRead,
} from "@/lib/resources";
import s from "./Library.module.css";

const TYPE_ICONS: Record<ResourceCategory, typeof FileText> = {
  PRACTICE_RESOURCES: ClipboardList,
  POLICIES_AND_GUIDANCE: ScrollText,
  VIDEOS_AND_WEBINARS: PlayCircle,
  RESEARCH_AND_PUBLICATIONS: BookOpenText,
  TEMPLATES_AND_FORMS: LayoutTemplate,
  COURSE_MATERIALS: GraduationCap,
  CAREER_AND_CPD: Briefcase,
  USEFUL_LINKS: Link2,
};

export function categoryLabel(category?: string) {
  return (category && RESOURCE_CATEGORY_LABELS[category as ResourceCategory]) || "Resource";
}

type Access = { label: string; tone: "public" | "account" | "course"; note?: string };

/** Type (what it is) and access (who can use it) are kept separate, as the brief asks. */
function accessFor(resource: ResourceRead): Access {
  if (resource.visibility === "COURSE_ENROLLED") {
    const course = resource.course_title;
    return {
      label: course ? `Included with ${course}` : "Included with a course",
      tone: "course",
      note: resource.can_access
        ? undefined
        : `Available to learners enrolled on ${course ?? "the related course"}. A free account alone does not unlock it.`,
    };
  }
  if (resource.visibility === "LOGGED_IN") {
    return {
      label: "Free account required",
      tone: "account",
      note: resource.can_access ? undefined : "Sign in or create a free account to open this resource.",
    };
  }
  return { label: "Free public resource", tone: "public" };
}

function actionFor(resource: ResourceRead, href: string) {
  if (resource.can_access !== false) {
    return { label: "Preview Resource", href, primary: true, icon: ArrowRight };
  }
  if (resource.visibility === "COURSE_ENROLLED") {
    // Name the course and send the visitor to it rather than to sign-in.
    const courseHref = resource.course_slug ? `/courses/${resource.course_slug}` : href;
    return { label: "View Course", href: courseHref, primary: false, icon: ArrowRight };
  }
  // Return the learner to this resource after signing in.
  return { label: "Sign in to access", href: `/login?callbackUrl=${encodeURIComponent(href)}`, primary: false, icon: LogIn };
}

function dateLine(resource: ResourceRead) {
  const updated = resource.updated_at ? new Date(resource.updated_at) : null;
  const created = resource.created_at ? new Date(resource.created_at) : null;
  const date = updated ?? created;
  if (!date || Number.isNaN(date.getTime())) return null;
  const formatted = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return { label: updated ? `Updated ${formatted}` : `Added ${formatted}`, iso: date.toISOString() };
}

export default function LibraryCard({ resource }: { resource: ResourceRead }) {
  const href = `/resources/${resource.slug || resource.id}`;
  const Icon = TYPE_ICONS[resource.category as ResourceCategory] ?? FileText;
  const access = accessFor(resource);
  const action = actionFor(resource, href);
  const ActionIcon = action.icon;
  const date = dateLine(resource);
  const toneClass = access.tone === "public" ? s.badgePublic : access.tone === "account" ? s.badgeAccount : s.badgeCourse;
  const titleId = `resource-${resource.id}`;

  return (
    <article className={s.card} aria-labelledby={titleId}>
      <div className={s.cardTop}>
        <span className={s.typeIcon} aria-hidden="true">
          {resource.thumbnail_url ? (
            <Image src={resource.thumbnail_url} alt="" fill sizes="56px" unoptimized />
          ) : (
            <Icon size={26} strokeWidth={1.75} />
          )}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className={s.badges}>
            <span className={`${s.badge} ${toneClass}`}>{access.label}</span>
          </div>
          <h3 id={titleId} className={s.cardTitle}>
            <Link href={href}>{resource.name}</Link>
          </h3>
          <p className={s.cardType}>{categoryLabel(resource.category)}</p>
        </div>
      </div>

      {resource.description && <p className={s.cardBody}>{resource.description}</p>}
      {date && (
        <p className={s.cardMeta}>
          <time dateTime={date.iso}>{date.label}</time>
        </p>
      )}

      <div className={s.cardFoot}>
        {access.note && <p className={s.accessNote}>{access.note}</p>}
        <Link
          href={action.href}
          className={`${s.cta} ${action.primary ? s.ctaPrimary : s.ctaSecondary}`}
          aria-label={`${action.label}: ${resource.name}`}
        >
          {action.label} <ActionIcon size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
