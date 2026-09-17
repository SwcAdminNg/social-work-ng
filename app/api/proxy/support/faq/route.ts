import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const { searchParams } = new URL(req.url);
    const upstreamParams = new URLSearchParams();
    const audience = searchParams.get("audience");
    if (audience) {
      upstreamParams.set("audience", audience);
    }
    const query = upstreamParams.toString();

    const res = await fetch(
      `${baseUrl}/support/faq${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
