import type { ServicePageContent } from "@/components/services/types";

// Copy for the Research and Evaluation service page, taken from the
// client's developer handover (25 October 2026). Placement notes and
// button instructions from the handover are implemented, not published.

const IMG = "/images/research-and-evaluation";

export const research: ServicePageContent = {
  path: "/research-and-evaluation",
  opening: {
    eyebrow: "Our services",
    title: "Research and Evaluation",
    tagline: "Evidence to Inform Better Decisions",
    image: `${IMG}/reviewing-research.webp`,
    imageWidth: 1672,
    imageHeight: 941,
    imageAlt: "Two professionals review printed charts and research notes at a desk.",
    imageNote: "Illustrative image",
  },
  approach: {
    eyebrow: "What we do",
    title: "Evidence to Inform Better Decisions",
    paragraphs: [
      "Organisations need reliable information to understand the people they serve, identify priorities, and assess whether their work achieves its intended purpose.",
      "Social Work Consultancy Ltd supports research and evaluation that link evidence to practical decisions. We help organisations explore community needs, examine service delivery, and develop recommendations grounded in the findings.",
      "Our focus is on social work, social welfare and related services, particularly on issues affecting children, families and communities in Nigeria and across the wider Global South.",
      "Whether you are planning a programme, reviewing an existing service, or investigating a specific question, we begin by clarifying what you need to understand and how the findings will be used.",
    ],
    strands: [
      {
        id: "clear-purpose",
        title: "Research with a Clear Purpose",
        statement: "A useful study begins with a well-defined question.",
        paragraphs: [
          "We work with commissioning organisations to define the purpose, scope and intended audience of the research. This includes assessing what information already exists, whose perspectives should inform the work, and what can realistically be achieved within the available time and resources.",
          "The approach may involve interviews, focus groups, surveys, document reviews, analysis of existing information, or a combination of methods. The choice depends on the question, the setting, and the required quality of evidence.",
        ],
      },
      {
        id: "people-and-context",
        title: "Understanding People and Context",
        statement:
          "Services operate within specific social, cultural and organisational conditions. Research should take those conditions seriously.",
        paragraphs: [
          "Our approach considers how family relationships, inequality, disability, language, location and access to resources may shape people’s experiences and participation.",
          "Where appropriate, we seek to include the perspectives of people who use services alongside those of practitioners, community representatives and decision-makers. Their contributions can help explain barriers, identify strengths and reveal priorities that routine information may overlook.",
        ],
      },
      {
        id: "usable-findings",
        title: "Findings That People Can Use",
        statement:
          "Research should make its findings understandable without overstating the evidence.",
        paragraphs: [
          "Depending on the agreed brief, outputs may include a detailed report, an executive summary, an evidence review, a stakeholder presentation, or practical recommendations.",
          "We aim to distinguish findings from interpretation, explain limitations, and identify implications for policy, programme design, or service delivery. Recommendations should follow from the evidence and recognise the resources and responsibilities required for implementation.",
        ],
      },
    ],
  },
  services: {
    eyebrow: "What you can commission",
    title: "Research Support You Can Commission",
    items: [
      {
        id: "needs-assessments",
        title: "Needs Assessments and Service Mapping",
        statement:
          "Understand the needs, strengths and priorities of a population or community, alongside the services already available.",
        text: "This work can help organisations identify unmet needs, access barriers, service gaps, and opportunities to improve coordination. The scope may focus on a particular location, group or area of practice.",
      },
      {
        id: "evaluation",
        title: "Programme and Service Evaluation",
        statement:
          "Examine how a programme is delivered and what can be learned from its implementation and results.",
        text: "An evaluation may examine participation, accessibility, delivery quality, experiences, and progress towards intended outcomes. The design should make clear which questions it can answer and whether the available evidence supports conclusions about impact.",
      },
      {
        id: "studies",
        title: "Qualitative and Quantitative Studies",
        statement:
          "Explore questions through people’s experiences, numerical data, or a combination of both.",
        text: "Qualitative methods can help explain how people understand an issue and why particular experiences occur. Quantitative methods can help describe patterns, differences and change. Combining methods may provide a fuller understanding where the question and resources justify it.",
      },
      {
        id: "evidence-reviews",
        title: "Evidence Reviews and Policy Research",
        statement:
          "Bring together existing research, policy documents and other relevant information to clarify what is known about an issue.",
        text: "This can support policy development, funding proposals, organisational planning, or practice improvement. Reviews should explain how evidence was selected, assess its relevance and quality, and identify key gaps or uncertainties.",
      },
      {
        id: "feasibility",
        title: "Feasibility and Programme Design Studies",
        statement:
          "Assess the practical conditions for a proposed service or programme before committing to wider delivery.",
        text: "This work may consider community priorities, likely demand, existing provision, organisational capacity, delivery options and implementation challenges. Findings can help refine a proposal and identify questions requiring further testing.",
      },
    ],
    scope: {
      title: "A Responsible and Collaborative Approach",
      paragraphs: [
        "Research entails responsibilities to participants and to those who use its findings.",
        "Before work begins, we agree on the project’s questions, methods, deliverables, responsibilities and timescales. We also consider participant welfare, informed participation, confidentiality, secure information handling, and any permissions or ethical review appropriate to the study.",
        "We recognise that evidence can be incomplete and that people may hold different perspectives. Our approach accommodates those differences and openly communicates uncertainty.",
      ],
      button: { label: "Discuss a Research Project", href: "#enquiry" },
    },
  },
  enquiry: {
    eyebrow: "Start a conversation",
    title: "Tell Us What You Need to Understand",
    paragraphs: [
      "Are you exploring a community need, reviewing a programme, or gathering evidence to inform a decision?",
      "Tell us about your organisation, the issue you want to investigate, and how you hope to use the findings. You do not need a completed research brief to start a conversation.",
    ],
    helpfulLead: "It is helpful to include:",
    helpful: [
      "The main question or challenge.",
      "The people, services or geographical area involved.",
      "Any existing information available.",
      "Your intended outputs and preferred timescale.",
      "Any budget parameters you can share.",
    ],
    notice:
      "Please do not include identifiable case records or confidential participant information in your initial enquiry.",
    form: {
      heading: "Project enquiry",
      replyNote: "We reply by email, or by telephone if you give us a number.",
      labels: {
        name: "Your name",
        email: "Email address",
        organisation: "Organisation",
        phone: "Phone number",
        message: "Project enquiry",
      },
      messagePrompt:
        "Tell us what you want to understand, how you intend to use the findings, and any timescale you have in mind.",
      button: "Send Research Enquiry",
      subject: "Research enquiry",
      privacy: { label: "privacy information", href: "/privacy-policy" },
    },
    confirmation: {
      title: "Thank you. Your research enquiry has been received.",
      text: "We will review the information provided, contact you to discuss the request, clarify the scope, and consider whether SWCL can support the work.",
    },
  },
};
