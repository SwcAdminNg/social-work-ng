import { NextResponse } from "next/server";
import { jadFetch, relayJson } from "@/lib/jadProxy";

/** JAD AI on a lesson: availability, starter questions and the chat so far. */
export async function GET(_req: Request, props: { params: Promise<{ course_id: string; item_id: string }> }) {
  const { course_id, item_id } = await props.params;
  try {
    const out = await jadFetch(`/courses/${course_id}/items/${item_id}`);
    return "unauthorized" in out ? out.unauthorized : relayJson(out.res);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
