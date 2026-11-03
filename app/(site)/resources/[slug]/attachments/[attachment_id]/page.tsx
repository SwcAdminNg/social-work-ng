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
    <main className="flex min-h-screen flex-col bg-[#f7fcf9] dark:bg-[#0b1220]">
      <header className="sticky top-0 z-20 border-b border-[#dceee4] bg-white/95 px-4 py-3 backdrop-blur dark:border-[#27433a] dark:bg-[#111525]/95 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/resources/${slug}`}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-[#dceee4] text-slate-600 transition hover:bg-[#f0fbf5] hover:text-[#2D6A4F] dark:border-[#27433a] dark:text-slate-300 dark:hover:bg-[#183026]"
              aria-label="Back to resource"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:text-[#b7e4c7]">
                {attachment.attachment_type === "VIDEO" ? "Video viewer" : "Document viewer"}
              </p>
              <h1 className="line-clamp-1 text-base font-extrabold text-slate-950 dark:text-white sm:text-lg">
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
          <div className="mx-auto flex h-[calc(100dvh-120px)] max-w-2xl flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111525]">
            <FileText className="mb-4 h-10 w-10 text-slate-400" />
            <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
              Viewer unavailable
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
              {viewError || "This attachment is not available to view right now."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ViewerError({ message, locked }: { message: string; locked?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fcf9] p-6 dark:bg-[#0b1220]">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111525]">
        {locked ? (
          <Lock className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        ) : (
          <FileText className="mx-auto mb-4 h-10 w-10 text-slate-400" />
        )}
        <h1 className="text-lg font-extrabold text-slate-950 dark:text-white">
          Unable to open attachment
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
          {message}
        </p>
        <Link
          href="/resources"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
        >
          Back to resources
        </Link>
      </div>
    </main>
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
