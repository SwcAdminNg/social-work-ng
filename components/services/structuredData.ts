import { absoluteUrl, site } from "@/lib/site";
import type { ServicePageContent } from "./types";

// Structured data for a service page: the page, the service it describes
// (offered by the organisation on the home page) with its kinds of
// support, and the page's place in the site.
export function serviceStructuredData(
  content: ServicePageContent,
  {
    title,
    fullTitle,
    description,
    serviceType,
  }: {
    title: string;
    fullTitle: string;
    description: string;
    serviceType: string;
  },
) {
  const { path, opening, services } = content;
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
        serviceType,
        description,
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
