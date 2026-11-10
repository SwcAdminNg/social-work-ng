import { jsonLd } from "@/lib/site";

/** Structured data for search engines: a graph of schema.org nodes. */
export default function JsonLd({ nodes }: { nodes: Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(nodes) }} />;
}
