import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Saves a started quiz's answers so the learner can come back to them later. */
export async function POST(
  req: Request,
  props: { params: Promise<{ course_id: string; item_id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth();
    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const res = await fetch(
      `${baseUrl}/learning/courses/${params.course_id}/items/${params.item_id}/quiz/progress`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
