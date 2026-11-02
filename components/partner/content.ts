// Copy for the Partner with Us page, taken from the client's developer
// handover (25 October 2026). Placement notes and link instructions from
// the handover are implemented, not published.

const IMG = "/images/partner-with-us";

export const banner = {
  eyebrow: "Work with us",
  titleLead: "Partner with Us to Strengthen",
  titleAccent: "Social Services",
  paragraphs: [
    "Lasting improvements in social work and social services depend on people and organisations working together, sharing knowledge and combining their strengths for a common purpose.",
    "Social Work Consultancy Ltd welcomes partnership enquiries from NGOs, educational institutions, professional networks, public bodies, funders and organisations whose priorities align with ethical practice, inclusion and improved support for children, families and communities.",
    "Together, we can explore practical collaboration through professional learning, research, policy and advocacy. We begin with your priorities, the people the work will support, and the contribution each organisation can make.",
  ],
  // Decorative background behind the banner; the meaning is in the text.
  image: `${IMG}/reviewing-a-project-folder.webp`,
  imageWidth: 1672,
  imageHeight: 941,
};

export type Route = {
  id: string;
  title: string;
  statement: string;
  paragraphs: string[];
};

export const ways = {
  eyebrow: "Four routes",
  title: "Ways to Partner With Us",
  platformName: "socialworknigeria.org",
  platformHref: "/courses",
  items: [
    {
      id: "sponsor",
      title: "Sponsor Learning and Access",
      statement:
        "Help widen access to relevant professional development for people who may face financial or organisational barriers to learning.",
      paragraphs: [
        "Depending on the agreed arrangement, support could contribute to learner places, a defined cohort, or the development of a useful learning resource. Sponsorship should have a clear purpose, transparent eligibility criteria, and agreed reporting.",
        "The learning platform at socialworknigeria.org serves as SWCL's training arm. Any sponsored learning activity will depend on confirmed course availability and an agreed scope. Recognition of the sponsor and the use of branding are discussed before delivery.",
      ],
    },
    {
      id: "commission",
      title: "Commission a Project",
      statement:
        "Engage SWCL to discuss a specific organisational need, such as research, programme evaluation, policy review, stakeholder consultation or workforce development.",
      paragraphs: [
        "We begin by clarifying the question, intended outcomes, required expertise and available resources. A commissioned project should have an agreed brief that sets out deliverables, responsibilities, timescales, fees and reporting arrangements.",
        "This route suits organisations seeking a specific piece of work with clear accountability and a practical application for the findings or outputs.",
      ],
    },
    {
      id: "co-develop",
      title: "Co-Develop Training and Resources",
      statement:
        "Bring your subject knowledge, practical experience, or understanding of a particular audience to the development of professional learning.",
      paragraphs: [
        "Collaboration may involve course content, practice scenarios, toolkits, webinars or other resources that address an identified need. We can discuss the audience, learning outcomes, delivery format and the process for reviewing material for accuracy and relevance.",
        "Before work begins, the organisations should agree on editorial responsibilities, accessibility expectations, ownership, permissions and any arrangements for hosting, distribution or income.",
      ],
    },
    {
      id: "collaborate",
      title: "Collaborate on Research and Advocacy",
      statement:
        "Explore shared questions and priorities through evidence gathering, knowledge exchange and informed engagement.",
      paragraphs: [
        "Potential activities may include research proposals, evidence reviews, policy briefs, or consultation or learning events. Start with a clear issue and an understanding of whose perspectives should inform the work.",
        "Partners should agree on decision-making, each partner's contributions, and how findings will be communicated. Any publication, public messaging, or use of participants’ experiences requires appropriate review and permission.",
      ],
    },
  ] satisfies Route[],
};

export const reasons = {
  eyebrow: "Why SWCL",
  title: "Why Partner With SWCL",
  items: [
    {
      title: "Connected Areas of Work",
      text: "Our approach brings professional learning, research, policy and advocacy together in the same conversation. This helps organisations consider how evidence can inform training, how practice can raise policy questions and how learning can support implementation.",
    },
    {
      title: "Attention to Local Context",
      text: "We focus on Nigerian and wider Global South contexts while drawing on relevant international knowledge. We recognise the importance of culture, language, resources, service arrangements and the perspectives of those involved.",
    },
    {
      title: "A Practical Approach to Collaboration",
      text: "We aim to turn shared interests into a manageable scope of work. This means discussing intended outcomes, responsibilities, resources and the steps required to move forward, rather than assuming that every partnership requires the same model.",
    },
    {
      title: "Shared Values and Accountability",
      text: "We welcome collaboration grounded in human dignity, social justice, inclusion and professional ethics. Clear communication, appropriate handling of information and review of agreed commitments are integral to how a partnership should operate.",
    },
  ],
};

export const process = {
  eyebrow: "The process",
  title: "How We Build a Partnership",
  lead: "A successful partnership begins with a conversation about purpose and fit.",
  steps: [
    {
      title: "Explore the need",
      text: "First, we explore the need, the people the work will support and how it relates to each organisation’s priorities. We then discuss a suitable scope, the expertise and resources required and any practical constraints.",
    },
    {
      title: "Agree a proposal",
      text: "Where there is a basis to proceed, the next step is an agreed proposal or brief. This should set out contributions, decision-making, delivery milestones, financial arrangements where relevant, and how progress will be reviewed.",
    },
    {
      title: "Settle the terms",
      text: "The agreement should also address ownership and permitted use of materials, confidentiality, publication and branding. These arrangements should reflect the project rather than be assumed from an initial enquiry.",
    },
    {
      title: "Review as you go",
      text: "As work progresses, partners can review what they're learning, address any difficulties, and decide whether the collaboration should continue, change, or conclude.",
    },
  ],
};

export const conversation = {
  title: "Start a Partnership Conversation",
  paragraphs: [
    "Tell us about your organisation, the issue or opportunity you wish to explore, and the contribution you would like to make.",
    "It is helpful to include your intended audience, the partnership route that interests you, any proposed outputs, and the timescale you have in mind. If you are still shaping the idea, a short outline is sufficient to begin.",
  ],
  notice:
    "Please avoid sending confidential case details, sensitive internal documents, or personal information about the people you support in an initial email.",
  email: "info@socialwork-consultancy.com",
  emailSubject: "Partnership enquiry",
  linkLabel: "Discuss a Partnership",
  disclaimer:
    "We welcome an initial discussion; any commitment to deliver work, funding, branding or publication will be subject to a separate agreement.",
};
