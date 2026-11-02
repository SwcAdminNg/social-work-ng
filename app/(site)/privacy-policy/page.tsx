import type { Metadata } from "next";
import PageOpening from "@/components/shared/PageOpening";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/privacy-policy";
const title = "Privacy Policy";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Privacy Policy, Terms of Use and Safeguarding Statement for Social Work Consultancy Ltd: how we collect, use and protect your information.";
const updated = "9 July 2026";

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

function structuredData() {
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
        about: { "@id": absoluteUrl("/#organization") },
        dateModified: "2026-07-09",
        inLanguage: site.language,
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <PageOpening
        id="privacy-heading"
        eyebrow="Legal"
        title="Privacy Policy"
        tagline="How we collect, use and protect your information, the terms of using our platform, and our safeguarding commitments."
      >
        <span className="inline-flex items-center rounded-full bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 px-4 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#14402F] dark:text-[#C3D1C8]">
          Last updated {updated}
        </span>
      </PageOpening>
      <PrivacyContent />
    </>
  );
}
