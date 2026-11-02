// Site-wide facts used by metadata, structured data, robots and the sitemap.
// Keep contact details in step with components/home/content.ts and the
// footer; the handover asks for one approved contact set before publication.

export const site = {
  name: "Social Work Nigeria",
  organisation: "Social Work Consultancy Ltd",
  shortName: "SWCL",
  url: (
    process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org"
  ).replace(/\/$/, ""),
  locale: "en_NG",
  language: "en",
  description:
    "Training, research, policy and advocacy that strengthen social work practice in Nigeria. Social Work Consultancy Ltd supports practitioners and organisations working for children, families and communities.",
  tagline: "Strengthening Practice. Developing People. Improving Social Services.",
  email: "support@socialworknigeria.org",
  phone: "+234 806 404 7702",
  address: {
    street: "Flat C3, Okonkwo Estate",
    city: "Jos",
    region: "Plateau State",
    country: "NG",
  },
  // Social profiles can be added here once confirmed; each is emitted as
  // an Organization `sameAs` link.
  sameAs: [] as string[],
};

export const absoluteUrl = (path = "/") =>
  new URL(path, `${site.url}/`).toString();

// The social sharing image (app/opengraph-image.jpg), 1200 × 630.
export const shareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: `${site.name}: ${site.tagline}`,
};
