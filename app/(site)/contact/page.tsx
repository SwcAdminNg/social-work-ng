import type { Metadata } from "next";
import Contact from "@/components/contact/Contact";

const title = "Contact Us | Social Work Consultancy Ltd";
const description =
  "Ask Social Work Consultancy Ltd about courses, mentorship, learning support or partnerships. Send a message and we will reply by email.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title,
    description,
    images: ["/images/ng/man-laugh.webp"],
  },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ?topic=mentorship (or course, account, partnership, other) pre-selects the enquiry type.
  const { topic } = await searchParams;
  return <Contact initialTopic={typeof topic === "string" ? topic : undefined} />;
}
