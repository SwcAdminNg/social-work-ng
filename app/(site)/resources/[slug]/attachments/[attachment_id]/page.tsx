import { fetchApi } from "@/lib/fetchApi";
import { ResourceDownloadButton } from "@/components/resources/ResourceDownloadButton";
import { ResourceAttachmentViewer } from "@/components/resources/ResourceAttachmentViewer";
import { getResource } from "@/lib/resources";
import { ArrowLeft, FileText, Lock } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; attachment_id: string }>;
}): Promise<Metadata> {
  const { slug, attachment_id } = await props.params;
  const { resource } = await getResource(slug);
  const attachment = resource?.attachments?.find((item) => item.id === attachment_id);

  return {
    title: `${attachment?.title || resource?.name || "Resource"} | Social Work Nigeria`,
    // A viewer for one file; the resource page is the one to find in search.
    robots: { index: false, follow: true },
  };
}

export default async function ResourceAttachmentPage(props: {
  params: Promise<{ slug: string; attachment_id: string }>;
}) {
  const { slug, attachment_id } = await props.params;
  const { resource, status } = await getResource(slug);

  if (status === 404) notFound();

  if (!resource) {
    return <ViewerError message="This resource could not be loaded." />;
  }

  if (resource.can_access === false) {
    return <ViewerError message="You do not have access to this resource yet." locked />;
  }

  const attachment = resource.attachments?.find((item) => item.id === attachment_id);
  if (!attachment) notFound();
  const downloadable =
    attachment.attachment_type === "DOCUMENT" &&
    attachment.document?.downloadable === true;

  let viewUrl: string | null = null;
  let viewError: string | null = null;

  if (attachment.attachment_type === "DOCUMENT") {
    viewUrl = downloadable
      ? getDocumentUrl(attachment)
      : `/api/proxy/resources/${slug}/attachments/${attachment_id}/view?stream=1`;

    if (!viewUrl) {
      const res = await fetchApi(`/resources/${slug}/attachments/${attachment_id}/view`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      viewUrl = json?.data?.view_url || json?.view_url || null;
      if (!res.ok || !viewUrl) {
        viewError = json?.message || "This document is not available to view right now.";
      }
    }
  } else if (attachment.attachment_type === "VIDEO") {
    viewUrl = attachment.video?.playback_url || null;
    if (!viewUrl) {
      viewError =
        attachment.video?.status === "READY"
          ? "This video is not available to play right now."
          : "This video is still being prepared.";
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/resources/${slug}`}
              className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-line text-ink no-underline transition-colors hover:border-ink"
              aria-label="Back to resource"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="sw-cap m-0 text-clay-ink">
                {attachment.attachment_type === "VIDEO" ? "Video viewer" : "Document viewer"}
              </p>
              <h1 className="sw-title m-0 mt-1 line-clamp-1 text-lg text-ink sm:text-xl">
                {attachment.title || attachment.document?.file_name || resource.name}
              </h1>
            </div>
          </div>

          {attachment.attachment_type === "DOCUMENT" &&
            downloadable && (
              <ResourceDownloadButton slug={slug} attachmentId={attachment.id} />
            )}
        </div>
      </header>

      <section className="min-h-0 flex-1 p-3 sm:p-5">
        {viewUrl ? (
          <ResourceAttachmentViewer
            attachmentType={attachment.attachment_type}
            title={attachment.title || resource.name}
            url={viewUrl}
            mimeType={attachment.document?.mime_type}
            downloadable={downloadable}
          />
        ) : (
          <div className="mx-auto flex h-[calc(100dvh-120px)] max-w-2xl flex-col items-center justify-center rounded-[32px] border border-dashed border-line bg-card p-8 text-center">
            <FileText className="mb-4 h-10 w-10 text-ink-3" />
            <h2 className="sw-title m-0 text-xl text-ink">
              Viewer unavailable
            </h2>
            <p className="m-0 mt-2 text-sm leading-6 text-ink-2">
              {viewError || "This attachment is not available to view right now."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ViewerError({ message, locked }: { message: string; locked?: boolean }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-paper p-6">
      <div className="max-w-md rounded-[32px] border border-dashed border-line bg-card p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-accent">
          {locked ? <Lock size={26} aria-hidden="true" /> : <FileText size={26} aria-hidden="true" />}
        </span>
        <h1 className="sw-display m-0 mt-6 text-[1.7rem] text-ink">Unable to open attachment</h1>
        <p className="m-0 mt-3 text-ink-2">{message}</p>
        <Link href="/resources" className="sw-btn mt-7 justify-center px-6">
          Back to resources
        </Link>
      </div>
    </div>
  );
}

function getDocumentUrl(attachment: {
  document?: {
    view_url?: string;
    preview_url?: string;
    file_url?: string;
    content_url?: string;
    url?: string;
  };
}) {
  return (
    attachment.document?.view_url ||
    attachment.document?.preview_url ||
    attachment.document?.file_url ||
    attachment.document?.content_url ||
    attachment.document?.url ||
    null
  );
}
