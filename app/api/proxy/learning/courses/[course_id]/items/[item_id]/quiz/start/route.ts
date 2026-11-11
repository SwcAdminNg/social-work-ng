import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Gets the version of the quiz to take: as written the first time, reworded by AI on a retry. */
export async function POST(
  _req: Request,
  props: { params: Promise<{ course_id: string; item_id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const res = await fetch(
      `${baseUrl}/learning/courses/${params.course_id}/items/${params.item_id}/quiz/start`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
