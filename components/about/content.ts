// Copy for the About Us page, taken from the SWCL About Us developer
// handover (25 October 2026). Section labels here decide placement only;
// the wording is published as written.

const IMG = "/images/about-us";
const HOME_IMG = "/images/home/swcl";

export const opening = {
  eyebrow: "About SWCL",
  // Rendered as a light opening word and a bold organisation name.
  titleLead: "About",
  titleBold: "Social Work Consultancy Ltd",
  tagline: "Strengthening people, practice and social services.",
  paragraphs: [
    "Social Work Consultancy Ltd supports the people and organisations working to improve the lives of children, families and communities.",
    "Through professional learning, research, policy and consultancy, we help connect knowledge to action, supporting thoughtful practice and stronger organisations and services that respond to the people who use them.",
  ],
  image: `${IMG}/facilitating-discussion.webp`,
  imageAlt:
    "Four professionals discuss practice around a table, with a woman facilitating the conversation.",
  imageNote: "Illustrative image",
  // Short facts drawn from the page copy and the handover.
  facts: [
    { label: "Based in", value: "Jos, Plateau State, Nigeria" },
    { label: "Working across", value: "Nigeria and the wider Global South" },
    { label: "Learning platform", value: "socialworknigeria.org", href: "/courses" },
  ],
};

export const vision = {
  label: "Our Vision",
  statement:
    "A future in which people can access ethical, inclusive and effective social services, supported by confident practitioners, responsive organisations and policies that protect rights and promote wellbeing.",
};

export const mission = {
  label: "Our Mission",
  statement:
    "To strengthen social work and related services through practical learning, research, policy and consultancy that link professional knowledge to local realities.",
  paragraph:
    "We support individuals and organisations in developing their capabilities, making informed decisions and improving their response to children, families and communities.",
};

export type Chapter = {
  id: string;
  title: string;
  paragraphs: string[];
  image: string;
  imageAlt: string;
  // Focal point kept in view when the photograph is cropped tall.
  focus: string;
};

