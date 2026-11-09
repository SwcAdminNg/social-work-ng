import type { Metadata } from "next";
import { TermsHero } from "@/components/terms/TermsHero";
import { TermsContent } from "@/components/terms/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service | Social Work Nigeria",
  description: "Terms of Service for the Social Work Consultancy Ltd (SWCL) LMS platform.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <div>
      <TermsHero />
      <TermsContent />
    </div>
  );
}
