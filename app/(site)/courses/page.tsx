import JsonLd from "@/components/site/JsonLd";
import { absoluteUrl, breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";
import { auth } from "@/auth";
import { fetchApi, publicFetchApi } from "@/lib/fetchApi";
import CourseCatalogue, { type CatalogueQuery } from "@/components/courses/catalogue/CourseCatalogue";
import { COSTS, LEVELS, type CatalogueCourse, type CourseCatalog } from "@/components/courses/catalogue/courseFormat";

const title = "Courses | Social Work Consultancy Ltd";
const description =
  "Practical social work courses from Social Work Consultancy Ltd for students, practitioners and those supporting children, families and communities in Nigeria and the Global South.";

export const metadata = pageMetadata({ title, description, path: "/courses", image: "courses" });

const PAGE_SIZE = 12;

type EnrolledCourse = { id?: string; course?: { id?: string } };

const pick = (value: string | string[] | undefined) => (typeof value === "string" ? value.trim() : "");

function listFrom<T>(json: unknown): T[] {
  const payload = json as { data?: T[] | { items?: T[]; courses?: T[] }; items?: T[] } | null;
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (payload.data && Array.isArray(payload.data.courses)) return payload.data.courses;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

export default async function CoursesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const pageNumber = Number.parseInt(pick(params.page), 10);
  const level = pick(params.level);
  const cost = pick(params.cost);
  // `catalog` is the old name for the topic filter; keep old links working.
  const topic = pick(params.topic) || pick(params.catalog);

  const query: CatalogueQuery = {
    search: pick(params.search).slice(0, 120),
    topic: /^[a-z0-9-]{1,120}$/i.test(topic) ? topic : "",
    level: LEVELS.some((l) => l.value === level) ? level : "",
    cost: COSTS.some((c) => c.value === cost) ? cost : "",
    page: Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1,
  };

  const api = new URLSearchParams({ page: String(query.page), page_size: String(PAGE_SIZE) });
  if (query.search) api.set("search", query.search);
  if (query.topic) api.set("catalog", query.topic);
  if (query.level) api.set("level", query.level);
  if (query.cost) api.set("is_free", query.cost);
  const url = `/courses?${api.toString()}`;

  const session = await auth();
  const signedIn = Boolean((session as { accessToken?: string } | null)?.accessToken);

  const [firstRes, catalogsRes, enrolledRes] = await Promise.all([
    fetchApi(url, { next: { revalidate: 60 } }).catch(() => null),
    publicFetchApi("/courses/catalogs", { next: { revalidate: 600 } }).catch(() => null),
    signedIn ? fetchApi("/learning/courses", { cache: "no-store" }).catch(() => null) : Promise.resolve(null),
  ]);
  // An expired session can make the signed-in request fail; fall back to the public list.
  const res = firstRes?.ok ? firstRes : await publicFetchApi(url, { next: { revalidate: 60 } }).catch(() => null);
  const json = res?.ok ? await res.json().catch(() => null) : null;
  const courses = listFrom<CatalogueCourse>(json);
  const meta = (json?.meta ?? json?.data?.meta ?? {}) as { total_items?: number; total_pages?: number };
  const total = meta.total_items ?? courses.length;
  const totalPages = meta.total_pages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Only offer topics that contain published courses.
  const catalogs = catalogsRes?.ok ? listFrom<CourseCatalog>(await catalogsRes.json().catch(() => null)) : [];
  const topics = catalogs.filter((c) => c.total_courses === undefined || c.total_courses > 0 || c.slug === query.topic);

  const enrolledIds: string[] = [];
  if (enrolledRes?.ok) {
    for (const c of listFrom<EnrolledCourse>(await enrolledRes.json().catch(() => null))) {
      if (c.id) enrolledIds.push(c.id);
      if (c.course?.id) enrolledIds.push(c.course.id);
    }
  }

  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({
            type: "CollectionPage",
            path: "/courses",
            name: title,
            description,
            extra: courses.length
              ? {
                  mainEntity: {
                    "@type": "ItemList",
                    numberOfItems: total,
                    itemListElement: courses.map((course, index) => ({
                      "@type": "ListItem",
                      position: index + 1,
                      name: course.title,
                      url: absoluteUrl("/courses/" + (course.slug || course.id)),
                    })),
                  },
                }
              : undefined,
          }),
          breadcrumbNode("/courses", [{ name: "Courses", path: "/courses" }]),
        ]}
      />
      <CourseCatalogue
        query={query}
        courses={courses}
        ok={Boolean(res?.ok)}
        total={total}
        totalPages={totalPages}
        topics={topics}
        enrolledIds={enrolledIds}
      />
    </>
  );
}
