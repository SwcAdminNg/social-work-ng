import type { Metadata } from "next";
import ResourcesLibrary, { type LibraryQuery } from "@/components/resources/library/ResourcesLibrary";
import {
  RESOURCE_ACCESS_OPTIONS,
  RESOURCE_CATEGORIES,
  getResourceCategoryCounts,
  getResources,
} from "@/lib/resources";

const title = "Resources | Social Work Consultancy Ltd";
const description =
  "Practice tools, guidance, videos and reading from Social Work Consultancy Ltd to support reflection and professional development in Nigeria and the Global South.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/resources" },
  openGraph: {
    type: "website",
    url: "/resources",
    title,
    description,
    images: ["/images/ng/reading-tea.webp"],
  },
};

const PAGE_SIZE = 12;

const pick = (value: string | string[] | undefined) => (typeof value === "string" ? value.trim() : "");

export default async function ResourcesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const category = pick(params.category);
  const access = pick(params.access);
  const pageNumber = Number.parseInt(pick(params.page), 10);

  const query: LibraryQuery = {
    search: pick(params.search).slice(0, 120),
    // Ignore unknown values rather than sending them to the API.
    category: (RESOURCE_CATEGORIES as readonly string[]).includes(category) ? category : "",
    access: RESOURCE_ACCESS_OPTIONS.some((o) => o.value === access) ? access : "",
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  };

  const [result, counts] = await Promise.all([
    getResources({
      page: query.page,
      pageSize: PAGE_SIZE,
      category: query.category || undefined,
      search: query.search || undefined,
      visibility: query.access || undefined,
    }),
    getResourceCategoryCounts(),
  ]);

  return <ResourcesLibrary query={query} result={result} counts={counts} pageSize={PAGE_SIZE} />;
}
