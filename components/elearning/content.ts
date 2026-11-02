// Copy for the E-Learning and Professional Development service page,
// taken from the client's developer handover (25 October 2026).
// Placement notes and link instructions are implemented, not published.

const IMG = "/images/e-learning";
const SWCL = "/images/home/swcl";

export const platformName = "Socialworknigeria.org";
export const platformHref = "/courses";

export const opening = {
  eyebrow: "Our services",
  title: "E-Learning and Professional Development",
  tagline: "Learning That Strengthens Practice",
  image: `${IMG}/learning-together.webp`,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt:
    "Three adult learners study with laptops and notebooks in a bright learning space.",
  imageNote: "Illustrative image",
};

export const offer = {
  eyebrow: "What we offer",
  title: "Learning That Strengthens Practice",
  paragraphs: [
    "Professional learning should help you understand your responsibilities, think critically, and respond more effectively to the people you support.",
    "Social Work Consultancy Ltd’s learning offer connects social work knowledge with practical contexts, ethical questions and the realities of working with children, families and communities. Our approach encourages learners to explore ideas, reflect on experience and consider how learning can inform their decision-making.",
    "Socialworknigeria.org is the dedicated e-learning platform of Social Work Consultancy Ltd. It brings together the training and professional development aspects of our work, alongside SWCL’s wider research, policy, advocacy and consultancy services.",
    "Through the platform, you can explore current learning opportunities and identify programmes relevant to your role, experience and development goals.",
  ],
};

export const audiences = {
  eyebrow: "Who it is for",
  title: "Who Our Learning Supports",
  intro: "Our learning offer is intended for people at different stages of development:",
  items: [
    {
      id: "students",
      title: "Students and those exploring social work",
      text: "Develop an understanding of the profession’s purpose, values and approaches, and connect academic learning with practice settings.",
      image: `${SWCL}/foundation-learning.webp`,
      imageAlt: "A learner studying at a desk with a notebook and laptop",
      focus: "50% 35%",
    },
    {
      id: "practitioners",
      title: "Practising social workers and related professionals",
      text: "Deepen knowledge, examine practice challenges, and identify areas for continuing professional development.",
      image: `${SWCL}/cpd-training.webp`,
      imageAlt: "Professionals in a group discussion around a table",
      focus: "50% 40%",
    },
    {
      id: "educators",
      title: "Educators, caregivers and community practitioners",
      text: "Explore the relevant knowledge and skills within the responsibilities and boundaries of your role.",
      image: `${SWCL}/listening-with-care.webp`,
      imageAlt: "A practitioner listening carefully and taking notes during a meeting",
      focus: "66% 40%",
    },
    {
      id: "organisations",
      title: "NGOs, institutions and service providers",
      text: "Consider learning that supports staff development, shared understanding and organisational priorities.",
      image: `${SWCL}/organisational-learning.webp`,
      imageAlt: "A team working together on organisational learning",
      focus: "50% 40%",
    },
  ],
  note: "Each course description should explain its intended audience and any prior knowledge or experience required before enrolling.",
};

export const approach = {
  eyebrow: "Our approach",
  title: "Learning Rooted in Context and Practice",
  strands: [
    {
      id: "local-realities",
      title: "Connecting Professional Knowledge with Local Realities",
      statement:
        "Effective practice requires understanding the context in which people live and services operate.",
      paragraphs: [
        "Our learning approach takes into account Nigerian and wider Global South contexts alongside relevant international knowledge. It encourages learners to examine how culture, family relationships, inequality, available resources and access to services shape people’s experiences.",
        "We support the thoughtful application of learning, recognising that any approach must be considered in relation to local circumstances, professional responsibilities and the needs of those involved.",
      ],
    },
    {
      id: "application",
      title: "From Understanding to Application",
      statement:
        "Knowing a concept is only the beginning. Practitioners also need to recognise when it is relevant, consider different perspectives, and explain their decisions.",
      paragraphs: [
        "Depending on the programme, learning activities may include case scenarios, guided reflection, knowledge checks, practical exercises, audiovisual explanations and facilitated discussion. The format and available activities should be explained in the individual course information.",
        "The aim is to help learners connect what they study with what they do, while recognising the limits of their knowledge and the need for further guidance or expertise.",
      ],
    },
  ],
};

export const expect = {
  eyebrow: "What you can expect",
  title: "What You Can Expect",
  items: [
    {
      id: "practice-focused",
      title: "Practice Focused Learning",
      paragraphs: [
        "Explore ideas through situations and questions relevant to professional practice. Learning should help you consider how knowledge informs communication, assessment, ethical judgement and appropriate action within your role.",
      ],
    },
    {
      id: "context-aware",
      title: "Context Aware Content",
      paragraphs: [
        "Consider professional approaches alongside the communities, services and systems in which they are applied. Our focus promotes cultural awareness and attention to the social and economic conditions affecting people’s lives.",
      ],
    },
    {
      id: "reflection",
      title: "Reflection and Application",
      paragraphs: [
        "Use learning as an opportunity to examine assumptions, identify strengths and recognise development needs. Reflective activities can help you consider what you may do differently and how you will review its impact.",
      ],
    },
    {
      id: "course-information",
      title: "Clear Course Information",
      paragraphs: [
        "Before enrolling, review the course’s learning outcomes, target audience, delivery format, expected study commitment, fees and completion requirements.",
        "Where a certificate, CPD allocation or accreditation applies, the scope and requirements should be clearly stated in the individual course information.",
      ],
    },
    {
      id: "development",
      title: "Individual and Organisational Development",
      paragraphs: [
        "Choose learning aligned with your development priorities, or contact SWCL to discuss your team’s needs.",
        "For organisations, start by understanding the workforce, the practice challenges involved, and the changes you want learning to support. Any tailored programme will depend on an agreed scope and delivery arrangements.",
      ],
    },
  ],
  next: {
    title: "Find Learning That Fits Your Next Step",
    paragraphs: [
      "Visit our learning platform to explore current opportunities, review course information, and identify learning relevant to your responsibilities and goals.",
      "If you are unsure where to begin or are seeking support for a team, contact SWCL to discuss your priorities.",
    ],
    primary: { label: "Explore Our Learning Platform", href: platformHref },
    secondary: { label: "Discuss Organisational Training", href: "/contact" },
    clarification:
      "Short courses and continuing professional development support learning and practice development. They do not replace a qualifying social work programme or confer professional registration unless explicitly stated and supported.",
  },
};
