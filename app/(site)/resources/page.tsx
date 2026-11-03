import { ResourcesHero } from "@/components/resources/ResourcesHero";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { getResources } from "@/lib/resources";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Resources | Social Work Nigeria",
  description: "Access essential toolkits, guidelines, and practice materials designed to support social workers.",
};

export default async function ResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;
  const category = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;
  const courseId = searchParams.course_id as string | undefined;

  const { items, meta, ok } = await getResources({
    page,
    pageSize: 12,
    category,
    courseId,
    search,
  });
  const hasNextPage = Boolean(meta.has_next ?? items.length === 12);

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", targetPage.toString());
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (courseId) params.set("course_id", courseId);
    return `/resources?${params.toString()}`;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-950 flex flex-col">
      <ResourcesHero />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 md:py-24 lg:px-8 xl:px-12">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Resource Library
            </h2>
            <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600 dark:text-slate-300">
              Browse practical references, templates, recordings, research, and links. Locked resources stay visible so you can see what an account or course enrollment unlocks.
            </p>
          </div>
          {meta.total_items !== undefined && (
            <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {meta.total_items} {meta.total_items === 1 ? "resource" : "resources"}
            </p>
          )}
        </div>

        <ResourceFilters />

        {!ok ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-sm font-extrabold text-amber-900 dark:text-amber-100">
              The resource library could not be loaded right now.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-lg font-extrabold text-slate-700 dark:text-slate-200">
              No resources found.
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Try another category or search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            <div className="mt-14 flex items-center justify-center gap-4">
              {page > 1 ? (
                <Link
                  href={buildPageUrl(page - 1)}
                  scroll={false}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 text-sm font-extrabold text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-600">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}

              <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
                Page {page}
              </span>

              {hasNextPage ? (
                <Link
                  href={buildPageUrl(page + 1)}
                  scroll={false}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-md border border-slate-100 bg-slate-50 px-4 text-sm font-extrabold text-slate-400 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-600">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
