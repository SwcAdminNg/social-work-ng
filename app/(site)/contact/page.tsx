import type { Metadata } from "next";
import ContactOpening from "@/components/contact/ContactOpening";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactMap } from "@/components/contact/ContactMap";
import { reach } from "@/components/contact/content";
import { absoluteUrl, shareImage, site } from "@/lib/site";

const path = "/contact";
const title = "Contact Us";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Get in touch with Social Work Consultancy Ltd in Jos, Plateau State, Nigeria: questions about courses, mentorship, partnerships or consultancy. Send a message or call us.";

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

// Structured data: this page as the organisation's contact page, with
// the ways to reach it, and its place in the site.
function structuredData() {
  const orgId = absoluteUrl("/#organization");
  const { details } = reach;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": absoluteUrl(`${path}#webpage`),
        url: absoluteUrl(path),
        name: fullTitle,
        description,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": orgId },
        mainEntity: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: details.phone.replace(/\s/g, ""),
          email: details.email,
          areaServed: "NG",
          availableLanguage: "en",
        },
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

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <ContactOpening />
      <ContactForm />
      <ContactMap />
    </>
  );
}
