import JsonLd from "@/components/site/JsonLd";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";
import Contact from "@/components/contact/Contact";

const title = "Contact Us | Social Work Consultancy Ltd";
const description =
  "Ask Social Work Consultancy Ltd about courses, mentorship, learning support or partnerships. Send a message and we will reply by email.";

export const metadata = pageMetadata({ title, description, path: "/contact", image: "contact" });

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ?topic=mentorship (or course, account, partnership, other) pre-selects the enquiry type.
  const { topic } = await searchParams;
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ type: "ContactPage", path: "/contact", name: title, description }),
          breadcrumbNode("/contact", [{ name: "Contact Us", path: "/contact" }]),
        ]}
      />
      <Contact initialTopic={typeof topic === "string" ? topic : undefined} />
    </>
  );
}
