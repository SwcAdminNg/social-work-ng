import type { Metadata } from "next";
import PolicyAdvocacy from "@/components/policy/PolicyAdvocacy";
import { opening, services } from "@/components/policy/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/policy-and-advocacy";
const title = "Policy and Advocacy";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Social Work Consultancy Ltd supports organisations in developing, reviewing and communicating policies and advocacy priorities: policy review, evidence briefs, stakeholder consultation, advocacy planning and implementation support.";

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

// Structured data: the page, the service it describes (offered by the
// organisation on the home page) with the five kinds of support, and the
// page's place in the site.
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
        serviceType: "Policy development, review and advocacy consultancy",
        description: services.items[0].statement,
        provider: { "@id": orgId },
        areaServed: ["Nigeria", "Global South"],
        audience: {
          "@type": "Audience",
          audienceType:
            "NGOs, community organisations, institutions and social services",
        },
        url: absoluteUrl(path),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: services.title,
          itemListElement: services.items.map((item) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: item.title,
              description: item.statement,
              url: absoluteUrl(`${path}#${item.id}`),
            },
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

export default function PolicyAndAdvocacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <PolicyAdvocacy />
    </>
  );
}
