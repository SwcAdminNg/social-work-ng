import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** The signed-in learner's own review of a course, or `{ data: null }` when they have not written one. */
export async function GET(_req: Request, props: { params: Promise<{ course_id: string }> }) {
  const params = await props.params;
  try {
    const session = (await auth()) as { accessToken?: string } | null;
    if (!session?.accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const res = await fetch(`${baseUrl}/courses/${params.course_id}/reviews/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    // "No review yet" is an ordinary answer, not an error.
    if (res.status === 404) return NextResponse.json({ data: null });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
