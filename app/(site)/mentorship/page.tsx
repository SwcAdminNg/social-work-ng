import type { Metadata } from "next";
import Mentorship from "@/components/mentorship/Mentorship";
import { offerings, opening } from "@/components/mentorship/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/mentorship";
const title = "Mentorship Programme";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Mentorship for social work students, graduates and early-career professionals in Nigeria and across Africa: one-to-one support, placement and academic guidance, international opportunities advice, networking and career coaching.";

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

// Structured data: the page, the mentorship service with what it offers,
// and its place in the site.
function structuredData() {
  const orgId = absoluteUrl("/#organization");
  const serviceId = absoluteUrl(`${path}#service`);
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
        mainEntity: { "@id": serviceId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(opening.image),
          width: opening.imageWidth,
          height: opening.imageHeight,
        },
        inLanguage: site.language,
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: title,
        serviceType: "Professional mentorship",
        description,
        provider: { "@id": orgId },
        areaServed: ["Nigeria", "Africa"],
        url: absoluteUrl(path),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: offerings.title,
          itemListElement: offerings.items.map((item) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: item.title, description: item.text },
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

export default function MentorshipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <Mentorship />
    </>
  );
}
