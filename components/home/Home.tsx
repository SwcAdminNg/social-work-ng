import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Heart, Mail, MapPin, Monitor, Phone, Plus, Users, Waypoints, type LucideIcon } from "lucide-react";
import HeroTabs from "./HeroTabs";
import HomeContactForm from "./HomeContactForm";
import s from "./Home.module.css";

const SERVICES = [
  {
    title: "E-Learning and Professional Development",
    text: "Developing knowledge, confidence and practical capability for people at every stage of their professional journey, from those exploring social work to experienced practitioners.",
    image: "/images/home/swcl/service-elearning.webp",
    alt: "A woman in a yellow blouse works on a laptop at a wooden desk.",
    link: { label: "Explore professional learning", href: "/courses" },
  },
  {
    title: "Research and Evaluation",
    text: "We help organisations understand their needs and strengthen their response through research, needs assessments, consultation and programme evaluation.",
    image: "/images/home/swcl/service-research.webp",
    alt: "A professional marks up printed charts and reports beside a laptop.",
    link: { label: "Explore research services", href: "/contact?topic=partnership" },
  },
  {
    title: "Policy and Advocacy",
    text: "Turning evidence and experience into clearer guidance, through policy development and review, implementation support and advocacy planning.",
    image: "/images/home/swcl/service-policy.webp",
    alt: "A white civic building with a green dome under a blue sky.",
    link: { label: "Explore policy and advocacy", href: "/contact?topic=partnership" },
  },
];

const LEARNING: { title: string; text: string; image: string; alt: string; icon: LucideIcon; link: { label: string; href: string } }[] = [
  {
    title: "Introductory and Foundation Learning",
    text: "Build a clear starting point. Explore the purpose, values and responsibilities of social work alongside the practical realities of supporting people.",
    image: "/images/home/swcl/learning-foundation.webp",
    alt: "A woman in a patterned dress studies at a laptop.",
    icon: Monitor,
    link: { label: "Explore foundation learning", href: "/courses" },
  },
  {
    title: "Continuing Professional Development",
    text: "Deepen your understanding and strengthen specific areas of practice relevant to your responsibilities and interests.",
    image: "/images/home/swcl/learning-cpd.webp",
    alt: "A group of professionals talk around a table with notebooks and a laptop.",
    icon: Users,
    link: { label: "Explore CPD opportunities", href: "/courses" },
  },
  {
    title: "Facilitated and Organisational Learning",
    text: "Develop shared understanding across your team with facilitated sessions and tailored programmes built around your service priorities.",
    image: "/images/home/swcl/learning-organisational.webp",
    alt: "An open report with charts and a pen lies on a desk beside stacked books.",
    icon: FileText,
    link: { label: "Discuss training for your team", href: "/contact?topic=partnership" },
  },
];

const CATEGORIES: { title: string; text: string; icon: LucideIcon }[] = [
  {
    title: "Professional Skills and Practice",
    text: "Strengthen your understanding of situations, your ability to work with people and your decision-making.",
    icon: Users,
  },
  {
    title: "Digital and Innovative Practice",
    text: "Use technology thoughtfully to support professional work, with care for confidentiality and accessibility.",
    icon: Waypoints,
  },
  {
    title: "Law, Policy and Advocacy",
    text: "Understand the rights, laws and policies that shape decisions and services.",
    icon: Heart,
  },
];

const FAQS: { q: string; a: string[] }[] = [
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
      "Socialworknigeria.org is Social Work Consultancy Ltd’s dedicated e-learning platform.",
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
];

