import type { Metadata } from "next";

/**
 * Facts about the site, and helpers that give every public page the same
 * search and sharing set-up: canonical address, Open Graph and X cards, and
 * linked structured data.
 */

export const site = {
  name: "Social Work Nigeria",
  legalName: "Social Work Consultancy Ltd",
  /** Public address of the site. Set NEXT_PUBLIC_BASE_URL in production. */
  url: (process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org").replace(/\/+$/, ""),
  description:
    "Practical learning for social work in Nigeria and beyond: courses, mentorship and practice resources from Social Work Consultancy Ltd.",
  email: "support@socialworknigeria.org",
  phone: "+2348034471063",
  locale: "en_NG",
  address: {
    streetAddress: "Flat C3, Okonkwo Estate",
    addressLocality: "Jos",
    addressRegion: "Plateau State",
    addressCountry: "NG",
  },
  /** Social profiles, once they are confirmed. */
  sameAs: [] as string[],
  parentSite: "https://socialwork-consultancy.com",
} as const;

export const absoluteUrl = (path = "/") => `${site.url}${path === "/" ? "" : path}`;

/** Share pictures, 1200 × 630, one per section of the site. */
export const shareImages = {
  home: "/images/share/home.jpg",
  about: "/images/share/about.jpg",
  courses: "/images/share/courses.jpg",
  mentorship: "/images/share/mentorship.jpg",
  resources: "/images/share/resources.jpg",
  contact: "/images/share/contact.jpg",
} as const;

export type ShareImage = keyof typeof shareImages;

const shareImage = (key: ShareImage | string) =>
  key in shareImages
    ? { url: shareImages[key as ShareImage], width: 1200, height: 630, alt: `${site.name}: ${site.description}` }
    : { url: key, alt: site.name };

/** Metadata for a public page. `title` is used as written, without a suffix added. */
export function pageMetadata({
  title,
  description,
  path,
  image = "home",
  index = true,
}: {
  title: string;
  description: string;
  /** The page's own address, starting with a slash. */
  path: string;
  /** A key of `shareImages`, or the address of another picture. */
  image?: ShareImage | string;
  /** False keeps the page out of search results. */
  index?: boolean;
}): Metadata {
  const picture = shareImage(image);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: site.locale,
      url: path,
      title,
      description,
      images: [picture],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [picture.url],
    },
  };
}

/* ── Structured data ── */

type Node = Record<string, unknown>;

export const organizationId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;

/** The organisation behind the site. Declared in full on the home page and referenced elsewhere. */
export function organizationNode(): Node {
  return {
    "@type": "EducationalOrganization",
    "@id": organizationId,
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    logo: absoluteUrl("/images/logo/swc-dark-logo.png"),
    description: site.description,
    email: site.email,
    telephone: site.phone,
    address: { "@type": "PostalAddress", ...site.address },
    areaServed: { "@type": "Country", name: "Nigeria" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.email,
      telephone: site.phone,
      areaServed: "NG",
      availableLanguage: "en",
    },
    ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
  };
}

export function websiteNode(): Node {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: "en-NG",
    publisher: { "@id": organizationId },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/courses?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function webPageNode({
  type = "WebPage",
  path,
  name,
  description,
  extra,
}: {
  type?: string;
  path: string;
  name: string;
  description: string;
  extra?: Node;
}): Node {
  const url = absoluteUrl(path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en-NG",
    isPartOf: { "@id": websiteId },
    about: { "@id": organizationId },
    ...(path === "/" ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
    ...extra,
  };
}

/** The trail from Home to this page. The last item is the page itself. */
export function breadcrumbNode(path: string, trail: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serialises a graph for a JSON-LD script tag, safely. */
export function jsonLd(nodes: Node[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
