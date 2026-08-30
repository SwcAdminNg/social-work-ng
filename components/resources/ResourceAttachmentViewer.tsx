"use client";

import { HlsVideoPlayer } from "@/components/learning/HlsVideoPlayer";

type ResourceAttachmentViewerProps = {
  attachmentType?: string | null;
  title: string;
  url: string;
};

export function ResourceAttachmentViewer({
  attachmentType,
  title,
  url,
}: ResourceAttachmentViewerProps) {
  if (attachmentType === "VIDEO") {
    return (
      <div className="mx-auto flex h-[calc(100dvh-112px)] max-w-7xl items-center rounded-lg bg-black shadow-sm">
        <HlsVideoPlayer url={url} className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100dvh-112px)] max-w-7xl overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
      <iframe
        src={getDocumentViewerSrc(url)}
        title={title}
        className="h-full w-full border-0 bg-white"
        sandbox="allow-same-origin allow-scripts allow-popups"
      />
    </div>
  );
}

function getDocumentViewerSrc(url: string) {
  const withoutQuery = url.split("?")[0]?.toLowerCase() || url.toLowerCase();
  const withToolbarHidden = appendPdfViewerOptions(url);
  if (withoutQuery.endsWith(".pdf")) return withToolbarHidden;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

function appendPdfViewerOptions(url: string) {
  const separator = url.includes("#") ? "&" : "#";
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=0`;
}
