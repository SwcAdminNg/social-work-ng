import { NextResponse } from "next/server";
import { jadFetch, relayJson } from "@/lib/jadProxy";

/** Rate a JAD AI answer. */
export async function POST(req: Request, props: { params: Promise<{ message_id: string }> }) {
  const { message_id } = await props.params;
  try {
    const out = await jadFetch(`/messages/${message_id}/feedback`, { method: "POST", body: await req.text() });
    return "unauthorized" in out ? out.unauthorized : relayJson(out.res);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
