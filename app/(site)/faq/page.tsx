import JsonLd from "@/components/site/JsonLd";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/fetchApi";
import FAQ, { type FAQCategory } from "@/components/faq/FAQ";

const title = "Frequently asked questions | Social Work Consultancy Ltd";
const description =
  "Answers about courses, payments, certificates and your account on the Social Work Consultancy Ltd learning platform.";

export const metadata = pageMetadata({ title, description, path: "/faq", image: "mentorship" });

export default async function FAQPage() {
  const session = await auth();

  let categories: FAQCategory[] = [];
  let loadFailed = false;
  try {
    const res = await fetchApi("/support/faq", { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      categories = Array.isArray(json?.data) ? json.data : [];
    } else {
      loadFailed = true;
    }
  } catch {
    loadFailed = true;
  }

  // Only published answers, as structured data for search engines.
  const items = categories.flatMap((c) => c.items.filter((i) => i.is_published !== false));
  const nodes = [
    webPageNode({
      type: "FAQPage",
      path: "/faq",
      name: title,
      description,
      extra: items.length
        ? {
            mainEntity: items.map((i) => ({
              "@type": "Question",
              name: i.question,
              acceptedAnswer: { "@type": "Answer", text: i.answer },
            })),
          }
        : undefined,
    }),
    breadcrumbNode("/faq", [{ name: "FAQ", path: "/faq" }]),
  ];

  return (
    <>
      <JsonLd nodes={nodes} />
      <FAQ categories={categories} isAuthenticated={Boolean(session)} loadFailed={loadFailed} />
    </>
  );
}
