import type { Metadata } from "next";
import About from "@/components/about/About";
import { opening } from "@/components/about/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const title = "About Us";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Social Work Consultancy Ltd supports the people and organisations working to improve the lives of children, families and communities. Our vision, mission, how we work and the values that guide us.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about-us" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/about-us",
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

// Structured data: this page as an AboutPage about the organisation
// described on the home page, with its place in the site.
function structuredData() {
  const orgId = absoluteUrl("/#organization");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": absoluteUrl("/about-us#webpage"),
        url: absoluteUrl("/about-us"),
        name: fullTitle,
        description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": orgId },
        mainEntity: { "@id": orgId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluteUrl(opening.image),
          width: 1672,
          height: 941,
        },
        inLanguage: site.language,
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl("/about-us#breadcrumb"),
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: absoluteUrl("/about-us"),
          },
        ],
      },
    ],
  };
}

export default function AboutUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <About />
    </>
  );
}
