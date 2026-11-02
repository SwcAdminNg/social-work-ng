import type { Metadata } from "next";
import Careers from "@/components/careers/Careers";
import { areas, opening } from "@/components/careers/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/careers-and-volunteering";
const title = "Careers and Volunteering";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Build your career and contribute your skills with Social Work Consultancy Ltd: training and facilitation, research and policy, learning content development, communications and programme support, through employment, volunteering, internships or consultancy.";

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

// Structured data: the page, the areas of interest it lists (not job
// postings, since no vacancy is advertised), and its place in the site.
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
          url: absoluteUrl(opening.image),
          width: opening.imageWidth,
          height: opening.imageHeight,
        },
        inLanguage: site.language,
        mainEntity: {
          "@type": "ItemList",
          name: areas.title,
          itemListElement: areas.items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.title,
            description: item.statement,
            url: absoluteUrl(`${path}#area-${item.id}`),
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

export default function CareersAndVolunteeringPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <Careers />
    </>
  );
}
