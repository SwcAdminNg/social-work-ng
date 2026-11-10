import JsonLd from "@/components/site/JsonLd";
import { TermsHero } from "@/components/terms/TermsHero";
import { TermsContent } from "@/components/terms/TermsContent";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";

const title = "Terms of Service | Social Work Nigeria";
const description = "Terms of Service for the Social Work Consultancy Ltd (SWCL) LMS platform.";

export const metadata = pageMetadata({ title, description, path: "/terms-of-service" });

export default function TermsofServicePage() {
  return (
    <div>
      <JsonLd
        nodes={[
          webPageNode({ path: "/terms-of-service", name: title, description }),
          breadcrumbNode("/terms-of-service", [{ name: "Terms of Service", path: "/terms-of-service" }]),
        ]}
      />
      <TermsHero />
      <TermsContent />
    </div>
  );
}
