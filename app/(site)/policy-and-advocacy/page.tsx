import type { Metadata } from "next";
import {
  FileText,
  Megaphone,
  MessagesSquare,
  Presentation,
  ScrollText,
} from "lucide-react";
import ServicePage from "@/components/services/ServicePage";
import { serviceStructuredData } from "@/components/services/structuredData";
import { policy } from "@/components/policy/content";
import { shareImage, site } from "@/lib/site";

const { path } = policy;
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

// One icon per kind of support, in the handover's order.
const icons = [FileText, ScrollText, MessagesSquare, Megaphone, Presentation];

export default function PolicyAndAdvocacyPage() {
  const data = serviceStructuredData(policy, {
    title,
    fullTitle,
    description,
    serviceType: "Policy development, review and advocacy consultancy",
  });
  return (
    <>
      <script
        type="application/ld+json"
        // Escaped so "</script>" in content can never close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
      <ServicePage content={policy} icons={icons} />
    </>
  );
}