export default function Home() {
  return (
    <div className={s.page}>
      <HeroTabs />

      {/* Introduction */}
      <section className={s.intro} aria-labelledby="intro-heading">
        <div className={`${s.container} ${s.introGrid}`}>
          <div className={s.introImage}>
            <Image
              src="/images/home/swcl/intro-listening.webp"
              alt="A social worker smiles and takes notes while listening to a woman across a desk."
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className={s.eyebrow}>Social Work Consultancy Ltd.</p>
            <h2 id="intro-heading" className={s.h2}>Building the Knowledge and Capacity Behind Better Services</h2>
            <p className={s.body}>
              Social Work Consultancy Ltd is a professional learning and consultancy organisation dedicated to strengthening
              social work and related services. We support the people and organisations working to improve the lives of
              children, families and communities, particularly in contexts where needs are complex and resources are limited.
            </p>
            <p className={s.body}>
              Our work brings together training and professional development, research and evaluation, policy and advocacy,
              and tailored organisational support, linking relevant international learning to Nigerian and wider Global South contexts.
            </p>
            <Link className={s.textLink} href="/about-us">
              Learn more about SWCL <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className={s.tinted} aria-labelledby="services-heading">
        <div className={s.container}>
          <header className={s.sectionHead}>
            <p className={s.eyebrow}>Our Services</p>
            <h2 id="services-heading" className={s.h2}>Connected Services for Stronger Practice and Organisations</h2>
            <p className={s.lead}>
              Learning, evidence and policy work best when they inform one another. Our three core service areas help
              individuals and organisations build capability, understand what needs to change and take practical steps.
            </p>
          </header>
          <div className={s.grid3}>
            {SERVICES.map((item) => (
              <article key={item.title} className={s.serviceCard}>
                <div className={s.serviceImage}>
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
                </div>
                <div className={s.serviceBody}>
                  <h3 className={s.h3Serif}>{item.title}</h3>
                  <p>{item.text}</p>
                  <Link className={s.textLink} href={item.link.href}>
                    {item.link.label} <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Learning and categories */}
      <section className={s.plain} aria-labelledby="learning-heading">
        <div className={s.container}>
          <header className={s.sectionHead}>
            <p className={s.eyebrow}>Learning</p>
            <h2 id="learning-heading" className={s.h2}>Learning That Strengthens What You Do in Practice</h2>
            <p className={s.lead}>
              Our learning approach connects professional knowledge with everyday responsibilities, helping learners
              understand not only what an approach involves, but when it may be useful and how context affects its application.
            </p>
          </header>
          <div className={s.grid3}>
            {LEARNING.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={s.learnCard}>
                  <div className={s.learnImage}>
                    <Image src={item.image} alt={item.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
                  </div>
                  <div className={s.learnBody}>
                    <span className={s.learnIcon} aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <h3 className={s.h3Sans}>{item.title}</h3>
                    <p>{item.text}</p>
                    <Link className={s.textLink} href={item.link.href}>
                      {item.link.label} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <header className={`${s.sectionHead} ${s.subHead}`}>
            <p className={s.eyebrow}>Our Course Categories</p>
            <h2 className={s.h2}>Explore Learning That Reflects Your Responsibilities</h2>
            <p className={s.lead}>
              Our learning priorities bring together core practice skills, responsible use of digital tools, and an
              understanding of the laws and policies that shape services.
            </p>
          </header>
          <div className={s.grid3}>
            {CATEGORIES.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={s.categoryCard}>
                  <Icon className={s.categoryIcon} size={38} aria-hidden="true" />
                  <div>
                    <h3 className={s.h3Sans}>{item.title}</h3>
                    <p>{item.text}</p>
                    <Link className={s.textLink} href="/courses">
                      View courses <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={s.ctaBand}>
            <div>
              <h2 className={s.ctaTitle}>Invest in Your Development. Strengthen Your Contribution.</h2>
              <p>Explore current learning opportunities and choose learning that fits your role and development goals.</p>
            </div>
            <Link className={s.btnGold} href="/courses">
              Visit Our Learning Platform <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className={s.tinted} aria-labelledby="faq-heading">
        <div className={`${s.container} ${s.faqGrid}`}>
          <div>
            <p className={s.eyebrow}>FAQs</p>
            <h2 id="faq-heading" className={s.h2}>Understanding SWCL and How We Can Support You</h2>
            <p className={s.body}>
              Find answers to common questions about our services, learning opportunities and how to work with us.
            </p>
          </div>
          <div className={s.faqList}>
            {FAQS.map((item) => (
              <details key={item.q} className={s.faqItem}>
                <summary>
                  <span>{item.q}</span>
                  <Plus className={s.faqPlus} size={18} aria-hidden="true" />
                </summary>
                <div className={s.faqAnswer}>
                  {item.a.map((para) => <p key={para}>{para}</p>)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={s.plain} aria-labelledby="contact-heading">
        <div className={`${s.container} ${s.contactGrid}`}>
          <div>
            <p className={s.eyebrow}>Get in Touch</p>
            <h2 id="contact-heading" className={s.h2}>Let Us Turn Your Priorities into a Practical Plan</h2>
            <p className={s.body}>
              Whether you are developing your workforce, exploring a research question, reviewing a policy or seeking a
              partner, tell us about the issue you want to address. You do not need a fully developed brief to start a conversation.
            </p>
            <ul className={s.contactList}>
              <li><MapPin size={20} aria-hidden="true" /> Flat C3, Okonkwo Estate, Jos, Plateau State, Nigeria</li>
              <li>
                <Mail size={20} aria-hidden="true" />
                <a href="mailto:support@socialworknigeria.org">support@socialworknigeria.org</a>
              </li>
              <li>
                <Phone size={20} aria-hidden="true" />
                <a href="tel:+2348064047702">+234 806 404 7702</a>
              </li>
            </ul>
          </div>
          <HomeContactForm />
        </div>
      </section>
    </div>
  );
}
