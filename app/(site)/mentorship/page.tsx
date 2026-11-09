import type { Metadata } from "next";
import Mentorship from "@/components/mentorship/Mentorship";

const title = "Mentorship | Social Work Consultancy Ltd";
const description =
  "Practical mentorship for social work students, recent graduates and early-career practitioners in Nigeria and the Global South. Register your interest or enquire about becoming a mentor.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentorship" },
  openGraph: {
    type: "website",
    url: "/mentorship",
    title,
    description,
    images: ["/images/ng/learning-together.webp"],
  },
};

export default function MentorshipPage() {
  return <Mentorship />;
}
