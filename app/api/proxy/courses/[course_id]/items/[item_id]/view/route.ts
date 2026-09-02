import { auth } from "@/auth";
import { NextResponse } from "next/server";

type SessionWithAccessToken = {
  accessToken?: string;
};

type LearningDocumentItem = {
  item_type?: string;
  document_url?: string;
  document?: {
    file_url?: string;
    content_url?: string;
    url?: string;
    view_url?: string;
    preview_url?: string;
    mime_type?: string;
    file_name?: string;
  } | null;
};

export async function GET(
  req: Request,
  props: { params: Promise<{ course_id: string; item_id: string }> },
) {
  const params = await props.params;

  try {
    const session = (await auth()) as SessionWithAccessToken | null;
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const itemRes = await fetch(
      `${baseUrl}/learning/courses/${params.course_id}/items/${params.item_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const itemJson = await itemRes.json().catch(() => ({}));
    const item = (itemJson?.data || itemJson) as LearningDocumentItem | null;
    const documentUrl = item ? getDocumentUrl(item) : null;

    if (!itemRes.ok || !documentUrl || item?.item_type !== "DOCUMENT") {
      return NextResponse.json(
        { message: itemJson?.message || "This document is not available." },
        { status: itemRes.ok ? 404 : itemRes.status },
      );
    }

    const fileRes = await fetch(documentUrl, {
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
      headers: buildInlineHeaders(fileRes, item),
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

function getDocumentUrl(item: LearningDocumentItem) {
  return (
    item.document?.view_url ||
    item.document?.preview_url ||
    item.document?.file_url ||
    item.document?.content_url ||
    item.document?.url ||
    item.document_url ||
    null
  );
}

function buildInlineHeaders(fileRes: Response, item: LearningDocumentItem) {
  const headers = new Headers();
  const contentType =
    fileRes.headers.get("content-type") ||
    item.document?.mime_type ||
    "application/octet-stream";

  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", buildInlineDisposition(item.document?.file_name));
  headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");

  return headers;
}

function buildInlineDisposition(fileName?: string) {
  if (!fileName) return "inline";
  return `inline; filename="${fileName.replace(/["\\]/g, "")}"`;
}
