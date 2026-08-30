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
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
