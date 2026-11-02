import type { Metadata } from "next";
import {
  ChartColumn,
  ClipboardList,
  DraftingCompass,
  MapPinned,
  SearchCheck,
} from "lucide-react";
import ServicePage from "@/components/services/ServicePage";
import { serviceStructuredData } from "@/components/services/structuredData";
import { research } from "@/components/research/content";
import { shareImage, site } from "@/lib/site";

const { path } = research;
const title = "Research and Evaluation";
const fullTitle = `${title} | ${site.name}`;
const description =
  "Social Work Consultancy Ltd supports research and evaluation that link evidence to practical decisions: needs assessments, programme evaluation, qualitative and quantitative studies, evidence reviews and feasibility studies.";

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
const icons = [MapPinned, ClipboardList, ChartColumn, SearchCheck, DraftingCompass];

export default function ResearchAndEvaluationPage() {
  const data = serviceStructuredData(research, {
    title,
    fullTitle,
    description,
    serviceType: "Research and evaluation consultancy",
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
      <ServicePage content={research} icons={icons} />
    </>
  );
}
