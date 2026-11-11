import { fetchApi } from "@/lib/fetchApi";
import CommunityChat, { type Community } from "./CommunityChat";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default async function CommunityContainer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const selectedCommunityId =
    typeof resolvedParams.community === "string"
      ? resolvedParams.community
      : typeof resolvedParams.community_id === "string"
        ? resolvedParams.community_id
      : undefined;
  const resourceReferenceId =
    typeof resolvedParams.resource_reference_id === "string"
      ? resolvedParams.resource_reference_id
      : undefined;
  const resourceName =
    typeof resolvedParams.resource_name === "string"
      ? resolvedParams.resource_name
      : undefined;
  const resourceSlug =
    typeof resolvedParams.resource_slug === "string"
      ? resolvedParams.resource_slug
      : undefined;

  let communities: Community[] = [];
  let error: string | null = null;

  try {
    const res = await fetchApi("/community", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load your communities.");
    }

    const json = await res.json().catch(() => ({}));
    communities = Array.isArray(json?.data) ? json.data : [];
  } catch (err: unknown) {
    error = getErrorMessage(
      err,
      "An error occurred while loading Community.",
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col gap-5">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Community</h1>
        <p className="m-0 mt-2 max-w-2xl text-[0.98rem] text-ink-2">
          Talk with your course rooms, ask questions and share useful resources.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          {error}
        </div>
      ) : (
        <CommunityChat
          initialCommunities={communities}
          selectedCommunityId={selectedCommunityId}
          initialResourceShare={
            resourceReferenceId
              ? {
                  id: resourceReferenceId,
                  name: resourceName || "Shared resource",
                  slug: resourceSlug,
                }
              : null
          }
        />
      )}
    </div>
  );
}
