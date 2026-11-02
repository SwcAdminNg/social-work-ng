import type { Metadata } from "next";
import Home from "@/components/home/Home";
import { faqs, heroSlides, services } from "@/components/home/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const title = `${site.name} | Professional Learning, Research and Policy for Social Work`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title,
    description: site.description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: [shareImage],
  },
};

// Structured data: the organisation, this site, and the home page's
// questions and answers, so search engines can show them as rich results.
function structuredData() {
  const orgId = absoluteUrl("/#organization");
  const siteId = absoluteUrl("/#website");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.organisation,
        alternateName: [site.name, site.shortName],
        url: absoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/images/logo/swc-dark-logo-trim.png"),
          width: 1322,
          height: 386,
        },
        description: site.description,
        slogan: site.tagline,
        email: site.email,
        telephone: site.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
        areaServed: { "@type": "Country", name: "Nigeria" },
        knowsAbout: services.items.map((s) => s.title),
        ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: absoluteUrl("/"),
        name: site.name,
        description: site.description,
        publisher: { "@id": orgId },
        inLanguage: site.language,
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/#webpage"),
        url: absoluteUrl("/"),
        name: title,
        description: site.description,
        isPartOf: { "@id": siteId },
        about: { "@id": orgId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(heroSlides[0].image),
        },
        inLanguage: site.language,
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl("/#faq"),
        mainEntity: faqs.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a.join(" ") },
        })),
      },
    ],
  };
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data for search engines; escaped so "</script>" in
        // content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <Home />
    </>
  );
}
