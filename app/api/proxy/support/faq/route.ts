import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const { searchParams } = new URL(req.url);
    const upstreamParams = new URLSearchParams();
    const audience = searchParams.get("audience");
    if (audience) {
      upstreamParams.set("audience", audience);
    }
    const query = upstreamParams.toString();

    const headers = new Headers({ "Content-Type": "application/json" });
    const accessToken = (session as { accessToken?: unknown } | null)?.accessToken;
    if (typeof accessToken === "string" && accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const res = await fetch(
      `${baseUrl}/support/faq${query ? `?${query}` : ""}`,
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
