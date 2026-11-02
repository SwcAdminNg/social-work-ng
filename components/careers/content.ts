// Copy for the Careers and Volunteering page, taken from the client's
// developer handover (25 October 2026). Placement notes and button
// instructions from the handover are implemented, not published.

const IMG = "/images/careers";

export const opening = {
  eyebrow: "Careers and volunteering",
  // Each line ends in a gold full stop added by the component.
  titleLines: ["Build Your Career", "Contribute Your Skills"],
  paragraphs: [
    "Help strengthen the people, organisations and ideas that underpin better social work and social services.",
    "Social Work Consultancy Ltd welcomes interest from professionals, educators, researchers, students and individuals with relevant skills who share our commitment to human dignity, inclusion and ethical practice.",
    "Our work connects professional learning, research, policy and organisational support. Depending on current opportunities, contributions may include developing learning resources, facilitating training, supporting research, communicating evidence or helping programmes run effectively.",
    "Whether you bring established expertise or are exploring an early-career opportunity, we encourage you to share your interests and experience. Available roles and assignments will depend on organisational needs and the requirements of each opportunity.",
  ],
  image: `${IMG}/planning-learning-resources.webp`,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt:
    "Three colleagues discuss learning resources at a table with notebooks and tablets.",
  imageNote: "Illustrative image",
};

export const benefits = {
  eyebrow: "Working with SWCL",
  title: "Purposeful Work. Thoughtful Collaboration.",
  items: [
    {
      title: "Contribute Your Expertise",
      statement:
        "Apply your knowledge and skills to work that supports professional development and improves services.",
      text: "Your contribution could help clarify a learning resource, bring new insight to a research question, or support an organisation in examining its practice. We value careful work that responds to a defined need and considers the people it is intended to benefit.",
    },
    {
      title: "Develop Through Collaboration",
      statement:
        "Working alongside people with different experiences can broaden understanding and strengthen professional judgement.",
      text: "We value curiosity, constructive feedback and a willingness to learn. Where an opportunity includes supervision, mentoring or structured development, these arrangements will be explained in the opportunity's description.",
    },
    {
      title: "Work with Shared Values",
      statement:
        "Our work is guided by respect for human dignity, social justice, inclusion, professional ethics and accountability.",
      text: "We welcome people who can translate these values into everyday actions: listening respectfully, communicating clearly, handling information responsibly and following through on agreed commitments.",
    },
  ],
};

export const areas = {
  eyebrow: "Areas of interest",
  title: "Ways to Contribute",
  // These are areas of interest, not advertised vacancies.
  note: "Areas of interest, not advertised vacancies",
  paragraphs: [
    "SWCL’s work draws on a range of professional, creative and organisational skills. The areas below outline contributions that may support our work; they do not confirm current vacancies.",
    "When a specific role becomes available, its description should outline the responsibilities, selection criteria, working arrangements and the application process.",
  ],
  items: [
    {
      id: "training",
      title: "Training and Facilitation",
      statement:
        "For practitioners and educators who can explain concepts clearly, encourage discussion, and connect learning to practice.",
      text: "Relevant contributions may include preparing sessions, developing case discussions, facilitating workshops and supporting learners' reflection. Subject knowledge, ethical awareness and an understanding of the intended audience are essential.",
    },
    {
      id: "research",
      title: "Research and Policy",
      statement:
        "For people with skills in evidence review, research, evaluation, policy analysis, or stakeholder engagement.",
      text: "Contributions may include reviewing the literature, developing research tools, analysing information and preparing accessible reports or policy briefs. Each assignment will specify the required methods, experience and outputs.",
    },
    {
      id: "content",
      title: "Learning Content Development",
      statement:
        "For people who can translate subject knowledge into engaging, accessible learning materials.",
      text: "Relevant skills include instructional design, writing, editing, animation, audio production, video development and interactive learning. Content development should combine accuracy with clear learning outcomes and an understanding of adult learning.",
    },
    {
      id: "communications",
      title: "Communications and Programme Support",
      statement:
        "For people who can help communicate our work and coordinate its delivery.",
      text: "Relevant contributions may include digital communications, editing, outreach, event coordination, administration and programme support. We value clear organisation, reliable communication and attention to detail.",
    },
  ],
  link: { label: "Express Your Interest", href: "#interest" },
};

