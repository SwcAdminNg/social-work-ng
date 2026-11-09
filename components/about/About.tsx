import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Earth,
  ExternalLink,
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
import PageHero from "@/components/site/PageHero";
import { Btn, Contours, Eyebrow, Heading, Photo, SectionHead, TextLink, type Vars } from "@/components/site/ui";
import { photoCreditUrl, photos } from "@/lib/photos";
import { ethicalPrinciplesUrl, globalDefinitionUrl } from "@/lib/nigeriaContext";

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
    photo: photos.atWork,
    position: "50% 28%",
  },
  {
    icon: MessagesSquare,
    title: "Mentorship",
    text: "Guided discussion and reflection focused on individual learning and professional development goals.",
    href: "/mentorship",
    cta: "Explore mentorship",
    photo: photos.learningTogether,
    position: "50% 40%",
  },
  {
    icon: Library,
    title: "Resources",
    text: "Learning materials that encourage ongoing reflection and development beyond individual sessions.",
    href: "/resources",
    cta: "View resources",
    photo: photos.readingTea,
    position: "70% 30%",
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

const CREDITS = Object.values(photos);

export default function About() {
  return (
    <div>
      <PageHero
        id="about-heading"
        eyebrow="About us"
        title="About Social Work *Consultancy* Ltd"
        lead="Supporting the development of ethical, skilled and culturally relevant social work practice in Nigeria and across the Global South."
        body="We adopt a practice-focused approach to professional learning, mentorship and capacity building for people and organisations that support children, families and communities."
        photo={photos.embraceLagos}
        position="50% 22%"
      >
        <Btn href="/courses" variant="gold">Explore Courses</Btn>
        <Btn href="/contact" variant="ghost">Contact Us</Btn>
      </PageHero>

      {/* Our learning platform · Why we do this */}
      <section className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-32" aria-label="Our platform and purpose">
        <div className="sw-wrap">
          <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
            <div>
              <div data-reveal>
                <Eyebrow className="text-accent">The platform</Eyebrow>
              </div>
              <Heading text="Our learning *platform*" className="sw-display m-0 mt-5 text-[clamp(2rem,3.8vw,3.2rem)] text-ink" />
              <div data-reveal className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-ink-2">
                <p className="m-0">
                  Socialworknigeria.org is the e-learning platform of Social Work Consultancy Ltd, supporting our
                  training and professional development strand. It connects social work knowledge with practical
                  learning that reflects local contexts and draws on broader professional principles.
                </p>
                <p className="m-0">
                  On this platform, learners can explore courses, mentorship and resources to support their
                  professional development. For information about the wider work of Social Work Consultancy Ltd, visit{" "}
                  <a
                    href="https://socialwork-consultancy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent underline underline-offset-4"
                  >
                    socialwork-consultancy.com
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              </div>
            </div>
            <div>
              <div data-reveal>
                <Eyebrow className="text-accent">Our purpose</Eyebrow>
              </div>
              <Heading text="Why we *do this*" className="sw-display m-0 mt-5 text-[clamp(2rem,3.8vw,3.2rem)] text-ink" />
              <div data-reveal className="mt-6 space-y-4 text-[1.05rem] leading-relaxed text-ink-2">
                <p className="m-0">
                  People working with children, families and communities need opportunities to deepen their knowledge,
                  reflect on difficult decisions and develop their practice.
                </p>
                <p className="m-0">
                  Our aim is to make learning relevant to these responsibilities, with attention to ethics,
                  safeguarding and the social and cultural contexts in which people live and work.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 md:mt-24" data-reveal="clip">
            <Photo
              photo={photos.edoAerial}
              sizes="(min-width: 1280px) 1240px, 92vw"
              className="aspect-[4/3] w-full rounded-[32px] md:aspect-[21/9] md:rounded-[44px]"
            />
          </div>
        </div>
      </section>

      {/* The profession */}
      <section
        aria-labelledby="profession-heading"
        data-progress="view"
        className="sw-sheet sw-on-dark sw-grain overflow-hidden bg-forest pb-28 pt-20 md:pb-40 md:pt-32"
      >
        <Contours className="text-leaf" />
        <div className="sw-wrap relative grid gap-x-14 gap-y-10 lg:grid-cols-[0.36fr_1fr]">
          <div data-reveal>
            <Eyebrow className="text-gold-light">The profession</Eyebrow>
            <p className="m-0 mt-5 max-w-xs text-[0.98rem] leading-relaxed text-white/65">
              Our learning is grounded in the internationally agreed definition and ethical principles of social work.
            </p>
          </div>
          <div>
            <Heading
              id="profession-heading"
              scrub
              accent="text-gold-light"
              text="Social work is a practice-based profession that promotes social change, cohesion and the empowerment of people. *Social justice, human rights, collective responsibility and respect for diversities* sit at its centre, informed by indigenous knowledges as well as theory."
              className="sw-display m-0 text-[clamp(1.6rem,3.3vw,2.9rem)] leading-[1.1] text-[#fffdf4]"
            />
            <div data-reveal className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <a href={globalDefinitionUrl} target="_blank" rel="noopener noreferrer" className="sw-link text-gold-light">
                Read the global definition (IFSW and IASSW, 2014)
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={ethicalPrinciplesUrl} target="_blank" rel="noopener noreferrer" className="sw-link text-gold-light">
                Statement of ethical principles (2018)
                <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who we support */}
      <section className="sw-sheet bg-paper-2 pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="support-heading">
        <div className="sw-wrap">
          <SectionHead id="support-heading" eyebrow="Our learners" title="Who we *support*" />
          <ul className="m-0 mt-12 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                data-reveal
                style={{ "--d": `${index * 0.08}s` } as Vars}
                className="sw-card-hover flex flex-col rounded-[28px] border border-line bg-card p-7"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-accent">
                  <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="sw-em mt-8 text-3xl text-clay-ink" aria-hidden="true">0{index + 1}</span>
                <h3 className="sw-title m-0 mt-2 text-[1.35rem] text-ink">{title}</h3>
                <p className="m-0 mt-3 text-[0.98rem] leading-relaxed text-ink-2">{text}</p>
              </li>
            ))}
          </ul>
          <p data-reveal className="m-0 mt-8 flex max-w-3xl items-start gap-3 rounded-2xl bg-card/70 p-5 text-[0.95rem] leading-relaxed text-ink-2">
            <Info size={18} className="mt-0.5 flex-none text-gold-ink" aria-hidden="true" />
            <span>
              Each course states its intended audience and entry requirements. Participation in training does not, in
              itself, confer professional registration or authorise practice beyond a learner’s role.
            </span>
          </p>
        </div>
      </section>

      {/* How we support learning */}
      <section className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-28" aria-labelledby="learning-heading">
        <div className="sw-wrap">
          <SectionHead id="learning-heading" eyebrow="What we offer" title="How we support *learning*" />
          <ul className="m-0 mt-12 grid list-none gap-5 p-0 md:grid-cols-3 md:gap-6">
            {SUPPORT.map(({ icon: Icon, title, text, href, cta, photo, position }, index) => (
              <li key={title} data-reveal style={{ "--d": `${index * 0.1}s` } as Vars}>
                <Link
                  href={href}
                  className="sw-card-hover group flex h-full flex-col overflow-hidden rounded-[32px] border border-line bg-card no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
                >
                  <div className="relative">
                    <Photo
                      photo={photo}
                      place={false}
                      parallax={false}
                      sizes="(min-width: 768px) 33vw, 92vw"
                      position={position}
                      imgClassName="sw-zoom"
                      className="aspect-[16/11] w-full"
                    />
                    <span className="absolute -bottom-6 left-6 grid h-14 w-14 place-items-center rounded-2xl bg-gold text-[#10231a] shadow-lg">
                      <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7 pt-11">
                    <h3 className="sw-display m-0 text-[1.7rem] text-ink">{title}</h3>
                    <p className="m-0 mt-3 flex-1 text-[0.98rem] leading-relaxed text-ink-2">{text}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent" aria-hidden="true">
                      {cta}
                      <ArrowUpRight size={17} className="transition-transform duration-500 ease-sw group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our values */}
      <section
        aria-labelledby="values-heading"
        data-progress="view"
        className="sw-sheet sw-grain relative overflow-hidden bg-[#b94a28] pb-28 pt-20 text-white md:pb-40 md:pt-28"
      >
        <Contours className="text-white" />
        <div className="sw-wrap relative">
          <div data-reveal>
            <Eyebrow className="text-white [--dot:var(--sw-gold-light)]">What guides us</Eyebrow>
          </div>
          <Heading
            id="values-heading"
            text="Our *values*"
            accent="text-gold-light"
            className="sw-display m-0 mt-5 text-[clamp(2.2rem,4.8vw,4rem)]"
          />
          <ul className="m-0 mt-12 grid list-none gap-x-10 gap-y-0 border-t border-white/25 p-0 md:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                data-reveal
                style={{ "--d": `${index * 0.08}s` } as Vars}
                className="flex gap-5 border-b border-white/25 py-8"
              >
                <span className="grid h-14 w-14 flex-none place-items-center rounded-full bg-white/15 text-gold-light">
                  <Icon size={26} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="sw-title m-0 text-[1.45rem]">{title}</h3>
                  <p className="m-0 mt-2 max-w-md text-[1rem] leading-relaxed text-white/85">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Learn or work with us */}
      <section className="sw-sheet bg-paper px-2.5 pb-10 pt-2.5 sm:px-5 sm:pt-5 md:pb-14" aria-labelledby="cta-heading">
        <div className="sw-on-dark relative overflow-hidden rounded-[32px] md:rounded-[48px]" data-nav-bg="#0c2a1e">
          <Photo photo={photos.teamMeeting} place={false} sizes="100vw" position="50% 35%" className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/95 via-forest/85 to-forest/40" />
          <div className="sw-wrap relative flex min-h-[520px] flex-col justify-center py-16 md:min-h-[600px] md:py-24">
            <div className="max-w-2xl">
              <Heading
                id="cta-heading"
                text="Learn or work *with us.*"
                accent="text-gold-light"
                className="sw-display m-0 text-[clamp(2.4rem,5.6vw,4.9rem)] text-[#fffdf4]"
              />
              <p data-reveal className="sw-lead m-0 mt-6 max-w-xl text-white/80">
                Whether you are beginning your social work journey, developing your practice, or supporting a team,
                explore learning that suits your goals.
              </p>
              <div data-reveal className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-4">
                <Btn href="/courses" variant="gold">Explore Courses</Btn>
                <Btn href="/mentorship" variant="ghost">Explore Mentorship</Btn>
                <TextLink href="/contact?topic=partnership" className="ml-2 text-gold-light">Work With Us</TextLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo credits */}
      <section id="photo-credits" className="scroll-mt-28 bg-paper pb-24 pt-10 md:pb-28" aria-labelledby="credits-heading">
        <div className="sw-wrap">
          <div data-reveal className="max-w-2xl">
            <Eyebrow className="text-accent">Photo credits</Eyebrow>
            <h2 id="credits-heading" className="sw-title m-0 mt-4 text-2xl text-ink">The photographers behind this site</h2>
            <p className="m-0 mt-3 text-[0.95rem] leading-relaxed text-ink-2">
              These photographs are shared by their makers on Unsplash. They are used to show everyday life and
              learning; the people pictured are not our learners or people who use social work services.
            </p>
          </div>
          <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-x-4 gap-y-5 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {CREDITS.map((photo) => (
              <li key={photo.ref}>
                <a
                  href={photoCreditUrl(photo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-ink no-underline"
                >
                  <span className="relative h-12 w-12 flex-none overflow-hidden rounded-xl">
                    <Image src={photo.src} alt="" fill sizes="48px" className="object-cover transition-transform duration-700 ease-sw group-hover:scale-110" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold group-hover:text-accent">{photo.by}</span>
                    <span className="block truncate text-xs text-ink-3">{photo.place ?? "Unsplash"}</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
