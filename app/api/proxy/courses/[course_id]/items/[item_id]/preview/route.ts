import { NextResponse } from "next/server";
import { auth } from "@/auth";

type SessionWithAccessToken = {
  accessToken?: string;
};

// Free-preview content for the public course page. Works signed in or out: the
// API only serves items marked as a free preview in a published course. The
// `course_id` segment carries the course slug, as the download route does.
export async function GET(
  _req: Request,
  props: { params: Promise<{ course_id: string; item_id: string }> },
) {
  const params = await props.params;

  try {
    const session = (await auth().catch(() => null)) as SessionWithAccessToken | null;
    const accessToken = session?.accessToken;
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/courses/${encodeURIComponent(params.course_id)}/items/${encodeURIComponent(params.item_id)}/preview`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
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
