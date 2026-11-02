import type { EnquiryFormConfig } from "@/components/shared/EnquiryForm";

// Copy for the Mentorship Programme page, carried over from the page it
// replaces and arranged in the home page design.

export const opening = {
  eyebrow: "Mentorship programme",
  title: "Mentorship",
  tagline: "Empowering the Next Generation of Social Work Professionals",
  image: "/images/home/swcl/learners-together.webp",
  imageWidth: 1800,
  imageHeight: 1013,
  imageAlt: "A group of learners working together around a table",
};

export const intro = {
  eyebrow: "Why mentorship",
  title: "Walking Alongside You as You Grow",
  paragraphs: [
    "At Social Work Nigeria, we believe that mentorship is key to developing a skilled, ethical, and confident social services workforce.",
    "Our Mentorship Programme is designed to support social work students, recent graduates, and early-career professionals in their personal and professional growth.",
    "Whether you're preparing for your first field placement, considering postgraduate study, or seeking career guidance, our mentors are here to walk alongside you, offering insight, encouragement, and practical tools.",
  ],
};

export const offerings = {
  eyebrow: "What we offer",
  title: "Support Shaped Around Your Next Step",
  items: [
    {
      title: "One-to-One Mentorship",
      text: "Personalised support from experienced social workers, consultants, and academics who understand your challenges and opportunities. Our tailored sessions aim to empower you and foster your growth.",
    },
    {
      title: "Placement and Academic Support",
      text: "Guidance on preparing for field education, reflective writing, critical analysis, and linking theory to practice is invaluable for students undertaking Practice Learning modules or preparing research assignments.",
    },
    {
      title: "International Opportunities Advice",
      text: "Thinking of studying or working abroad? Our mentors can advise on UK university applications, scholarships, CPD pathways, and on aligning your goals with global standards in social work.",
    },
    {
      title: "Professional Networking",
      text: "Join a vibrant community of practitioners and thought leaders through our alumni network, webinars, and events. We foster peer learning and collaboration across disciplines and borders, helping you feel connected and supported.",
    },
    {
      title: "Career Coaching",
      text: "Need help with job applications, CV writing, or interview preparation? Our mentors will support you in identifying your strengths, mapping your career path, and building confidence in your next steps.",
    },
  ],
};

export const join = {
  eyebrow: "Joining the programme",
  title: "Who Can Join and How It Works",
  whoLead: "Our mentorship programme is open to:",
  who: [
    "Social work students in Nigeria and across Africa",
    "Early-career professionals seeking guidance",
    "Individuals preparing for postgraduate or international study",
    "Alumni of our training or CPD programmes",
  ],
  steps: [
    {
      title: "Submit an Expression of Interest",
      text: "Please fill out a simple form indicating your interests, goals, and availability to make it easy for you to start your mentorship journey.",
    },
    {
      title: "Get Matched",
      text: "We will match you with a mentor based on your needs and area of interest.",
    },
    {
      title: "Start Your Journey",
      text: "Meet virtually (or in-person where possible) for structured sessions and ongoing support.",
    },
  ],
  button: { label: "Express Your Interest", href: "#mentor-form" },
};

export const becomeMentor = {
  eyebrow: "Get involved",
  title: "Become a Mentor",
  paragraphs: [
    "Are you a qualified social worker, educator, or experienced practitioner? We welcome expressions of interest from those keen to give back by mentoring the next generation. Training and orientation will be provided.",
  ],
  whyTitle: "Why Mentorship Matters",
  why: "Mentorship bridges learning and practice. It builds confidence, nurtures leadership, and supports ethical, informed decision-making in complex environments. As we work to transform social services across Nigeria and the Global South, mentorship is among the most powerful tools we have.",
};

export const form: EnquiryFormConfig = {
  heading: "Mentorship enquiry",
  replyNote: "For mentees and mentors alike. We reply by email, or by telephone if you give us a number.",
  defaultSubject: "Mentorship enquiry",
  messageLabel: "Tell us about yourself",
  messagePrompt:
    "Say whether you are looking for a mentor or offering to be one, your interests and goals, and your availability.",
  notice:
    "Please avoid including confidential case details or sensitive personal information in your first message.",
  button: "Send Enquiry",
  category: "mentorship",
  sourcePage: "/mentorship",
  confirmation: {
    title: "Thank you. Your mentorship enquiry has been received.",
    text: "We will read it and get back to you to discuss the next step.",
  },
};
