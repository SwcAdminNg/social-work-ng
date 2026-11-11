import type { Metadata } from "next";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/fetchApi";
import FAQ, { type FAQCategory } from "@/components/faq/FAQ";

const title = "Frequently asked questions | Social Work Consultancy Ltd";
const description =
  "Answers about courses, payments, certificates and your account on the Social Work Consultancy Ltd learning platform.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", url: "/faq", title, description, images: ["/images/contact/support-professional.webp"] },
};

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
  const jsonLd = items.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((i) => ({
          "@type": "Question",
          name: i.question,
          acceptedAnswer: { "@type": "Answer", text: i.answer },
        })),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <FAQ categories={categories} isAuthenticated={Boolean(session)} loadFailed={loadFailed} />
    </>
  );
}
