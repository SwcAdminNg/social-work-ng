import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  Info,
  Plus,
  ShieldCheck,
  Signpost,
  UsersRound,
} from "lucide-react";
import contact from "@/components/contact/Contact.module.css";
import PageHero from "@/components/site/PageHero";
import { Btn, Contours, Eyebrow, Heading, Photo, SectionHead, TextLink, type Vars } from "@/components/site/ui";
import { photos } from "@/lib/photos";
import { MenteeForm, MentorForm, PathwayButton } from "./MentorshipForms";

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
        Contact us through the{" "}
        <Link href="/contact?topic=mentorship" className="font-semibold text-accent underline underline-offset-4">
          contact page
        </Link>{" "}
        or email{" "}
        <a href="mailto:support@socialworknigeria.org" className="font-semibold text-accent underline underline-offset-4">
          support@socialworknigeria.org
        </a>
        .
      </>
    ),
  },
];

const formCard = `${contact.page} rounded-[32px] border border-line bg-card p-6 shadow-[0_30px_70px_-50px_rgba(14,31,23,0.45)] sm:p-9 md:rounded-[40px] md:p-11`;

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 mt-6 flex items-start gap-3 rounded-2xl border border-line bg-card p-4 text-[0.92rem] leading-relaxed text-ink-2">
      <Info size={18} className="mt-0.5 flex-none text-gold-ink" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export default function Mentorship() {
  return (
    <div>
      {/* 1. Opening */}
      <PageHero
        id="mentorship-heading"
        eyebrow="Mentorship by Social Work Consultancy Ltd"
        title="Build *confidence* in your social work journey"
        lead="Practical mentorship for social work students, recent graduates and early-career practitioners in Nigeria and across the Global South. Connect theory with practice, strengthen your professional confidence, and work towards your learning and career goals with an experienced mentor."
        photo={photos.learningTogether}
        position="50% 35%"
      >
        <Btn href="#register" variant="gold">Register Your Interest</Btn>
        <Btn href="#become-a-mentor" variant="ghost">Become a Mentor</Btn>
      </PageHero>

      {/* 2. Pathways */}
      <section className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="pathways-heading">
        <div className="sw-wrap">
          <SectionHead
            id="pathways-heading"
            eyebrow="Pathways"
            title="Choose your mentorship *pathway*"
            lead="Pick the pathway closest to your goals. You can change it in the form."
          />
          <ul className="m-0 mt-12 grid list-none gap-5 p-0 md:grid-cols-3 md:gap-6">
            {PATHWAY_CARDS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} data-reveal style={{ "--d": `${index * 0.1}s` } as Vars}>
                <PathwayButton
                  pathway={title}
                  className="sw-card-hover group flex h-full w-full cursor-pointer flex-col rounded-[32px] border border-line bg-card p-7 text-left font-[inherit] text-ink hover:border-gold md:p-8"
                >
                  <span className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-accent transition-colors duration-500 group-hover:bg-gold group-hover:text-[#10231a]" aria-hidden="true">
                      <Icon size={26} strokeWidth={1.75} />
                    </span>
                    <span className="sw-em text-[3rem] leading-none text-clay-ink/80" aria-hidden="true">0{index + 1}</span>
                  </span>
                  <span className="sw-display mt-10 block text-[1.65rem]">{title}</span>
                  <span className="mt-3 block flex-1 text-[0.98rem] leading-relaxed text-ink-2">{text}</span>
                  <span className="mt-7 inline-flex items-center gap-2 font-semibold text-accent">
                    Register for this pathway
                    <ArrowUpRight size={17} className="transition-transform duration-500 ease-sw group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
                  </span>
                </PathwayButton>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 and 4. Outcomes and programme details */}
      <section className="sw-sheet bg-paper-2 pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="outcomes-heading">
        <div className="sw-wrap grid items-start gap-x-14 gap-y-12 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHead id="outcomes-heading" eyebrow="Outcomes" title="What you can work *towards*" />
            <ul className="m-0 mt-10 grid list-none gap-3 p-0">
              {OUTCOMES.map((item, index) => (
                <li
                  key={item}
                  data-reveal
                  style={{ "--d": `${index * 0.07}s` } as Vars}
                  className="flex items-center gap-4 rounded-[20px] border border-line bg-card p-5 text-[1.05rem] text-ink"
                >
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-deep text-gold-light">
                    <Check size={18} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p data-reveal className="m-0 mt-5 max-w-xl text-[0.92rem] leading-relaxed text-ink-3">
              Progress will depend on individual goals, participation and the agreed scope of mentorship. Review
              progress jointly throughout the programme.
            </p>
          </div>
          <div className="grid gap-6">
            <div data-reveal="clip">
              <Photo
                photo={photos.readingTea}
                sizes="(min-width: 1024px) 40vw, 92vw"
                position="70% 30%"
                className="aspect-[4/3] w-full rounded-[32px] md:rounded-[40px]"
              />
            </div>
            <aside
              aria-labelledby="details-heading"
              data-reveal
              className="rounded-[28px] border border-dashed border-gold bg-gold/10 p-7"
            >
              <h3 id="details-heading" className="sw-title m-0 flex items-center gap-3 text-xl text-ink">
                <CalendarClock size={22} className="text-gold-ink" aria-hidden="true" /> Programme details
              </h3>
              <p className="m-0 mt-3 text-[0.98rem] leading-relaxed text-ink-2">
                Duration, session arrangements, fees and application dates are being finalised and will be published
                here once confirmed.
              </p>
              <p className="m-0 mt-3 text-[0.98rem] leading-relaxed text-ink-2">
                <a href="#register" className="font-semibold text-accent underline underline-offset-4">Register your interest</a>{" "}
                and we will contact you when details are available.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 5. How it works */}
      <section
        aria-labelledby="steps-heading"
        data-progress="view"
        className="sw-sheet sw-on-dark sw-grain overflow-hidden bg-forest pb-28 pt-20 md:pb-40 md:pt-28"
      >
        <Contours className="text-leaf" />
        <div className="sw-wrap relative">
          <SectionHead id="steps-heading" onDark eyebrow="The process" title="How it *works*" />
          <ol className="m-0 mt-14 grid list-none gap-x-6 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} data-reveal style={{ "--d": `${index * 0.1}s` } as Vars} className="relative border-t border-white/20 pt-6">
                <span aria-hidden="true" className="absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full bg-gold" />
                <span className="sw-em block text-[3.6rem] leading-none text-gold-light" aria-hidden="true">0{index + 1}</span>
                <h3 className="sw-title m-0 mt-5 text-[1.35rem] text-[#fffdf4]">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="m-0 mt-2 text-[0.98rem] leading-relaxed text-white/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Mentee expression of interest */}
      <section id="register" className="sw-sheet scroll-mt-10 bg-paper pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="register-heading">
        <div className="sw-wrap grid items-start gap-x-12 gap-y-10 lg:grid-cols-[4fr_7fr]">
          <div className="lg:sticky lg:top-28">
            <div data-reveal>
              <Eyebrow className="text-accent">For mentees</Eyebrow>
            </div>
            <Heading id="register-heading" text="Register your *interest*" className="sw-display m-0 mt-5 text-[clamp(2rem,3.8vw,3.2rem)] text-ink" />
            <p data-reveal className="m-0 mt-5 text-[1.05rem] leading-relaxed text-ink-2">
              Tell us where you are in your social work journey and what support you would like. We will review your
              enquiry and contact you about suitable next steps.
            </p>
            <div data-reveal>
              <Notice>Submitting this form does not guarantee a place or a mentor match.</Notice>
            </div>
          </div>
          <div className={formCard} data-reveal>
            <MenteeForm />
          </div>
        </div>
      </section>

      {/* 8. Become a mentor */}
      <section id="become-a-mentor" className="sw-sheet scroll-mt-10 bg-paper-2 pb-28 pt-20 md:pb-36 md:pt-28" aria-labelledby="mentor-heading">
        <div className="sw-wrap grid items-start gap-x-12 gap-y-10 lg:grid-cols-[4fr_7fr]">
          <div className="lg:sticky lg:top-28">
            <div data-reveal>
              <Eyebrow className="text-accent">For mentors</Eyebrow>
            </div>
            <Heading id="mentor-heading" text="Become a *mentor*" className="sw-display m-0 mt-5 text-[clamp(2rem,3.8vw,3.2rem)] text-ink" />
            <p data-reveal className="m-0 mt-5 text-[1.05rem] leading-relaxed text-ink-2">
              Share your experience to support the development of social work students and early-career practitioners.
              We welcome enquiries from experienced practitioners and educators who can provide thoughtful, ethical and
              culturally relevant guidance.
            </p>
            <div data-reveal>
              <Notice>We will contact you about next steps. Sending an enquiry does not confirm a mentor role.</Notice>
            </div>
          </div>
          <div className={formCard} data-reveal>
            <MentorForm />
          </div>
        </div>

        {/* 9. Professional boundaries */}
        <div className="sw-wrap mt-16 md:mt-24">
          <div
            data-reveal
            data-progress="view"
            className="sw-on-dark relative grid gap-6 overflow-hidden rounded-[32px] bg-forest p-8 md:grid-cols-[auto_1fr] md:gap-10 md:rounded-[40px] md:p-12"
          >
            <Contours className="text-leaf" />
            <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold-light/60 text-gold-light" aria-hidden="true">
              <ShieldCheck size={30} />
            </span>
            <div className="relative">
              <h2 id="boundaries-heading" className="sw-display m-0 text-[clamp(1.7rem,2.8vw,2.3rem)] text-[#fffdf4]">
                Professional boundaries
              </h2>
              <p className="m-0 mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-white/80">
                Mentorship supports professional learning and development. It does not replace employer supervision,
                placement assessment, clinical support, or emergency assistance.
              </p>
              <p className="m-0 mt-3 max-w-3xl text-[1.02rem] leading-relaxed text-white/80">
                Confidentiality and its limits are agreed at the outset, and anonymised examples are used when
                reflecting on practice. Further study and career guidance do not guarantee admission, scholarships,
                employment or professional registration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="sw-sheet scroll-mt-10 bg-paper pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="faqs-heading">
        <div className="sw-wrap grid gap-x-14 gap-y-10 lg:grid-cols-[0.7fr_1fr]">
          <SectionHead id="faqs-heading" eyebrow="Good to know" title="Frequently asked *questions*" />
          <div className="grid gap-3">
            {FAQS.map((item, index) => (
              <details
                key={item.q}
                data-reveal
                style={{ "--d": `${index * 0.06}s` } as Vars}
                className="group rounded-[24px] border border-line bg-card transition-colors duration-300 open:border-gold"
              >
                <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 text-[1.08rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-mint text-accent transition-all duration-500 ease-sw group-open:rotate-45 group-open:bg-gold group-open:text-[#10231a]">
                    <Plus size={20} aria-hidden="true" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[1rem] leading-relaxed text-ink-2">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="sw-sheet bg-paper px-2.5 pb-10 pt-2.5 sm:px-5 sm:pt-5 md:pb-14" aria-labelledby="closing-heading">
        <div
          data-progress="view"
          className="sw-grain relative overflow-hidden rounded-[32px] bg-[#b94a28] px-6 py-16 text-center text-white md:rounded-[48px] md:py-24"
        >
          <Contours className="text-white" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            <Heading
              id="closing-heading"
              text="Ready to take your *next step?*"
              accent="text-gold-light"
              className="sw-display m-0 text-[clamp(2.3rem,5.2vw,4.4rem)]"
            />
            <div data-reveal className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
              <Btn href="#register" variant="light">Register Your Interest</Btn>
              <TextLink href="#faqs" className="text-white">Programme details and FAQs</TextLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