export const purpose = {
  eyebrow: "Our purpose",
  title: "Why We Exist and How We Work",
  paragraphs: [
    "People working in social work and related services often face complex responsibilities. They must respond to competing needs, work within limited resources and make decisions that can have a lasting impact on people’s lives. Access to relevant learning, reliable evidence, and practical organisational support can make a meaningful difference.",
    "Social Work Consultancy Ltd exists to support that development. We bring together professional learning and consultancy to help practitioners and organisations connect what they know with their practice.",
    "Our focus is on strengthening the conditions that enable better practice: knowledgeable people, reflective decision-making, clear policies, and services informed by the experiences of those they support.",
  ],
  chapters: [
    {
      id: "learning",
      title: "Connecting Learning with Practice",
      paragraphs: [
        "We believe professional development should help people think more clearly, ask better questions and act with greater confidence in their responsibilities.",
        "Our approach encourages learners to explore realistic situations, reflect on their assumptions and consider how knowledge applies to their own setting. We recognise that development continues through experience, feedback, collaboration and reflection.",
        "Socialworknigeria.org is the dedicated e-learning platform of Social Work Consultancy Ltd. It supports the training and professional development aspects of our work, alongside SWCL’s wider research, policy, advocacy and consultancy services.",
      ],
      image: `${HOME_IMG}/elearning.webp`,
      imageAlt: "A practitioner studying online at a laptop",
      focus: "40% 40%",
    },
    {
      id: "evidence",
      title: "Bringing Evidence into Decisions",
      paragraphs: [
        "Organisations need to understand the communities they serve, the challenges people face, and whether their programmes are achieving their intended purpose.",
        "Our research and evaluation support this understanding. We emphasise clear questions, appropriate methods and findings that can inform practical decisions.",
        "We also recognise the importance of listening to people with lived experience. Their perspectives can reveal barriers, strengths and priorities that organisational information alone may overlook.",
      ],
      image: `${HOME_IMG}/research.webp`,
      imageAlt: "A researcher reviewing printed charts and findings at a desk",
      focus: "45% 55%",
    },
    {
      id: "policy",
      title: "Supporting Policy and Organisational Development",
      paragraphs: [
        "Policies shape professional expectations, access to support, and how organisations respond to need. Their value depends on how clearly they are understood and how effectively they can be implemented.",
        "Through policy and consultancy work, we help organisations examine their approaches, identify development priorities, and consider practical improvements. Our advocacy approach connects evidence with participation, helping organisations communicate issues and engage relevant stakeholders.",
      ],
      image: `${HOME_IMG}/policy.webp`,
      imageAlt: "The National Assembly building in Abuja under a clear sky",
      focus: "60% 50%",
    },
    {
      id: "context",
      title: "Grounded in Local Context",
      paragraphs: [
        "Our work focuses on Nigeria and the wider Global South, drawing on relevant international knowledge while recognising the importance of local insight.",
        "Culture, language, family and community relationships, economic circumstances, and available services all shape practice. We encourage approaches that take these realities seriously and respond respectfully to those involved.",
        "We welcome engagement with social workers, students, educators, carers, NGOs, community organisations, public institutions and professionals in related fields. We start by understanding their responsibilities, priorities, and support needs.",
      ],
      image: `${HOME_IMG}/listening-with-care.webp`,
      imageAlt: "A social worker listening attentively to a woman across a desk",
      focus: "66% 40%",
    },
  ] satisfies Chapter[],
  // The text linked to the learning platform wherever it appears.
  platformName: "Socialworknigeria.org",
  platformHref: "/courses",
  invitation: {
    label: "An invitation",
    title: "Work with SWCL",
    paragraphs: [
      "Whether you are developing your professional knowledge, strengthening a team, exploring a research question, or reviewing an organisational approach, we welcome a conversation about your priorities.",
      "Together, we can clarify your objectives and identify where SWCL can contribute.",
    ],
    button: { label: "Discuss Your Needs", href: "/contact" },
  },
};

export const values = {
  eyebrow: "Our values",
  title: "The Values That Guide Our Work",
  intro:
    "Our values guide how we develop learning, approach consultancy and collaborate with individuals, organisations and communities.",
  items: [
    {
      title: "Respect for Human Dignity",
      statement:
        "Every person has inherent worth and the right to be treated respectfully.",
      text: "We encourage approaches that listen to people, recognise their strengths and support their participation in decisions that affect their lives. This includes respecting privacy, communicating sensitively and avoiding language or assumptions that reduce people to their difficulties.",
    },
    {
      title: "Social Justice and Equity",
      statement:
        "Social, economic, and structural conditions shape people’s opportunities and access to support.",
      text: "We raise awareness of inequality and discrimination and encourage practitioners and organisations to examine who may be excluded from services. Our work supports fairer approaches that recognise diverse needs and the barriers people face.",
    },
    {
      title: "Professionalism and Ethics",
      statement:
        "Professional credibility depends on integrity, sound judgement and accountability.",
      text: "We promote reflective practice, appropriate boundaries and the responsible use of knowledge and evidence. We recognise the importance of working within competence, acknowledging uncertainty and seeking further expertise when necessary.",
    },
    {
      title: "Inclusion and Diversity",
      statement:
        "Effective services must recognise and respond to diverse experiences, identities and ways of communicating.",
      text: "We seek to ensure our learning and professional engagement are accessible, respectful and culturally relevant. We value diverse perspectives and encourage organisations to consider how disability, language, gender, age and other circumstances may affect participation.",
    },
    {
      title: "Transparency and Accountability",
      statement:
        "Trust grows when people understand what to expect and how decisions are made.",
      text: "We aim to communicate clearly about the purpose, scope and limitations of our work. We value feedback, take responsibility for agreed commitments, and use learning to review and improve our approaches.",
    },
  ],
};
