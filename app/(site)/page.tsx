import type { Metadata } from "next";
import Home from "@/components/home/Home";

const description =
  "Professional learning from Social Work Consultancy Ltd. Explore social work courses, mentorship and practice resources grounded in Nigerian contexts.";

export const metadata: Metadata = {
  title: "SWCL E-Learning | Social Work Consultancy Ltd",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "SWCL E-Learning | Social Work Consultancy Ltd",
    description,
    images: ["/images/home/elearning/hero-learners.webp"],
  },
};

export default function HomePage() {
  return <Home />;
}
