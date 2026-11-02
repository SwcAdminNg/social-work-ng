import type { Metadata } from "next";
import Elearning from "@/components/elearning/Elearning";
import { audiences, expect, opening } from "@/components/elearning/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/e-learning";
const title = "E-Learning and Professional Development";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Professional learning from Social Work Consultancy Ltd on socialworknigeria.org: practice-focused, context-aware courses for students, practising social workers, educators, caregivers, NGOs and service providers across Nigeria and the wider Global South.";

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

// Structured data: the page, the learning service it describes (offered
// by the organisation on the home page) with its audiences, and the
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
        serviceType: "Professional learning and continuing professional development",
        description,
        provider: { "@id": orgId },
        areaServed: ["Nigeria", "Global South"],
        audience: audiences.items.map((a) => ({
          "@type": "Audience",
          audienceType: a.title,
        })),
        url: absoluteUrl(path),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: expect.title,
          itemListElement: expect.items.map((item) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: item.title,
              description: item.paragraphs[0],
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

export default function ElearningPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <Elearning />
    </>
  );
}
