import { NextResponse } from "next/server";
import { auth } from "@/auth";

type SessionWithAccessToken = {
  accessToken?: string;
};

async function proxyBookmark(
  method: "POST" | "DELETE",
  courseId: string,
) {
  const session = (await auth()) as SessionWithAccessToken | null;
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";

  const res = await fetch(`${baseUrl}/courses/${courseId}/bookmark`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  req: Request,
  props: { params: Promise<{ course_id: string }> },
) {
  const params = await props.params;

  try {
    return proxyBookmark("POST", params.course_id);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ course_id: string }> },
) {
  const params = await props.params;

  try {
    return proxyBookmark("DELETE", params.course_id);
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
