import JsonLd from "@/components/site/JsonLd";
import { PrivacyHero } from "@/components/privacy/PrivacyHero";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";

const title = "Privacy Policy | Social Work Nigeria";
const description = "Privacy Policy, Terms of Use, and Safeguarding Statement for Social Work Consultancy Ltd.";

export const metadata = pageMetadata({ title, description, path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return (
    <div>
      <JsonLd
        nodes={[
          webPageNode({ path: "/privacy-policy", name: title, description }),
          breadcrumbNode("/privacy-policy", [{ name: "Privacy Policy", path: "/privacy-policy" }]),
        ]}
      />
      <PrivacyHero />
      <PrivacyContent />
    </div>
  );
}
