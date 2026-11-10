import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Unread and open counts for the dashboard header, sidebar and tab bar. */
export async function GET() {
  try {
    const session = await auth();
    const accessToken = (session as { accessToken?: unknown } | null)?.accessToken;
    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
    const res = await fetch(`${baseUrl}/users/me/dashboard/counts`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
