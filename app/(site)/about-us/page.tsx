import JsonLd from "@/components/site/JsonLd";
import { breadcrumbNode, pageMetadata, webPageNode } from "@/lib/site";
import About from "@/components/about/About";

const title = "About Us | Social Work Consultancy Ltd";
const description =
  "Social Work Consultancy Ltd supports ethical, skilled and culturally relevant social work practice in Nigeria and across the Global South through courses, mentorship and resources.";

export const metadata = pageMetadata({ title, description, path: "/about-us", image: "about" });

export default function AboutUsPage() {
  return (
    <>
      <JsonLd
        nodes={[
          webPageNode({ type: "AboutPage", path: "/about-us", name: title, description }),
          breadcrumbNode("/about-us", [{ name: "About Us", path: "/about-us" }]),
        ]}
      />
      <About />
    </>
  );
}
