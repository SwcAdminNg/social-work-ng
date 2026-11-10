import Home from "@/components/home/Home";
import JsonLd from "@/components/site/JsonLd";
import { organizationNode, pageMetadata, webPageNode, websiteNode } from "@/lib/site";

const title = "SWCL E-Learning | Social Work Consultancy Ltd";
const description =
  "Professional learning from Social Work Consultancy Ltd. Explore social work courses, mentorship and practice resources grounded in Nigerian contexts.";

export const metadata = pageMetadata({ title, description, path: "/", image: "home" });

export default function HomePage() {
  return (
    <>
      <JsonLd nodes={[organizationNode(), websiteNode(), webPageNode({ path: "/", name: title, description })]} />
      <Home />
    </>
  );
}
