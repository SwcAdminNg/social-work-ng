import { HeartHandshake, Mail, ScrollText, ShieldCheck } from "lucide-react";
import LegalDocument, { Point, type LegalSection } from "@/components/legal/LegalDocument";

const supportEmail = "support@socialworknigeria.org";

const sections: LegalSection[] = [
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: ShieldCheck,
    children: (
      <>
        <p>
          We respect your privacy and are committed to protecting your data. This Privacy
          Policy outlines how we collect, use, disclose, and safeguard your information when
          you visit our website or utilise our services.
        </p>
        <p>
          We may collect personal information, such as your name, email address, telephone
          number, and course preferences, to provide services and communicate with you.
        </p>
        <p>
          We do not sell your data. Your information is shared solely with third parties
          essential for course delivery and certification, such as CPD accreditation
          platforms.
        </p>
        <p>By using our platform, you agree to the terms outlined in this Privacy Policy.</p>
      </>
    ),
  },
  {
    id: "terms",
    title: "Terms of Use",
    icon: ScrollText,
    children: (
      <>
        <p>
          By accessing our website and e-learning platform, you agree to comply with the
          following terms of use:
        </p>
        <ul className="space-y-3">
          <Point>Use the platform solely for lawful, educational purposes.</Point>
          <Point>Do not distribute course content without written permission.</Point>
          <Point>Respect your fellow learners and contribute positively to forums.</Point>
          <Point>You are responsible for protecting your login credentials.</Point>
          <Point>A breach of these terms may result in restricted access or removal.</Point>
        </ul>
      </>
    ),
  },
  {
    id: "safeguarding",
    title: "Safeguarding Statement",
    icon: HeartHandshake,
    children: (
      <>
        <p>
          Social Work Consultancy Ltd is dedicated to safeguarding and promoting the welfare
          of all learners and beneficiaries of our training and consultancy services. We
          acknowledge our responsibility to prevent abuse, uphold the rights of children and
          vulnerable adults, and foster safe, inclusive learning environments.
        </p>
        <p className="font-semibold text-gray-900 dark:text-[#ECF2EE]">
          Our safeguarding practices include:
        </p>
        <ul className="space-y-3">
          <Point>Adhering to national child protection laws and international standards.</Point>
          <Point>
            Requiring all staff, instructors, and partners to undergo safeguarding induction.
          </Point>
          <Point>Providing clear reporting channels for concerns or disclosures.</Point>
          <Point>Regularly reviewing and updating safeguarding policies and protocols.</Point>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    icon: Mail,
    tone: "gold",
    children: (
      <>
        <p>
          For inquiries regarding privacy, data usage, or protection, please reach out to our
          support team. We take your data seriously and will respond promptly.
        </p>
        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-2.5 min-h-[50px] px-6 rounded-full bg-[#14402F] text-white text-[0.92rem] font-bold hover:bg-[#0c2a1e] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14402F]/40 [overflow-wrap:anywhere]"
        >
          <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
          {supportEmail}
        </a>
      </>
    ),
  },
];

// The privacy policy, terms of use and safeguarding statement as one
// document with a contents list.
export function PrivacyContent() {
  return <LegalDocument sections={sections} />;
}

export const privacySectionIds = sections.map((s) => s.id);
