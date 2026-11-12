import { NextResponse } from "next/server";
import { jadFetch, relayJson } from "@/lib/jadProxy";

type Params = { params: Promise<{ course_id: string; item_id: string }> };

/** Ask JAD AI. The answer streams back as Server-Sent Events, passed straight through. */
export async function POST(req: Request, props: Params) {
  const { course_id, item_id } = await props.params;
  try {
    const body = await req.text();
    const out = await jadFetch(`/courses/${course_id}/items/${item_id}/messages`, {
      method: "POST",
      body,
      signal: req.signal,
    });
    if ("unauthorized" in out) return out.unauthorized;
    const { res } = out;
    if (!res.ok || !res.body || !(res.headers.get("content-type") || "").includes("text/event-stream")) {
      return relayJson(res);
    }
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json({ message: "JAD AI couldn't be reached. Please try again." }, { status: 502 });
  }
}

/** Start a new chat on this lesson. */
export async function DELETE(_req: Request, props: Params) {
  const { course_id, item_id } = await props.params;
  try {
    const out = await jadFetch(`/courses/${course_id}/items/${item_id}/messages`, { method: "DELETE" });
    return "unauthorized" in out ? out.unauthorized : relayJson(out.res);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
