import { NextResponse } from "next/server";
import { auth } from "@/auth";

type SessionWithAccessToken = {
  accessToken?: string;
};

export async function GET(
  req: Request,
  props: { params: Promise<{ ticket_id: string }> },
) {
  const params = await props.params;
  try {
    const session = (await auth()) as SessionWithAccessToken | null;
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("page_size") || "50";
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/support/tickets/${params.ticket_id}/messages?page=${page}&page_size=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

export async function POST(
  req: Request,
  props: { params: Promise<{ ticket_id: string }> },
) {
  const params = await props.params;
  try {
    const session = (await auth()) as SessionWithAccessToken | null;
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/support/tickets/${params.ticket_id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
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
