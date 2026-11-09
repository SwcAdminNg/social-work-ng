import type { Metadata } from "next";
import About from "@/components/about/About";

const title = "About Us | Social Work Consultancy Ltd";
const description =
  "Social Work Consultancy Ltd supports ethical, skilled and culturally relevant social work practice in Nigeria and across the Global South through courses, mentorship and resources.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about-us" },
  openGraph: {
    type: "website",
    url: "/about-us",
    title,
    description,
    images: ["/images/ng/team-meeting.webp"],
  },
};

export default function AboutUsPage() {
  return <About />;
}
