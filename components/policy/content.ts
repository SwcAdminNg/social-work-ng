// Copy for the Policy and Advocacy service page, taken from the client's
// developer handover (25 October 2026). Placement notes and button
// instructions from the handover are implemented, not published.

const IMG = "/images/policy-and-advocacy";

export const opening = {
  eyebrow: "Our services",
  title: "Policy and Advocacy",
  tagline: "Turning Evidence and Experience into Better Policy",
  image: `${IMG}/policy-consultation.webp`,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: "Four adults discuss policy and service priorities around a table.",
  imageNote: "Illustrative image",
};

export const approach = {
  eyebrow: "What we do",
  title: "Turning Evidence and Experience into Better Policy",
  paragraphs: [
    "Policies shape how organisations operate, how professionals respond to need and how people access support. Effective policy requires a clear purpose, a sound understanding of the issue and a practical route to implementation.",
    "Social Work Consultancy Ltd supports organisations in developing, reviewing and communicating policies and advocacy priorities that promote rights, inclusion and better social services.",
    "We connect research, professional knowledge and the perspectives of those affected by decisions. Our focus includes issues relevant to children, families and communities, with attention to Nigerian and wider Global South contexts.",
    "Whether you are reviewing an organisational policy, preparing a policy brief, or planning stakeholder engagement, we begin by understanding what you want to change and who needs to be involved.",
  ],
  // The three explanatory strands beneath the description. Each opens
  // with its one-line statement, then the fuller explanation.
  strands: [
    {
      id: "practical-action",
      title: "From Policy Intent to Practical Action",
      statement:
        "A policy document is useful when people understand what it means for their responsibilities and how to apply it.",
      paragraphs: [
        "Our approach considers the relationship between policy commitments and everyday practice. This includes roles, procedures, available resources, communication, and the conditions that may support or hinder implementation.",
        "Depending on the brief, support may include reviewing existing documents, identifying gaps, consulting stakeholders, and developing clearer guidance or recommendations. Any requirements for specialist legal interpretation or formal approval are identified when agreeing the scope.",
      ],
    },
    {
      id: "participation",
      title: "Participation That Informs Decisions",
      statement:
        "People affected by a policy can offer insight into barriers, unintended consequences, and what meaningful improvement would look like.",
      paragraphs: [
        "We encourage consultation with a clear purpose that gives people an appropriate opportunity to contribute. This includes considering accessibility, language, power differences, and how participants will understand how their contributions will be used.",
        "Participation should inform the work rather than merely endorse a decision already made. When consultation is included, the process should explain how it will consider different perspectives and how it will communicate feedback.",
      ],
    },
    {
      id: "advocacy",
      title: "Advocacy with a Defined Purpose",
      statement:
        "Effective advocacy begins with a clear issue, credible evidence and a realistic objective.",
      paragraphs: [
        "We support organisations in clarifying the change they seek, understanding relevant stakeholders and developing messages suited to their audience. The approach may involve policy briefs, dialogue, consultation responses or awareness resources, depending on the agreed purpose.",
        "We recognise that policy change involves many people and factors. Our work supports informed engagement without promising any particular government decision, funding outcome or legislative change.",
      ],
    },
  ],
};

export type Service = {
  id: string;
  title: string;
  statement: string;
  text: string;
};

export const services = {
  eyebrow: "What you can commission",
  title: "Policy and Advocacy Support You Can Commission",
  items: [
    {
      id: "policy-development",
      title: "Policy Development and Review",
      statement:
        "Develop or review organisational policies on safeguarding, child protection, social welfare, inclusion and related service responsibilities.",
      text: "Support may include reviewing current documents, consulting staff and stakeholders, clarifying responsibilities, and preparing draft policies or implementation guidance for the organisation’s approval.",
    },
    {
      id: "evidence-briefs",
      title: "Evidence Reviews and Policy Briefs",
      statement:
        "Translate research, practice learning and relevant information into clear materials for decision-makers.",
      text: "Outputs may include evidence summaries, policy briefs, consultation responses or recommendations. The work should distinguish evidence from interpretation, identify limitations and make the proposed actions clear.",
    },
    {
      id: "consultation",
      title: "Stakeholder Consultation and Dialogue",
      statement:
        "Plan and facilitate discussions with practitioners, community representatives, institutions and people with relevant lived experience.",
      text: "This may include stakeholder mapping, consultation questions, facilitated meetings and a summary of themes. The approach is agreed on the issue, participants and the intended use of the findings.",
    },
    {
      id: "advocacy-planning",
      title: "Advocacy Planning and Communications",
      statement:
        "Develop a practical approach to communicating an issue and engaging people who can help drive change.",
      text: "Support may include clarifying objectives, audiences, key messages, engagement activities, and methods for reviewing progress. Public communications and the use of participants’ stories should comply with agreed approval and permission arrangements.",
    },
    {
      id: "training",
      title: "Training and Implementation Support",
      statement:
        "Help teams understand policy responsibilities and build confidence in rights-based approaches, consultation and advocacy.",
      text: "Depending on the agreed brief, support may include workshops, practice scenarios, staff guidance, or implementation planning. The aim is to align policy expectations with the decisions and actions people take in their roles.",
    },
  ] satisfies Service[],
  // How every assignment is framed, and the invitation to talk.
  scope: {
    title: "Clear Scope and Useful Outputs",
    paragraphs: [
      "Each assignment begins with an agreed purpose, responsibilities, timescale and deliverables. Outputs may include a policy review report, draft policy, implementation plan, stakeholder summary, policy brief or advocacy plan.",
      "We consider the local context, organisational capacity and the people affected. Final policy adoption and organisational decisions remain with the commissioning organisation and its relevant approval bodies.",
    ],
    button: { label: "Discuss Policy and Advocacy Support", href: "#enquiry" },
  },
};

export const enquiry = {
  eyebrow: "Start a conversation",
  title: "Tell Us What You Want to Change",
  paragraphs: [
    "Are you reviewing a policy, addressing a service barrier, or developing an advocacy priority?",
    "Tell us about the issue, the people affected, and what you would like the work to achieve. You do not need a completed brief to start a conversation.",
  ],
  helpfulLead: "It is helpful to include:",
  helpful: [
    "Your organisation and the policy or practice issue involved.",
    "The people, services, or geographical area affected.",
    "Any relevant documents or evidence already available.",
    "The support or outputs you are considering.",
    "Your preferred timescale and any budget parameters you can provide.",
  ],
  notice:
    "Please do not include confidential case details, identifiable personal accounts, or sensitive internal documents in your initial enquiry.",
  form: {
    heading: "Policy or advocacy enquiry",
    labels: {
      name: "Your name",
      email: "Email address",
      organisation: "Organisation",
      phone: "Phone number",
      message: "Policy or advocacy enquiry",
    },
    messagePrompt:
      "Tell us about the issue, the change you are seeking and the support you need.",
    button: "Send Policy Enquiry",
    privacy: { label: "privacy information", href: "/privacy-policy" },
  },
  confirmation: {
    title: "Thank you. Your policy and advocacy enquiry has been received.",
    text: "We will review the information provided, contact you to discuss the request, clarify the scope, and consider whether SWCL can support the work.",
  },
};
