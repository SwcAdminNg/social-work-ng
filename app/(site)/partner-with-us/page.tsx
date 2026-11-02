import type { Metadata } from "next";
import Partner from "@/components/partner/Partner";
import { banner, ways } from "@/components/partner/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/partner-with-us";
const title = "Partner with Us";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Partner with Social Work Consultancy Ltd to strengthen social services: sponsor learning and access, commission a project, co-develop training and resources, or collaborate on research and advocacy.";

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

// Structured data: the page, the four partnership routes it offers, and
// its place in the site.
function structuredData() {
  const orgId = absoluteUrl("/#organization");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: fullTitle,
        description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": orgId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(banner.image),
          width: banner.imageWidth,
          height: banner.imageHeight,
        },
        inLanguage: site.language,
        mainEntity: {
          "@type": "ItemList",
          name: ways.title,
          itemListElement: ways.items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.title,
            description: item.statement,
            url: absoluteUrl(`${path}#way-${item.id}`),
          })),
        },
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

export default function PartnerWithUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <Partner />
    </>
  );
}
