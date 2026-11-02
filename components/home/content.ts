// Homepage copy, taken from the SWCL Homepage Content and Developer Handover
// (25 October 2026). Keep wording in sync with that document.

const IMG = "/images/home/swcl";

export type Photo = { src: string; alt: string };

export type HeroSlide = {
  id: string;
  tab: string;
  headline: string[];
  paragraphs: string[];
  image: string;
  imageAlt: string;
  // Focal point used where the photo is cropped tightly (phones).
  focus: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

export const heroSlides: HeroSlide[] = [
  {
    id: "home",
    tab: "Home",
    headline: [
      "Strengthening Practice",
      "Developing People",
      "Improving Social Services",
    ],
    paragraphs: [
      "Social Work Consultancy Ltd supports individuals and organisations in strengthening professional practice, developing their workforce and improving services for children, families and communities.",
      "Through training, research, policy and advocacy, we connect professional knowledge with practical approaches to meet local needs across Nigeria and the wider Global South.",
    ],
    image: `${IMG}/hero-collaboration.webp`,
    imageAlt: "A group of professionals reviewing work together around a laptop",
    focus: "52% 28%",
    primary: { label: "Explore Our Services", href: "#services" },
    secondary: {
      label: "Discuss Your Organisation’s Needs",
      href: "#contact",
    },
  },
  {
    id: "e-learning",
    tab: "E-Learning",
    headline: ["Professional Learning with a Practical Purpose"],
    paragraphs: [
      "Develop the knowledge, skills and confidence to make informed decisions, respond to complex situations and work more effectively with people.",
      "Explore Social Work Consultancy Ltd’s dedicated e-learning platform, designed to connect social work principles with the realities of practice.",
    ],
    image: `${IMG}/elearning.webp`,
    imageAlt: "A professional completing an online course on a laptop",
    focus: "47% 35%",
    primary: { label: "Explore Our Learning Platform", href: "/courses" },
  },
  {
    id: "research",
    tab: "Research",
    headline: ["Understand Needs", "Generate Evidence", "Improve Decisions"],
    paragraphs: [
      "Good services begin with a clear understanding of people’s experiences and priorities.",
      "Our research and evaluation services help organisations ask the right questions, understand their findings and use evidence to strengthen programmes and service delivery.",
    ],
    image: `${IMG}/research-together.webp`,
    imageAlt: "Two researchers reviewing printed charts together at a desk",
    focus: "40% 35%",
    primary: {
      label: "Explore Research and Evaluation",
      href: "#service-research",
    },
  },
  {
    id: "policy",
    tab: "Policy and Advocacy",
    headline: ["Supporting Better Policy and Meaningful Participation"],
    paragraphs: [
      "Policies shape how people access support, how professionals work and how organisations respond to need.",
      "We support policy development and advocacy that bring together evidence, professional experience and the perspectives of those affected by decisions.",
    ],
    image: `${IMG}/policy.webp`,
    imageAlt: "A white civic building with a green dome surrounded by trees",
    focus: "61% 35%",
    primary: { label: "Explore Policy and Advocacy", href: "#service-policy" },
  },
];

export const intro = {
  eyebrow: "Introduction to SWCL",
  title: "Building the Knowledge and Capacity Behind Better Services",
  image: `${IMG}/listening-with-care.webp`,
  imageAlt: "A practitioner listening carefully and taking notes during a meeting",
  paragraphs: [
    "Social Work Consultancy Ltd is a professional learning and consultancy organisation dedicated to strengthening social work and related services. We support the people and organisations working to improve the lives of children, families and communities, particularly in contexts where needs are complex, and resources are limited.",
    "Our work brings together training and professional development, research and evaluation, policy and advocacy, and tailored organisational support. These services share a common purpose: to help people make informed decisions, strengthen practice, and develop more responsive, inclusive services.",
    "We recognise that effective social work must be rooted in the communities it serves. Culture, family relationships, economic circumstances, disability, inequality and access to services all shape people’s experiences. Our approach links relevant international learning to Nigerian and wider Global South contexts, encouraging thoughtful application rather than assuming that one approach will suit every setting.",
    "We work with social workers, students, educators, carers, NGOs, community organisations and institutions whose responsibilities bring them into contact with children, families and people facing disadvantage.",
    "Across our work, we promote respect for human dignity, social justice, safeguarding, professional accountability and meaningful participation. We believe people should have opportunities to influence the services and decisions that affect their lives.",
  ],
  // The five commitments named in the final paragraph, shown as a strip.
  values: [
    "Human dignity",
    "Social justice",
    "Safeguarding",
    "Professional accountability",
    "Meaningful participation",
  ],
  button: { label: "Learn More About SWCL", href: "/about-us" },
};

export type ServiceCard = {
  id: string;
  title: string;
  tagline: string;
  image: string;
  imageAlt: string;
  paragraphs: string[];
  button: { label: string; href: string };
};

export const services = {
  eyebrow: "Three core service areas",
  title: "Connected Services for Stronger Practice and Organisations",
  intro:
    "Learning, evidence and policy work best when they inform one another. Our three core service areas help individuals and organisations build capability, understand what needs to change and take practical steps.",
  items: [
    {
      id: "service-learning",
      title: "E-Learning and Professional Development",
      tagline: "Developing knowledge, confidence and practical capability.",
      image: `${IMG}/digital-collaboration.webp`,
      imageAlt:
        "Three colleagues planning learning resources together with tablets",
      paragraphs: [
        "Our learning services support people at different stages of their professional journey, from those exploring social work to experienced practitioners and organisations developing their workforce.",
        "Through our dedicated platform, socialworknigeria.org, we provide a home for professional learning that connects key concepts to real-world practice. Our approach encourages learners to reflect, question assumptions and consider how their learning applies to their own role and setting.",
        "Organisations can also discuss their learning needs with us, including induction, practice development and training aligned with specific service priorities.",
      ],
      button: { label: "Explore Professional Learning", href: "/courses" },
    },
    {
      id: "service-research",
      title: "Research and Evaluation",
      tagline:
        "We help organisations understand their needs and strengthen their response.",
      image: `${IMG}/research.webp`,
      imageAlt: "A professional reviewing printed charts and reports",
      paragraphs: [
        "Relevant evidence helps organisations decide where to focus resources, how to design services, and whether their work achieves the intended impact.",
        "We support research, needs assessments, stakeholder consultation and programme evaluation. Our approach emphasises clear questions, appropriate methods and findings that people can understand and use.",
        "From exploring barriers to accessing services to reviewing programme implementation, we help organisations turn evidence into practical recommendations.",
      ],
      button: { label: "Explore Research Services", href: "#contact" },
    },
    {
      id: "service-policy",
      title: "Policy and Advocacy",
      tagline: "Turning evidence and experience into clearer guidance.",
      image: `${IMG}/policy-consultation.webp`,
      imageAlt:
        "An inclusive policy consultation around a table, with participants listening and taking notes",
      paragraphs: [
        "We support organisations in developing and reviewing policies, understanding implementation challenges and planning advocacy on issues affecting people’s rights and wellbeing.",
        "Our approach considers both the written policy and the conditions required to implement it. This includes professional responsibilities, organisational capacity, local context and the experiences of the people the policy is intended to support.",
        "We also help organisations communicate their evidence and priorities through policy briefs, consultations and stakeholder engagement.",
      ],
      button: { label: "Explore Policy and Advocacy", href: "#contact" },
    },
  ] satisfies ServiceCard[],
};

export const learningApproach = {
  eyebrow: "Learning and professional development",
  title: "Learning That Strengthens What You Do in Practice",
  paragraphs: [
    "Social work and related professions require more than theoretical understanding. Practitioners need to communicate sensitively, recognise risk, weigh different perspectives, and make decisions that they can explain and reflect on.",
    "Social Work Consultancy Ltd’s learning approach connects professional knowledge with these everyday responsibilities. We aim to help learners understand not only what an approach involves, but also when it may be useful, how context affects its application and what its limitations might be.",
  ],
  platform: {
    name: "socialworknigeria.org",
    image: `${IMG}/cpd-training.webp`,
    imageAlt: "Professionals in a group discussion around a table",
    paragraphs: [
      "Our dedicated e-learning platform, socialworknigeria.org, is SWCL's training arm. It brings together learning opportunities for individuals and organisations seeking to strengthen ethical, informed, and culturally relevant practice.",
      "Learning activities may include case scenarios, guided reflection, knowledge checks and practical exercises, with the format detailed in each course description.",
    ],
  },
  supports: "Our learning approach supports you to:",
  outcomes: [
    {
      title: "Connect knowledge with action",
      text: "Consider how social work theories, values and methods inform practical decision-making.",
    },
    {
      title: "Strengthen professional judgement",
      text: "Explore how to assess information, recognise uncertainty, and explain the reasoning behind your decisions.",
    },
    {
      title: "Listen and communicate effectively",
      text: "Develop approaches that respect people’s experiences, communication needs and their right to participate.",
    },
    {
      title: "Recognise safeguarding concerns",
      text: "Build awareness of harm, vulnerability and protective factors, and of the responsibilities and limits of your role.",
    },
    {
      title: "Work with cultural awareness",
      text: "Examine how identity, beliefs, inequality and social circumstances shape people’s experiences.",
    },
    {
      title: "Develop reflective practice",
      text: "Review your responses, recognise learning needs, and use feedback to improve.",
    },
    {
      title: "Work collaboratively",
      text: "Understand the contributions of families, communities and other professionals to coordinated support.",
    },
  ],
  closing:
    "Whether you are beginning your learning journey or developing an established team, we aim to ensure professional development is relevant to the work you do and the people you support.",
};

export const learningOptions: ServiceCard[] = [
  {
    id: "foundation",
    title: "Introductory and Foundation Learning",
    tagline: "Build a clear starting point for further development.",
    image: `${IMG}/foundation-learning.webp`,
    imageAlt: "A learner with headphones studying on a laptop",
    paragraphs: [
      "Explore the purpose, values and responsibilities of social work alongside the practical realities of supporting people.",
      "Foundation learning is intended to help students, new entrants and those in related roles develop a clearer understanding of the profession and identify areas for further study.",
      "Each course should explain whom it is designed for and any prior knowledge or experience required before enrolling.",
    ],
    button: { label: "Explore Foundation Learning", href: "/courses" },
  },
  {
    id: "cpd",
    title: "Continuing Professional Development",
    tagline:
      "Deepen your understanding and strengthen specific areas of practice.",
    image: `${IMG}/cpd-training.webp`,
    imageAlt: "Professionals in a group discussion around a table",
    paragraphs: [
      "Explore focused learning in areas relevant to your responsibilities, interests and professional development.",
      "Our CPD approach encourages you to connect your learning with your experience, consider what you might do differently, and reflect on the difference this could make to the people you work with.",
      "Individual course information sets out the learning outcomes, expected commitment, assessment arrangements, and any applicable certificate or accreditation.",
    ],
    button: { label: "Explore CPD Opportunities", href: "/courses" },
  },
  {
    id: "organisational",
    title: "Facilitated and Organisational Learning",
    tagline: "Develop shared understanding across your team.",
    image: `${IMG}/organisational-learning.webp`,
    imageAlt: "Stacked books and an open workbook on a desk",
    paragraphs: [
      "Organisations often need learning to address a specific service, workforce, or practice challenge.",
      "We welcome discussions about facilitated sessions and tailored learning programmes that foster shared reflection, practical application and clearer expectations within teams.",
      "Depending on the agreed brief, this may include case discussions, workshops, learning resources and activities that help staff link training to their day-to-day responsibilities.",
    ],
    button: { label: "Discuss Training for Your Team", href: "#contact" },
  },
];

export const learningCategories = {
  eyebrow: "Learning categories",
  title: "Explore Learning That Reflects Your Responsibilities",
  intro: [
    "Our learning priorities bring together core practice skills, responsible use of digital tools, and an understanding of the laws and policies that shape services.",
    "These areas help learners identify relevant development opportunities. Current courses, availability and entry requirements are listed on our learning platform.",
  ],
  themesLabel: "Learning themes include",
  items: [
    {
      id: "skills",
      title: "Professional Skills and Practice",
      tagline:
        "Strengthen your understanding of situations, your ability to work with people and your decision-making.",
      text: "This area focuses on the foundations and practical skills required for effective work with individuals, families and communities. It encourages learners to consider people’s strengths alongside their difficulties, recognise the influence of wider social conditions, and respond within the scope of their role.",
      themes: [
        "Introduction to social work principles, values and practice",
        "Communication and relationship-based work",
        "Assessment, analysis and professional judgement",
        "Child protection and safeguarding",
        "Mental health and psychosocial wellbeing",
        "Disability inclusion and accessible support",
        "Family support and community engagement",
        "Professional boundaries, recording and reflective practice",
      ],
    },
    {
      id: "digital",
      title: "Digital and Innovative Practice",
      tagline: "Use technology thoughtfully to support professional work.",
      text: "Digital tools can improve access to learning, communication and information. Their value depends on how they are used and on whether they meet the needs of those involved. This area explores practical digital skills alongside questions of confidentiality, accessibility, accuracy and professional accountability. It encourages learners to assess the opportunities and limitations of new tools.",
      themes: [
        "Digital confidence in social work and related services",
        "Clear and purposeful electronic case recording",
        "Information management and confidentiality",
        "Professional communication through digital channels",
        "Responsible use of AI and emerging technologies",
        "Assessing the quality and reliability of online information",
        "Digital exclusion and barriers to access",
        "Ethical boundaries in social media and online engagement",
      ],
    },
    {
      id: "law",
      title: "Law, Policy and Advocacy",
      tagline: "Understand the frameworks that shape decisions and services.",
      text: "Professionals need to understand how rights, law, policy and organisational procedures affect their work. This area supports learners in exploring relevant frameworks, recognising the importance of working within their competence and considering how evidence and professional experience can contribute to policy improvement.",
      themes: [
        "Human rights, social justice and professional responsibilities",
        "Children’s rights and safeguarding frameworks",
        "Relevant Nigerian laws and social welfare policies",
        "The relationship between policy and everyday practice",
        "Equality, inclusion and access to services",
        "Policy analysis and consultation",
        "Advocacy planning and stakeholder engagement",
        "Community participation in decisions and service development",
      ],
    },
  ],
};

export const learningCta = {
  title: "Invest in Your Development. Strengthen Your Contribution.",
  paragraphs: [
    "Professional learning is most valuable when it helps you respond more thoughtfully and effectively to the people and situations you encounter.",
    "Visit our learning platform to explore current opportunities, understand what each course offers, and choose learning that fits your role and development goals.",
  ],
  organisations:
    "For organisations, we can begin with a conversation about your workforce, service priorities and the changes you want learning to support.",
  button: { label: "Visit Our Learning Platform", href: "/courses" },
};

export const faqs = {
  eyebrow: "Frequently asked questions",
  title: "Understanding SWCL and How We Can Support You",
  items: [
    {
      q: "What does Social Work Consultancy Ltd do?",
      a: [
        "SWCL provides professional learning and consultancy services focused on social work and related fields. Our core areas are training and development, research and evaluation, and policy and advocacy.",
        "We support individuals in developing their professional capability and organisations seeking to strengthen their people, programmes and approaches.",
      ],
    },
    {
      q: "Who are your services designed for?",
      a: [
        "Our services are for social workers, students, educators, carers, NGOs, community organisations, public institutions, and professionals in related fields.",
        "Suitability depends on the service or course. We encourage prospective clients and learners to review the relevant information or contact us to discuss their needs.",
      ],
    },
    {
      q: "What is the relationship between SWCL and socialworknigeria.org?",
      a: [
        "Socialworknigeria.org is Social Work Consultancy Ltd.’s dedicated e-learning platform.",
        "SWCL is the wider organisation, providing training alongside research, policy, advocacy and consultancy services. The platform supports the professional learning aspect of this work.",
      ],
    },
    {
      q: "Do your courses lead to a professional social work qualification?",
      a: [
        "The status and purpose of each course should be checked in its individual description.",
        "Short courses and CPD activities support learning and professional development. They should not be assumed to replace a qualifying social work programme or to meet professional registration requirements unless this is explicitly stated and supported.",
      ],
    },
    {
      q: "Are your courses accredited?",
      a: [
        "Accreditation applies to specific courses or programmes as stated. Please check the individual course description for the accrediting body, the scope of recognition and any available certificate.",
        "Contact us before enrolling if you need to confirm whether a course meets a particular employer, professional or educational requirement.",
      ],
    },
    {
      q: "Can you develop training around our organisation’s needs?",
      a: [
        "We welcome enquiries regarding tailored learning.",
        "We begin by discussing your team’s roles, existing knowledge, practice challenges and desired outcomes. This helps establish whether we can provide suitable support and what the learning should cover.",
      ],
    },
    {
      q: "What research and evaluation services can we discuss with you?",
      a: [
        "Enquiries may relate to needs assessments, stakeholder consultations, programme evaluations, research studies, and the development of practical reports or recommendations.",
        "Before agreeing to a project, we clarify its purpose, questions, methods, timescale, responsibilities and intended use.",
      ],
    },
    {
      q: "How can SWCL support policy and advocacy work?",
      a: [
        "We welcome discussions on policy development and review, consultation, policy briefs, advocacy planning and stakeholder engagement.",
        "The scope is agreed upon your objectives, the available evidence, the people affected and the expertise required.",
      ],
    },
    {
      q: "How do you approach work with different communities and organisations?",
      a: [
        "We seek to understand the context before recommending an approach.",
        "This includes considering cultural context, language, accessibility, local resources, and the perspectives of those affected by the work. We encourage participation and create space to question assumptions.",
      ],
    },
    {
      q: "How can an organisation partner with SWCL?",
      a: [
        "Potential areas for collaboration include professional learning, research, resource development, knowledge exchange, and initiatives that widen access to development opportunities.",
        "Contact us with your organisation’s priorities and the contribution you would like to make. We can then explore shared objectives, responsibilities and a suitable scope of work.",
      ],
    },
    {
      q: "How do we get started?",
      a: [
        "Send an enquiry explaining what you need, who the work will support, and any timescale you have in mind.",
        "We will use this information to discuss the request, clarify expectations, and identify an appropriate next step.",
      ],
    },
  ],
};

export const contact = {
  eyebrow: "Contact and enquiry",
  title: "Let Us Turn Your Priorities into a Practical Plan",
  paragraphs: [
    "Are you developing your workforce, exploring a research question, reviewing a policy, or seeking a partner?",
    "We welcome conversations with individuals and organisations seeking thoughtful, practical support to strengthen their work.",
    "Tell us about the issue you want to address, the people or communities involved, and what a useful outcome would look like. You do not need a fully developed brief to start a conversation.",
  ],
  notice:
    "Please avoid including confidential case details or sensitive personal information in your initial enquiry.",
  organisation: "Social Work Consultancy Ltd",
  address: "Flat C3, Okonkwo Estate, Jos, Plateau State, Nigeria",
  phone: "+234 806 404 7702",
  messagePrompt:
    "Tell us about your needs, the support you are seeking, and any preferred timescale.",
  button: "Send Your Enquiry",
};

// Section index shown down the right-hand edge on large screens.
export const sectionIndex = [
  { id: "about", label: "Introduction" },
  { id: "services", label: "Services" },
  { id: "learning", label: "Learning" },
  { id: "learning-options", label: "Ways to learn" },
  { id: "learning-areas", label: "Learning areas" },
  { id: "faqs", label: "FAQs" },
  { id: "contact", label: "Contact" },
];
