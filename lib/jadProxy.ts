import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Calls the API's JAD AI routes as the signed-in learner. */
export async function jadFetch(path: string, init: RequestInit = {}) {
  const session = await auth();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  if (!accessToken) {
    return { unauthorized: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) } as const;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
  const res = await fetch(`${baseUrl}/jad-ai${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...init.headers },
  });
  return { res } as const;
}

/** Relays a JSON reply with its status. */
export async function relayJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
