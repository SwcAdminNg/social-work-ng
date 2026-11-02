import type { Metadata } from "next";
import { Suspense } from "react";
import PageOpening from "@/components/shared/PageOpening";
import Pager from "@/components/shared/Pager";
import SectionHeading from "@/components/home/SectionHeading";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceFilters } from "@/components/resources/ResourceFilters";
import { getResources } from "@/lib/resources";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/resources";
const title = "Resources";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Toolkits, guidelines, templates, recordings, research and links to support social workers and related professionals across Nigeria and the wider Global South.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: path,
    title: fullTitle,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description,
    images: [shareImage],
  },
};

const PAGE_SIZE = 12;

function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: fullTitle,
        description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        inLanguage: site.language,
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`${path}#breadcrumb`),
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: title, item: absoluteUrl(path) },
        ],
      },
    ],
  };
}

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
    pageSize: PAGE_SIZE,
    category,
    courseId,
    search,
  });
  const hasNextPage = Boolean(meta.has_next ?? items.length === PAGE_SIZE);

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", targetPage.toString());
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (courseId) params.set("course_id", courseId);
    return `${path}?${params.toString()}`;
  };

  const count =
    meta.total_items !== undefined
      ? `${meta.total_items} ${meta.total_items === 1 ? "resource" : "resources"}`
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />

      <PageOpening
        id="resources-heading"
        eyebrow="Resources"
        title="Knowledge Hub"
        tagline="Access essential toolkits, guidelines, and practice materials designed to support social workers across the Global South."
      />

      <section
        id="library"
        aria-labelledby="library-heading"
        className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <SectionHeading id="library-heading" eyebrow="The library" title="Resource Library">
                <p>
                  Browse practical references, templates, recordings, research, and links.
                  Locked resources stay visible so you can see what an account or course
                  enrolment unlocks.
                </p>
              </SectionHeading>
            </div>
            {count && (
              <p className="lg:col-span-5 lg:text-right text-[0.78rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9]">
                {count}
              </p>
            )}
          </div>

          <div className="mt-12 md:mt-14">
            <Suspense fallback={null}>
              <ResourceFilters />
            </Suspense>
          </div>

          <div className="mt-10">
            {!ok ? (
              <Notice
                title="The resource library could not be loaded right now."
                text="Please try again in a moment."
              />
            ) : items.length === 0 ? (
              <Notice title="No resources found." text="Try another category or search term." />
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((resource) => (
                    <li key={resource.id} className="flex">
                      <ResourceCard resource={resource} />
                    </li>
                  ))}
                </ul>
                <Pager page={page} hasNext={hasNextPage} hrefFor={hrefFor} scroll={false} />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// An empty or failed state on a mint tile.
function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 px-8 py-14 text-center">
      <p className="text-[1.1rem] font-bold text-gray-900 dark:text-[#ECF2EE]">{title}</p>
      <p className="mt-2 t-body text-gray-600 dark:text-[#A3B3A9]">{text}</p>
    </div>
  );
}
