import { Metadata } from "next";
import { FAQHero } from "@/components/faq/FAQHero";
import { FAQContent } from "@/components/faq/FAQContent";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Social Work Nigeria",
  description: "Find answers to common questions about our courses, mentorship, and certification.",
};

export default function FAQPage() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <FAQHero />
      <FAQContent />
    </main>
  );
}
