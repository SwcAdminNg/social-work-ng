import type { Metadata } from "next";
import { PrivacyHero } from "@/components/privacy/PrivacyHero";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Social Work Nigeria",
  description: "Privacy Policy, Terms of Use, and Safeguarding Statement for Social Work Consultancy Ltd.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <PrivacyHero />
      <PrivacyContent />
    </div>
  );
}
