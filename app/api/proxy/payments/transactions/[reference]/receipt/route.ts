import { auth } from "@/auth";
import { NextResponse } from "next/server";

type SessionWithAccessToken = {
  accessToken?: string;
};

export async function GET(
  req: Request,
  props: { params: Promise<{ reference: string }> },
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

    const res = await fetch(
      `${baseUrl}/payments/transactions/${encodeURIComponent(params.reference)}/receipt`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    if (!res.body) {
      return NextResponse.json(
        { message: "Receipt is not available right now." },
        { status: 502 },
      );
    }

    return new Response(res.body, {
      status: 200,
      headers: buildReceiptHeaders(res, params.reference),
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

function buildReceiptHeaders(res: Response, reference: string) {
  const headers = new Headers();
  const contentDisposition =
    res.headers.get("content-disposition") ||
    `attachment; filename="Receipt-${reference}.pdf"`;

  headers.set("Content-Type", res.headers.get("content-type") || "application/pdf");
  headers.set("Content-Disposition", contentDisposition);
  headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");

  return headers;
}
