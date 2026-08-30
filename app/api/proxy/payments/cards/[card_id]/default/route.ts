import { NextResponse } from "next/server";
import { auth } from "@/auth";

type SessionWithAccessToken = {
  accessToken?: string;
};

export async function POST(
  req: Request,
  props: { params: Promise<{ card_id: string }> },
) {
  const params = await props.params;

  try {
    const session = (await auth()) as SessionWithAccessToken | null;
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

    const res = await fetch(
      `${baseUrl}/payments/cards/${params.card_id}/default`,
      {
        method: "POST",
        headers: {
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