export type OpportunityType =
  | "Employment"
  | "Volunteering"
  | "Internship"
  | "Consultancy";

export const opportunityTypes: OpportunityType[] = [
  "Employment",
  "Volunteering",
  "Internship",
  "Consultancy",
];

export const opportunities = {
  eyebrow: "Opportunities",
  title: "Volunteer, Intern or Consult with SWCL",
  items: [
    {
      id: "volunteering",
      type: "Volunteering" as OpportunityType,
      title: "Volunteer Opportunities",
      statement: "Contribute your time and skills towards a defined purpose.",
      paragraphs: [
        "Volunteering may suit people who want to contribute relevant experience to professional learning, resource development, communications, or other agreed activities.",
        "Please tell us what you can offer, the areas that interest you, and your availability. Any volunteer opportunity should have a clear scope, a named contact, and agreed expectations.",
        "Volunteer arrangements, including time commitments, support and any expenses, will be explained before an opportunity is accepted.",
      ],
      button: "Express Interest in Volunteering",
    },
    {
      id: "internship",
      type: "Internship" as OpportunityType,
      title: "Internship Opportunities",
      statement: "Explore practical learning aligned with your development goals.",
      paragraphs: [
        "Internship opportunities may suit students and early-career applicants interested in social work education, research, policy, digital learning, or organisational support.",
        "Tell us about your studies or experience, the skills you hope to develop, and any requirements set by your institution.",
        "Where an internship is available, its description will outline the activities, duration, supervision, learning expectations and payment or expense arrangements. Any formal placement requirements must be agreed separately.",
      ],
      button: "Express Interest in an Internship",
    },
    {
      id: "consultancy",
      type: "Consultancy" as OpportunityType,
      title: "Consultancy Opportunities",
      statement: "Bring specialist expertise to a clearly defined assignment.",
      paragraphs: [
        "Consultancy assignments may require expertise in training, curriculum development, research, evaluation, safeguarding, policy, or organisational development.",
        "We welcome expressions of interest from professionals who can demonstrate relevant experience and explain the contribution they could make.",
        "Each commissioned assignment should have an agreed brief outlining deliverables, responsibilities, timescales, fees and reporting arrangements.",
      ],
      button: "Express Interest in Consultancy",
    },
  ],
};

export const interest = {
  eyebrow: "Expression of interest",
  title: "Tell Us How You Would Like to Contribute",
  note: "General expression of interest",
  paragraphs: [
    "If you are responding to an advertised opportunity, include its title or reference number and follow the instructions in the role description.",
    "If you are making a general enquiry, please tell us about your skills, interests and availability. Please also make it clear whether you are interested in employment, volunteering, an internship or consultancy.",
    "A general expression of interest does not guarantee a role or assignment. Specific opportunities are assessed against their requirements and SWCL’s current needs.",
  ],
  form: {
    heading: "Expression of interest",
    labels: {
      name: "Full name",
      email: "Email address",
      phone: "Phone number",
      type: "Opportunity type",
      typePlaceholder: "Employment, Volunteering, Internship or Consultancy",
      reference: "Role reference or area of interest",
      statement: "Statement of interest",
    },
    referenceGuidance:
      "Enter the advertised role reference, or describe the area where you would like to contribute.",
    statementGuidance:
      "Tell us about your relevant experience, the contribution you would like to make, and your availability. For internships, include your learning goals and any institutional requirements.",
    documents: {
      label: "CV or portfolio",
      note: "Optional for general expressions of interest. For advertised opportunities, follow the document requirements outlined in the role description. Portfolio samples should be your own work and must not contain confidential information. We will tell you how to send documents when they are needed.",
    },
    privacy: {
      lead: "Please read our applicant privacy information before submitting your details.",
      linkLabel: "applicant privacy information",
      href: "/privacy-policy",
      caution:
        "Do not include identity documents, confidential case information or sensitive personal details unless requested.",
    },
    button: "Submit Expression of Interest",
    subject: "Expression of interest",
  },
  confirmation: {
    title: "Thank you. Your expression of interest has been received.",
    text: "If you applied for an advertised opportunity, the next steps will follow the published recruitment process for that opportunity. For general expressions of interest, we may contact you if a suitable opportunity arises for discussion.",
  },
};
