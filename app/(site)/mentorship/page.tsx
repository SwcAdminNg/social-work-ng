import JsonLd from "@/components/site/JsonLd";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";
import Mentorship from "@/components/mentorship/Mentorship";

const title = "Mentorship | Social Work Consultancy Ltd";
const description =
  "Practical mentorship for social work students, recent graduates and early-career practitioners in Nigeria and the Global South. Register your interest or enquire about becoming a mentor.";

export const metadata = pageMetadata({ title, description, path: "/mentorship", image: "mentorship" });

export default function MentorshipPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ type: "WebPage", path: "/mentorship", name: title, description }),
          breadcrumbNode("/mentorship", [{ name: "Mentorship", path: "/mentorship" }]),
        ]}
      />
      <Mentorship />
    </>
  );
}
