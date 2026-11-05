"use client";

import EnquiryForm, { type FormConfig } from "./EnquiryForm";

export const PATHWAYS = [
  "Student and Placement Support",
  "Early Career Practice Development",
  "Career and Further Study Guidance",
] as const;

/** Pathway cards dispatch this to pre-select a pathway in the mentee form. */
export const PATHWAY_EVENT = "swcl:mentorship-pathway";

const STAGES = [
  "Social work student",
  "Recent graduate",
  "Early-career practitioner",
  "Other",
];

const IDENTIFYING_GUIDANCE =
  "Please do not include names or any identifying information about the people you support.";

const MENTEE: FormConfig = {
  category: "mentorship",
  sourcePage: "/mentorship",
  messageField: "goals",
  submitLabel: "Send Mentorship Enquiry",
  prefillEvent: PATHWAY_EVENT,
  subject: (v) => `Mentorship enquiry: ${v.pathway || "Pathway not chosen"}`,
  success: {
    title: "Thank you. Your mentorship enquiry has been received.",
    body: "We will contact you at the email address you provided.",
  },
  fields: [
    { kind: "text", name: "fullName", label: "Full name", required: true, autoComplete: "name", max: 200, half: true },
    { kind: "email", name: "email", label: "Email address", required: true, autoComplete: "email", hint: "We will contact you here.", half: true },
    { kind: "text", name: "country", label: "Country", required: true, autoComplete: "country-name", max: 100, half: true },
    { kind: "select", name: "stage", label: "Current study or employment stage", required: true, options: STAGES, half: true },
    { kind: "radio", name: "pathway", label: "Preferred pathway", required: true, options: [...PATHWAYS, "Not sure yet"] },
    {
      kind: "textarea",
      name: "goals",
      label: "Learning goals",
      required: true,
      min: 20,
      max: 500,
      placeholder: "What would you like to work on with a mentor?",
      guidance: IDENTIFYING_GUIDANCE,
    },
    { kind: "tel", name: "phone", label: "Telephone number", autoComplete: "tel", half: true },
    { kind: "text", name: "timeZone", label: "Time zone", max: 60, suggestFrom: "timeZone", half: true, hint: "For example, Africa/Lagos or GMT+1." },
    { kind: "text", name: "availability", label: "Availability", max: 200, hint: "For example, weekday evenings or Saturday mornings." },
    { kind: "textarea", name: "adjustments", label: "Access adjustments you would like to discuss", max: 500, rows: 3 },
  ],
};

const MENTOR: FormConfig = {
  category: "mentor_application",
  sourcePage: "/mentorship",
  messageField: "experience",
  submitLabel: "Send Mentor Enquiry",
  subject: () => "Mentor application",
  success: {
    title: "Thank you. Your mentor enquiry has been received.",
    body: "We will contact you at the email address you provided about next steps.",
  },
  fields: [
    { kind: "text", name: "fullName", label: "Full name", required: true, autoComplete: "name", max: 200, half: true },
    { kind: "email", name: "email", label: "Email address", required: true, autoComplete: "email", half: true },
    { kind: "tel", name: "phone", label: "Telephone number", autoComplete: "tel", half: true },
    { kind: "text", name: "country", label: "Country", required: true, autoComplete: "country-name", max: 100, half: true },
    { kind: "text", name: "timeZone", label: "Time zone", required: true, max: 60, suggestFrom: "timeZone", hint: "For example, Africa/Lagos or GMT+1." },
    {
      kind: "textarea",
      name: "qualifications",
      label: "Qualifications",
      required: true,
      max: 500,
      rows: 3,
      placeholder: "Degrees, professional registration or other relevant qualifications.",
    },
    {
      kind: "textarea",
      name: "experience",
      label: "Relevant experience",
      required: true,
      min: 20,
      max: 1500,
      placeholder: "Your practice, teaching or supervision experience.",
      guidance: IDENTIFYING_GUIDANCE,
    },
    { kind: "checkboxes", name: "interests", label: "Areas of interest", required: true, options: [...PATHWAYS] },
    { kind: "text", name: "availability", label: "Availability", required: true, max: 200, hint: "For example, two hours a month on weekday evenings." },
  ],
};

export function MenteeForm() {
  return <EnquiryForm config={MENTEE} />;
}

export function MentorForm() {
  return <EnquiryForm config={MENTOR} />;
}

export function PathwayButton({ pathway, className, children }: { pathway: string; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(PATHWAY_EVENT, { detail: { field: "pathway", value: pathway } }))}
    >
      {children}
    </button>
  );
}
