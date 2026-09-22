import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowLeft, Video } from "lucide-react";

export const metadata = {
  title: "Join Live Session | Social Work Nigeria",
};

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type GuestJoinPayload = {
  data?: {
    join_url?: string | null;
  } | null;
  join_url?: string | null;
  url?: string | null;
  message?: string | null;
};

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "";
}

async function getGuestJoinUrl(token: string) {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return {
      error: "The live session service is not configured.",
    };
  }

  const endpoint = new URL("/live-session/guest-join", baseUrl);
  endpoint.searchParams.set("token", token);

  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.redirected && res.url && res.url !== endpoint.toString()) {
      return { joinUrl: res.url };
    }

    const json = (await res.json().catch(() => ({}))) as GuestJoinPayload;
    const joinUrl = json.data?.join_url || json.join_url || json.url;

    if (!res.ok) {
      return {
        error: json.message || "This live session link is not available right now.",
      };
    }

    if (!joinUrl) {
      return {
        error: "The live session join link was not returned.",
      };
    }

    return { joinUrl };
  } catch {
    return {
      error: "We could not reach the live session service.",
    };
  }
}

export default async function GuestLiveSessionJoinPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const token = singleParam(params.token)?.trim();

  if (!token) {
    return <GuestJoinError message="This live session link is missing its token." />;
  }

  const result = await getGuestJoinUrl(token);

  if (result.joinUrl) {
    redirect(result.joinUrl);
  }

  return <GuestJoinError message={result.error || "This live session link is unavailable."} />;
}

function GuestJoinError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-[#f7fcf9] px-4 py-12 dark:bg-[#0b1220]">
      <div className="w-full max-w-md rounded-lg border border-[#dceee4] bg-white p-6 text-center shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200">
          <AlertCircle className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-extrabold text-slate-950 dark:text-white">
          Live session unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {message}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/live-sessions"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white no-underline transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
          >
            <Video className="mr-2 h-4 w-4" />
            View live sessions
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#b7e4c7] px-4 text-sm font-extrabold text-[#2D6A4F] no-underline transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
