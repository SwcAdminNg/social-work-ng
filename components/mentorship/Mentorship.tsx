import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Info,
  Plus,
  ShieldCheck,
  Signpost,
  UsersRound,
} from "lucide-react";
import contact from "@/components/contact/Contact.module.css";
import { MenteeForm, MentorForm, PathwayButton } from "./MentorshipForms";
import s from "./Mentorship.module.css";

const PATHWAY_CARDS = [
  {
    icon: BookOpen,
    title: "Student and Placement Support",
    text: "Prepare for placement, develop reflective thinking, and explore how social work knowledge applies to practice.",
  },
  {
    icon: UsersRound,
    title: "Early Career Practice Development",
    text: "Strengthen assessment, recording, communication, ethical reasoning and professional confidence.",
  },
  {
    icon: Signpost,
    title: "Career and Further Study Guidance",
    text: "Explore career goals, CVs, interviews, postgraduate study and relevant professional development opportunities.",
  },
];

const OUTCOMES = [
  "A personal learning and development plan.",
  "Greater confidence in exploring professional and ethical dilemmas.",
  "Stronger links between social work theory and practice.",
  "Clearer career goals and practical next steps.",
];

const STEPS = [
  { title: "Share your goals", text: "Complete the expression of interest form." },
  { title: "Explore a suitable match", text: "We review your goals and discuss availability and fit." },
  { title: "Agree your plan", text: "Set goals, meeting arrangements and boundaries with your mentor." },
  { title: "Review your progress", text: "Reflect on your learning and agree your next steps." },
];

// Only questions SWCL's brief already answers. Programme details are added
// once SWCL confirms them, never with placeholder figures.
const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Who can join?",
    a: "Mentorship is for social work students, recent graduates and early-career practitioners in Nigeria and across the Global South. Tell us where you are in your journey when you register your interest.",
  },
  {
    q: "How are mentors matched?",
    a: "We review your goals, interests and availability and discuss a suitable fit with you. Registering your interest does not guarantee a place or a mentor match.",
  },
  {
    q: "How much does it cost, and how long does it last?",
    a: "Fees, duration and session arrangements are being finalised and will be published on this page once confirmed. Register your interest and we will contact you with the details.",
  },
  {
    q: "Does mentorship replace supervision or placement assessment?",
    a: "No. Mentorship supports professional learning and development. It does not replace employer supervision, placement assessment, clinical support or emergency assistance.",
  },
  {
    q: "How do I raise a concern?",
    a: (
      <>
        Contact us through the <Link href="/contact?topic=mentorship">contact page</Link> or email{" "}
        <a href="mailto:support@socialworknigeria.org">support@socialworknigeria.org</a>.
      </>
    ),
  },
];

