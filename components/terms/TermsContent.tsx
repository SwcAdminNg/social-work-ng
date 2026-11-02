import {
  Activity,
  BookOpen,
  CreditCard,
  Scale,
  Shield,
  UserCheck,
  XOctagon,
} from "lucide-react";
import LegalDocument, { Point, Term, type LegalSection } from "@/components/legal/LegalDocument";

const sections: LegalSection[] = [
  {
    id: "eligibility",
    title: "5.1 Eligibility",
    icon: UserCheck,
    children: (
      <ul className="space-y-3">
        <Point>The platform is open to individuals aged 18 and above.</Point>
        <Point>
          Students must be enrolled in a paid (or code-accessed) course and have a confirmed
          account before accessing content.
        </Point>
        <Point>
          Lecturers must be formally engaged by SWCL and hold a signed Lecturer Agreement and
          NDA before accessing the platform.
        </Point>
        <Point>
          SWCL reserves the right to refuse or revoke access to any user found to be in breach
          of these terms.
        </Point>
      </ul>
    ),
  },
  {
    id: "account",
    title: "5.2 Account Responsibilities",
    icon: Shield,
    children: (
      <ul className="space-y-3">
        <Point>
          Each user is responsible for maintaining the confidentiality of their login
          credentials.
        </Point>
        <Point>Accounts must not be shared with or transferred to any other individual.</Point>
        <Point>
          Users must change their password on first login and update it at regular intervals
          per the platform’s security settings (30–120 days).
        </Point>
        <Point>
          Users must notify SWCL immediately if they suspect unauthorised access to their
          account.
        </Point>
        <Point>
          Users must ensure that all information provided during registration is accurate and
          up to date.
        </Point>
      </ul>
    ),
  },
  {
    id: "acceptable",
    title: "5.3 Acceptable Use",
    icon: BookOpen,
    children: (
      <ul className="space-y-3">
        <Point>
          Users must engage with the platform in a respectful, professional, and ethical manner
          at all times.
        </Point>
        <Point>
          Course content is for personal and professional development only. It must not be
          reproduced, distributed, or sold without prior written consent from SWCL.
        </Point>
        <Point>
          Users must not attempt to access areas of the platform beyond their assigned access
          level.
        </Point>
        <Point>
          Any form of harassment, discrimination, or abusive behaviour will result in immediate
          account suspension.
        </Point>
      </ul>
    ),
  },
  {
    id: "intellectual",
    title: "5.4 Intellectual Property",
    icon: Scale,
    children: (
      <ul className="space-y-3">
        <Point>
          All course materials and content hosted on the SWCL platform are the intellectual
          property of Social Work Consultancy Ltd, unless otherwise stated in the Lecturer
          Agreement.
        </Point>
        <Point>
          <Term>Content Ownership:</Term> Course materials developed by lecturers for SWCL may
          either remain the intellectual property of SWCL or be licensed for use by SWCL,
          depending on the terms agreed in the Lecturer Agreement before course delivery. This
          must be clearly defined in writing before any course commences.
        </Point>
        <Point>
          Students may download and retain materials for personal reference only and must not
          share or republish them.
        </Point>
      </ul>
    ),
  },
  {
    id: "payment",
    title: "5.5 Payment and Refund Policy",
    icon: CreditCard,
    children: (
      <>
        <p>
          Course fees are non-refundable once access to course content has been granted, except
          as set out in the SWCL Refund Policy.
        </p>
        <div className="rounded-[20px] bg-[#EEF5F1] dark:bg-[#0F1A14] ring-1 ring-black/5 dark:ring-white/10 p-5 md:p-6">
          <ul className="space-y-3">
            <Point>
              <Term>Full refund:</Term> within 24 hours of payment if no content has been
              accessed.
            </Point>
            <Point>
              <Term>Partial refund (50%):</Term> within 7 working days of payment if less than
              25% of course content has been accessed, subject to LMS Administrator review.
            </Point>
            <Point>
              <Term>No refund:</Term> after 7 working days, or where 25% or more of content has
              been accessed, unless SWCL has experienced a proven technical failure.
            </Point>
          </ul>
        </div>
        <p>
          <Term>Definition of Technical Failure:</Term> A technical failure is a platform
          outage, payment error, or system fault caused by SWCL’s infrastructure that prevented
          the student from accessing content they had paid for. Must be verified by the IT
          Administrator before a refund is approved on these grounds.
        </p>
        <p>
          Refund requests must be submitted in writing using the SWCL Refund Request Form,
          available at{" "}
          <a
            href="https://socialworknigeria.org"
            className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
            target="_blank"
            rel="noopener noreferrer"
          >
            socialworknigeria.org
          </a>
          .
        </p>
        <p>
          A Dispute Form is also available for cases where a student wishes to formally
          challenge a refund decision.
        </p>
        <p>
          SWCL reserves the right to modify course fees. Enrolled students will not be affected
          by price changes mid-course.
        </p>
      </>
    ),
  },
  {
    id: "platform",
    title: "5.6 Platform Availability",
    icon: Activity,
    children: (
      <ul className="space-y-3">
        <Point>
          SWCL will endeavour to maintain platform availability at all times but cannot
          guarantee uninterrupted access due to scheduled maintenance or technical issues.
        </Point>
        <Point>
          Users will be notified in advance of planned maintenance and will receive proactive
          status updates during any unplanned downtime.
        </Point>
      </ul>
    ),
  },
  {
    id: "termination",
    title: "5.7 Termination of Access",
    icon: XOctagon,
    children: (
      <ul className="space-y-3">
        <Point>
          SWCL may suspend or terminate a user’s account without prior notice if the user is
          found to be in breach of these Terms of Service.
        </Point>
        <Point>
          Upon termination, the user will lose access to all course content and progress
          records.
        </Point>
        <Point>
          Users may request account deletion at any time by contacting the SWCL administration
          team.
        </Point>
      </ul>
    ),
  },
];

// The terms of service as one document with a contents list.
export function TermsContent() {
  return (
    <LegalDocument
      intro={
        <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE]">
          The following Terms of Service apply to all registered users of the SWCL LMS
          platform. By creating an account and accessing the platform, users agree to be bound
          by these terms in full.
        </p>
      }
      sections={sections}
    />
  );
}
