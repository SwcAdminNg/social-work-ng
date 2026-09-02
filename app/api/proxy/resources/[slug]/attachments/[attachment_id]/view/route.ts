import { auth } from "@/auth";
import { NextResponse } from "next/server";

type SessionWithAccessToken = {
  accessToken?: string;
};

export async function GET(
  req: Request,
  props: { params: Promise<{ slug: string; attachment_id: string }> },
) {
  const params = await props.params;

  try {
    const session = (await auth()) as SessionWithAccessToken | null;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    const res = await fetch(
      `${baseUrl}/resources/${params.slug}/attachments/${params.attachment_id}/view`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const data = await res.json().catch(() => ({}));
    const shouldStream = new URL(req.url).searchParams.get("stream") === "1";

    if (shouldStream) {
      const viewUrl =
        data?.data?.view_url ||
        data?.view_url ||
        (await getAttachmentDocumentUrl(baseUrl, params.slug, params.attachment_id, headers));

      if (!viewUrl) {
        return NextResponse.json(data, { status: res.status });
      }

      const fileRes = await fetch(viewUrl, {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
      });

      if (!fileRes.ok || !fileRes.body) {
        return NextResponse.json(
          { message: "This document is not available to view right now." },
          { status: fileRes.status || 502 },
        );
      }

      return new Response(fileRes.body, {
        status: 200,
        headers: buildInlineHeaders(fileRes),
      });
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getAttachmentDocumentUrl(
  baseUrl: string,
  slug: string,
  attachmentId: string,
  headers: Headers,
) {
  const resourceRes = await fetch(`${baseUrl}/resources/${slug}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  const resourceJson = await resourceRes.json().catch(() => ({}));
  const attachments = resourceJson?.data?.attachments;

  if (!Array.isArray(attachments)) return null;

  const attachment = attachments.find((item) => item?.id === attachmentId);
  return (
    attachment?.document?.view_url ||
    attachment?.document?.preview_url ||
    attachment?.document?.file_url ||
    attachment?.document?.content_url ||
    attachment?.document?.url ||
    null
  );
}

function buildInlineHeaders(fileRes: Response) {
  const headers = new Headers();
  headers.set(
    "Content-Type",
    fileRes.headers.get("content-type") || "application/octet-stream",
  );
  headers.set("Content-Disposition", "inline");
  headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  return headers;
}
