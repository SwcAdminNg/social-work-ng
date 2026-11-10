import Link from "next/link";
import { ExternalLink, Eye, FileText, Link2, Lock, PlayCircle } from "lucide-react";
import { ResourceDownloadButton } from "@/components/resources/ResourceDownloadButton";
import { Btn, type Vars } from "@/components/site/ui";
import { formatDuration, type ResourceAttachment, type ResourceRead } from "@/lib/resources";

/** What a resource holds: its documents, recordings and links, or how to unlock them. */
export function ResourceAttachments({ resource }: { resource: ResourceRead }) {
  if (resource.can_access === false) {
    const loginRequired = resource.access_reason === "LOGIN_REQUIRED";
    const href = loginRequired
      ? `/login?callbackUrl=/resources/${resource.slug || resource.id}`
      : resource.course_slug || resource.course_id
        ? `/courses/${resource.course_slug || resource.course_id}`
        : "/courses";

    return (
      <div data-reveal className="rounded-[32px] border border-dashed border-gold bg-gold/10 p-8 text-center md:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-[#10231a]">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h2 className="sw-display m-0 mt-6 text-[clamp(1.6rem,3vw,2.2rem)] text-ink">
          {loginRequired ? "Log in to unlock this resource" : "Enroll to unlock this resource"}
        </h2>
        <p className="mx-auto m-0 mt-3 max-w-xl text-[1.02rem] leading-relaxed text-ink-2">
          {loginRequired
            ? "Create an account or log in to access the documents, links, and recordings attached to this library entry."
            : "This resource is part of a course library. Once you are enrolled, the attachments open automatically here."}
        </p>
        <div className="mt-7 flex justify-center">
          <Btn href={href}>{loginRequired ? "Log in" : "View course"}</Btn>
        </div>
      </div>
    );
  }

  const attachments = [...(resource.attachments || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  if (attachments.length === 0) {
    return (
      <p data-reveal className="m-0 rounded-[28px] border border-dashed border-line bg-card p-10 text-center text-ink-2">
        Attachments are not available for this resource yet.
      </p>
    );
  }

  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {attachments.map((attachment, index) => (
        <li key={attachment.id} data-reveal style={{ "--d": `${Math.min(index, 5) * 0.06}s` } as Vars}>
          <AttachmentCard attachment={attachment} slug={resource.slug || resource.id} canAccess={resource.can_access === true} />
        </li>
      ))}
    </ol>
  );
}

const cardClass =
  "sw-card-hover flex flex-col gap-5 rounded-[28px] border border-line bg-card p-6 sm:flex-row sm:items-center sm:justify-between md:p-7";
const actionClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep px-5 text-[0.95rem] font-semibold text-white no-underline transition-colors hover:bg-forest dark:bg-brand";

function Lead({ icon: Icon, kind, title, detail }: { icon: typeof FileText; kind: string; title: string; detail?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-4">
      <span className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-mint text-accent" aria-hidden="true">
        <Icon size={24} strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="sw-cap m-0 text-clay-ink">{kind}</p>
        <h3 className="sw-title m-0 mt-1.5 text-[1.3rem] text-ink">{title}</h3>
        {detail && <p className="m-0 mt-1.5 break-words text-[0.95rem] leading-relaxed text-ink-2">{detail}</p>}
      </div>
    </div>
  );
}

function AttachmentCard({ attachment, slug, canAccess }: { attachment: ResourceAttachment; slug: string; canAccess: boolean }) {
  const viewHref = `/resources/${slug}/attachments/${attachment.id}`;

  if (attachment.attachment_type === "VIDEO") {
    const duration = formatDuration(attachment.video?.duration_seconds);
    const isReady = attachment.video?.status === "READY" && Boolean(attachment.video?.playback_url);
    return (
      <article className={cardClass}>
        <Lead
          icon={PlayCircle}
          kind="Video"
          title={attachment.title || "Video"}
          detail={isReady ? duration || "Ready to watch" : "This video is still being prepared."}
        />
        {isReady && (
          <Link href={viewHref} className={actionClass}>
            <PlayCircle size={17} aria-hidden="true" /> Watch
          </Link>
        )}
      </article>
    );
  }

  if (attachment.attachment_type === "LINKS") {
    const url = attachment.link?.url;
    return (
      <article className={cardClass}>
        <Lead
          icon={Link2}
          kind="Link"
          title={attachment.link?.label || attachment.title || "Open link"}
          detail={
            <>
              {attachment.link?.description}
              {attachment.link?.description && url && <br />}
              {url && <span className="text-ink-3">{url}</span>}
            </>
          }
        />
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className={actionClass}>
            <ExternalLink size={16} aria-hidden="true" /> Open
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </article>
    );
  }

  const downloadable = canAccess && attachment.document?.downloadable === true;
  const size = formatFileSize(attachment.document?.file_size_bytes);
  return (
    <article className={cardClass}>
      <Lead
        icon={FileText}
        kind="Document"
        title={attachment.title || attachment.document?.file_name || "Document"}
        detail={
          <>
            {[attachment.document?.file_name, size].filter(Boolean).join(" · ") || "Document attachment"}
            {!downloadable && (
              <>
                <br />
                <span className="text-ink-3">View-only document. Downloads are disabled by the instructor.</span>
              </>
            )}
          </>
        }
      />
      <div className="flex flex-none flex-wrap items-center gap-2">
        <Link href={viewHref} className={actionClass}>
          <Eye size={17} aria-hidden="true" /> View
        </Link>
        {downloadable && <ResourceDownloadButton slug={slug} attachmentId={attachment.id} />}
      </div>
    </article>
  );
}

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