export default function Mentorship() {
  return (
    <div className={`${contact.page} ${s.page}`}>
      {/* 1. Opening */}
      <section className={s.hero} aria-labelledby="mentorship-heading">
        <div className={s.heroCopy}>
          <p className={s.eyebrow}>Mentorship by Social Work Consultancy Ltd</p>
          <h1 id="mentorship-heading">Build confidence in your social work journey</h1>
          <p className={s.heroLead}>
            Practical mentorship for social work students, recent graduates and early-career
            practitioners in Nigeria and across the Global South. Connect theory with practice,
            strengthen your professional confidence, and work towards your learning and career goals
            with an experienced mentor.
          </p>
          <div className={s.heroActions}>
            <a href="#register" className={`${s.btn} ${s.btnGold}`}>
              Register Your Interest <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#become-a-mentor" className={`${s.btn} ${s.btnGhost}`}>
              Become a Mentor
            </a>
          </div>
        </div>
        <div className={s.heroMedia}>
          <Image
            src="/images/mentorship/mentorship-conversation.webp"
            alt="An experienced practitioner talks with a younger colleague who takes notes at a table."
            fill
            priority
            sizes="(min-width: 900px) 50vw, 100vw"
          />
          <span className={s.chipNote}>Illustrative image</span>
        </div>
      </section>

      {/* 2. Pathways */}
      <section className={s.section} aria-labelledby="pathways-heading">
        <div className={contact.container}>
          <h2 id="pathways-heading" className={s.heading}>Choose your mentorship pathway</h2>
          <p className={s.lead}>Pick the pathway closest to your goals. You can change it in the form.</p>
          <ul className={s.pathways}>
            {PATHWAY_CARDS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <PathwayButton pathway={title} className={s.pathway}>
                  <span className={s.pathwayIcon} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.75} />
                  </span>
                  <span className={s.pathwayTitle}>{title}</span>
                  <span className={s.pathwayText}>{text}</span>
                  <span className={s.pathwayCta}>
                    Register for this pathway <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </PathwayButton>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 and 4. Outcomes and programme details */}
      <section className={`${s.section} ${s.tinted}`} aria-labelledby="outcomes-heading">
        <div className={`${contact.container} ${s.split}`}>
          <div>
            <h2 id="outcomes-heading" className={s.heading}>What you can work towards</h2>
            <ul className={s.outcomes}>
              {OUTCOMES.map((item) => (
                <li key={item} className={s.outcome}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className={s.small}>
              Progress will depend on individual goals, participation and the agreed scope of
              mentorship. Review progress jointly throughout the programme.
            </p>
          </div>
          <aside className={s.detailsCard} aria-labelledby="details-heading">
            <h3 id="details-heading">
              <CalendarClock size={20} aria-hidden="true" /> Programme details
            </h3>
            <p>
              Duration, session arrangements, fees and application dates are being finalised and will
              be published here once confirmed.
            </p>
            <p>
              <a href="#register">Register your interest</a> and we will contact you when details are
              available.
            </p>
          </aside>
        </div>
      </section>

      {/* 5. How it works */}
      <section className={s.section} aria-labelledby="steps-heading">
        <div className={contact.container}>
          <h2 id="steps-heading" className={s.heading}>How it works</h2>
          <ol className={s.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={s.step}>
                <span className={s.stepNum} aria-hidden="true">{index + 1}</span>
                <h3 className={s.stepTitle}>
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className={s.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Mentee expression of interest */}
      <section id="register" className={`${s.section} ${s.tinted} ${s.formCard}`} aria-labelledby="register-heading">
        <div className={`${contact.container} ${s.formSection}`}>
          <div className={s.formAside}>
            <h2 id="register-heading" className={s.heading}>Register your interest</h2>
            <p>
              Tell us where you are in your social work journey and what support you would like. We
              will review your enquiry and contact you about suitable next steps.
            </p>
            <p className={s.notice}>
              <Info size={18} aria-hidden="true" />
              <span>Submitting this form does not guarantee a place or a mentor match.</span>
            </p>
          </div>
          <div className={contact.card}>
            <MenteeForm />
          </div>
        </div>
      </section>

      {/* 8. Become a mentor */}
      <section id="become-a-mentor" className={`${s.section} ${s.formCard}`} aria-labelledby="mentor-heading">
        <div className={`${contact.container} ${s.formSection}`}>
          <div className={s.formAside}>
            <h2 id="mentor-heading" className={s.heading}>Become a mentor</h2>
            <p>
              Share your experience to support the development of social work students and
              early-career practitioners. We welcome enquiries from experienced practitioners and
              educators who can provide thoughtful, ethical and culturally relevant guidance.
            </p>
            <p className={s.notice}>
              <Info size={18} aria-hidden="true" />
              <span>We will contact you about next steps. Sending an enquiry does not confirm a mentor role.</span>
            </p>
          </div>
          <div className={contact.card}>
            <MentorForm />
          </div>
        </div>
      </section>

      {/* 9. Professional boundaries */}
      <section className={s.section} style={{ paddingTop: 0 }} aria-labelledby="boundaries-heading">
        <div className={contact.container}>
          <div className={s.boundaries}>
            <span className={s.boundaryIcon} aria-hidden="true">
              <ShieldCheck size={28} />
            </span>
            <div>
              <h2 id="boundaries-heading">Professional boundaries</h2>
              <p>
                Mentorship supports professional learning and development. It does not replace employer
                supervision, placement assessment, clinical support, or emergency assistance.
              </p>
              <p>
                Confidentiality and its limits are agreed at the outset, and anonymised examples are
                used when reflecting on practice. Further study and career guidance do not guarantee
                admission, scholarships, employment or professional registration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className={`${s.section} ${s.tinted}`} aria-labelledby="faqs-heading" style={{ scrollMarginTop: 90 }}>
        <div className={contact.container}>
          <h2 id="faqs-heading" className={s.heading}>Frequently asked questions</h2>
          <div className={s.faqs}>
            {FAQS.map((item) => (
              <details key={item.q} className={s.faq}>
                <summary>
                  {item.q}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <div className={s.faqBody}>{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className={s.closing} aria-labelledby="closing-heading">
        <div className={`${contact.container} ${s.closingInner}`}>
          <h2 id="closing-heading">Ready to take your next step?</h2>
          <a href="#register" className={`${s.btn} ${s.btnGold}`}>
            Register Your Interest <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href="#faqs" className={s.closingLink}>
            Programme details and FAQs <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
