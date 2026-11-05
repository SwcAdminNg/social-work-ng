import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  Earth,
  GraduationCap,
  HandHeart,
  Info,
  Library,
  Lightbulb,
  MessagesSquare,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import s from "./About.module.css";

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "Students and graduates",
    text: "Social work students and recent graduates developing their professional foundations.",
  },
  {
    icon: UsersRound,
    title: "Social work practitioners",
    text: "Practitioners seeking to strengthen their knowledge, confidence and reflective skills.",
  },
  {
    icon: HandHeart,
    title: "Caregivers and educators",
    text: "Caregivers, educators and other support professionals seeking learning relevant to their roles.",
  },
  {
    icon: Building2,
    title: "Organisations and teams",
    text: "Organisations investing in the development of their staff and services.",
  },
];

const SUPPORT = [
  {
    icon: BookOpen,
    title: "Practical learning",
    text: "Courses that help learners explore professional knowledge and apply it in realistic practice situations.",
    href: "/courses",
    cta: "Browse courses",
  },
  {
    icon: MessagesSquare,
    title: "Mentorship",
    text: "Guided discussion and reflection focused on individual learning and professional development goals.",
    href: "/mentorship",
    cta: "Explore mentorship",
  },
  {
    icon: Library,
    title: "Resources",
    text: "Learning materials that encourage ongoing reflection and development beyond individual sessions.",
    href: "/resources",
    cta: "View resources",
  },
];

const VALUES = [
  {
    icon: Scale,
    title: "Human rights and social justice",
    text: "Respecting dignity, recognising inequality and promoting fair and inclusive practice.",
  },
  {
    icon: ShieldCheck,
    title: "Safeguarding and accountability",
    text: "Keeping people’s safety and wellbeing central while promoting responsible professional judgement.",
  },
  {
    icon: Earth,
    title: "Cultural relevance",
    text: "Connecting learning to the realities of Nigeria and the wider communities our learners serve.",
  },
  {
    icon: Lightbulb,
    title: "Evidence and reflection",
    text: "Encouraging learners to examine assumptions, draw on relevant knowledge, and learn from experience.",
  },
];

function Leaf({ className }: { className: string }) {
  return (
    <svg className={cx(s.leaf, className)} viewBox="0 0 120 160" fill="currentColor" aria-hidden="true">
      <path d="M60 158C58 120 40 92 14 70 34 64 52 72 60 88 60 56 46 30 22 10c30 2 50 26 46 62 8-22 26-36 48-38-6 30-26 52-52 60 4 22 4 44-4 74Z" />
    </svg>
  );
}

export default function About() {
  return (
    <div className={s.page}>
      {/* Opening introduction */}
      <section className={s.hero} aria-labelledby="about-heading">
        <div className={s.heroCopy}>
          <h1 id="about-heading">About Social Work Consultancy Ltd</h1>
          <p className={s.heroLead}>
            Supporting the development of ethical, skilled and culturally relevant social work
            practice in Nigeria and across the Global South.
          </p>
          <p className={s.heroBody}>
            We adopt a practice-focused approach to professional learning, mentorship and capacity
            building for people and organisations that support children, families and communities.
          </p>
          <div className={s.buttons}>
            <Link href="/courses" className={cx(s.button, s.primary)}>
              Explore Courses <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={cx(s.button, s.outline)}>
              Contact Us
            </Link>
          </div>
          <Leaf className={s.heroLeaf} />
        </div>
        <div className={s.heroMedia}>
          <Image
            src="/images/about/training-workshop.webp"
            alt="A facilitator leads a small group discussion beside a flip chart in a bright training room."
            fill
            priority
            sizes="(min-width: 1024px) 54vw, 100vw"
          />
          <span className={s.chip}>Illustrative image</span>
        </div>
      </section>

      {/* Our learning platform · Why we do this */}
      <section className={s.section} aria-label="Our platform and purpose">
        <div className={cx(s.container, s.duo)}>
          <div className={s.reveal}>
            <h2 className={s.heading}>Our learning platform</h2>
            <p>
              Socialworknigeria.org is the e-learning platform of Social Work Consultancy Ltd,
              supporting our training and professional development strand. It connects social work
              knowledge with practical learning that reflects local contexts and draws on broader
              professional principles.
            </p>
            <p>
              On this platform, learners can explore courses, mentorship and resources to support
              their professional development. For information about the wider work of Social Work
              Consultancy Ltd, visit{" "}
              <a href="https://socialwork-consultancy.com" target="_blank" rel="noopener noreferrer">
                socialwork-consultancy.com
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </div>
          <div className={s.reveal}>
            <h2 className={s.heading}>Why we do this</h2>
            <p>
              People working with children, families and communities need opportunities to deepen
              their knowledge, reflect on difficult decisions and develop their practice.
            </p>
            <p>
              Our aim is to make learning relevant to these responsibilities, with attention to
              ethics, safeguarding and the social and cultural contexts in which people live and
              work.
            </p>
          </div>
        </div>
      </section>

      {/* Who we support */}
      <section className={cx(s.section, s.tinted)} aria-labelledby="support-heading">
        <div className={s.container}>
          <h2 id="support-heading" className={cx(s.heading, s.reveal)}>Who we support</h2>
          <ul className={s.audienceGrid}>
            {AUDIENCES.map(({ icon: Icon, title, text }) => (
              <li key={title} className={cx(s.audience, s.reveal)}>
                <span className={s.icon}>
                  <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={s.note}>
            <Info size={16} aria-hidden="true" />
            <span>
              Each course states its intended audience and entry requirements. Participation in
              training does not, in itself, confer professional registration or authorise practice
              beyond a learner’s role.
            </span>
          </p>
        </div>
      </section>

      {/* How we support learning */}
      <section className={s.section} aria-labelledby="learning-heading">
        <div className={s.container}>
          <h2 id="learning-heading" className={cx(s.heading, s.reveal)}>How we support learning</h2>
          <ul className={s.supportGrid}>
            {SUPPORT.map(({ icon: Icon, title, text, href, cta }) => (
              <li key={title} className={s.reveal}>
                <Link href={href} className={s.supportCard}>
                  <span className={s.icon}>
                    <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className={s.cardLink} aria-hidden="true">
                    {cta} <ArrowUpRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our values */}
      <section className={cx(s.section, s.tinted)} aria-labelledby="values-heading">
        <div className={s.container}>
          <h2 id="values-heading" className={cx(s.heading, s.reveal)}>Our values</h2>
          <ul className={s.valueGrid}>
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className={cx(s.value, s.reveal)}>
                <span className={s.icon}>
                  <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Learn or work with us */}
      <section className={cx(s.section, s.cta)} aria-labelledby="cta-heading">
        <Leaf className={s.ctaLeafLeft} />
        <Leaf className={s.ctaLeafRight} />
        <div className={cx(s.container, s.reveal)} style={{ position: "relative" }}>
          <h2 id="cta-heading">Learn or work with us.</h2>
          <p>
            Whether you are beginning your social work journey, developing your practice, or
            supporting a team, explore learning that suits your goals.
          </p>
          <div className={s.buttons}>
            <Link href="/courses" className={cx(s.button, s.gold)}>
              Explore Courses <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/mentorship" className={cx(s.button, s.ghostLight)}>
              Explore Mentorship
            </Link>
            <Link href="/contact?topic=partnership" className={s.textLink}>
              Work With Us <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
