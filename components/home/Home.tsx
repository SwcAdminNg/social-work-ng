import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  CirclePlay,
  ExternalLink,
  MessagesSquare,
  NotebookPen,
  Radio,
} from "lucide-react";
import { Btn, Contours, Eyebrow, Heading, Marquee, Photo, SectionHead, TextLink, cx, type Vars } from "@/components/site/ui";
import { photos } from "@/lib/photos";
import { contextCheckedOn, contextStats, frameworks, practiceSettings } from "@/lib/nigeriaContext";
import FieldsList, { type Field } from "./FieldsList";

const MARQUEE = [
  "Ethics",
  "Safeguarding",
  "Reflection",
  "Human rights",
  "Social justice",
  "Cultural relevance",
  "Children",
  "Families",
  "Communities",
];

const PATHWAYS = [
  {
    href: "/courses",
    title: "Explore Courses",
    text: "Build practical knowledge and connect social work ideas with the responsibilities of your role.",
    photo: photos.atWork,
    position: "50% 30%",
    chip: "Courses",
  },
  {
    href: "/mentorship",
    title: "Explore Mentorship",
    text: "Explore guidance, reflection and professional development through mentorship.",
    photo: photos.learningTogether,
    position: "50% 40%",
    chip: "Mentorship",
  },
  {
    href: "/resources",
    title: "Use Practice Resources",
    text: "Explore tools, guides and reading to support your learning and day-to-day practice.",
    photo: photos.readingTea,
    position: "70% 30%",
    chip: "Resources",
  },
];

const STEPS = [
  {
    icon: CirclePlay,
    title: "Learn at your own pace",
    text: "Video lessons, readings and practice resources you can return to whenever your day allows.",
    surface: "bg-card text-ink",
    tint: "text-accent",
  },
  {
    icon: NotebookPen,
    title: "Test your judgement",
    text: "Quizzes and written reflections turn ideas into decisions you can explain and stand behind.",
    surface: "bg-deep text-[#f4f1e6]",
    tint: "text-gold-light",
  },
  {
    icon: Radio,
    title: "Join live sessions",
    text: "Scheduled sessions bring learners and facilitators together to talk through real practice questions.",
    surface: "bg-gold text-[#10231a]",
    tint: "text-[#10231a]",
  },
  {
    icon: BadgeCheck,
    title: "Earn a certificate you can verify",
    text: "Where a course offers one, your certificate carries a code that an employer can check online.",
    surface: "bg-[#b94a28] text-white",
    tint: "text-white",
  },
];

const FIELD_PHOTOS = [
  photos.clayHouse,
  photos.openHands,
  photos.zariaSerene,
  photos.bodijaMarket,
  photos.elderSeated,
  photos.rooftopsSunset,
  photos.lagosMarina,
  photos.redRoad,
];

const FIELDS: Field[] = practiceSettings.map((setting, index) => ({
  ...setting,
  image: { src: FIELD_PHOTOS[index].src, alt: FIELD_PHOTOS[index].alt },
}));

function Spark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c.9 6.5 5.5 11.1 12 12-6.5.9-11.1 5.5-12 12-.9-6.5-5.5-11.1-12-12 6.5-.9 11.1-5.5 12-12Z" />
    </svg>
  );
}

function SpinBadge() {
  return (
    <div className="relative grid h-28 w-28 place-items-center rounded-full bg-gold text-[#10231a] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.55)] md:h-32 md:w-32">
      <svg viewBox="0 0 120 120" className="sw-spin absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <path id="sw-badge-circle" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
        </defs>
        <text fontSize="11" fontWeight="700" fill="currentColor">
          <textPath href="#sw-badge-circle" textLength="276" lengthAdjust="spacing">
            LEARN • REFLECT • PRACTISE • GROW •
          </textPath>
        </text>
      </svg>
      <Spark className="h-7 w-7" />
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* ── Hero ── */}
      <section
        aria-labelledby="hero-heading"
        data-progress="view"
        className="sw-on-dark sw-grain relative -mt-[var(--nav-h)] overflow-hidden bg-forest pb-28 pt-[var(--nav-h)] md:pb-36"
      >
        <Contours className="text-leaf" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full bg-brand/40 blur-[150px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-clay/25 blur-[140px]" />

        <div className="sw-wrap relative grid items-center gap-x-10 gap-y-14 pt-8 md:pt-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div data-reveal>
              <Eyebrow className="text-gold-light">E-learning by Social Work Consultancy Ltd</Eyebrow>
            </div>
            <Heading
              as="h1"
              id="hero-heading"
              text="Practical learning for social work in *Nigeria* and beyond"
              accent="text-gold-light"
              delay={0.55}
              className="sw-display m-0 mt-6 text-[clamp(2.7rem,6.6vw,5.9rem)] text-[#fffdf4]"
            />
            <p data-reveal style={{ "--d": "1s" } as Vars} className="sw-lead m-0 mt-7 max-w-[34rem] text-white/80">
              Develop your knowledge, skills and judgement to work with children, families and communities.
            </p>
            <div data-reveal style={{ "--d": "1.12s" } as Vars} className="mt-9 flex flex-wrap gap-3">
              <Btn href="/courses" variant="gold">Explore Courses</Btn>
              <Btn href="/mentorship" variant="ghost">Explore Mentorship</Btn>
            </div>
            <ul
              data-reveal
              style={{ "--d": "1.25s" } as Vars}
              className="m-0 mt-10 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm text-white/60"
              aria-label="Who the platform is for"
            >
              {["Students and graduates", "Practitioners", "Caregivers and educators", "Organisations and teams"].map((who) => (
                <li key={who} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-clay-light" />
                  {who}
                </li>
              ))}
            </ul>
          </div>

          {/* Portrait with a second photo and a turning badge */}
          <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
            <div data-reveal="clip" style={{ "--d": "0.65s" } as Vars} className="overflow-hidden rounded-[36px] md:rounded-[44px]">
              <Photo
                photo={photos.practitioner}
                priority
                sizes="(min-width: 1024px) 40vw, 92vw"
                position="66% 50%"
                className="aspect-[4/5] w-full"
              >
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/55 via-transparent to-transparent" />
                <span className="sw-chip absolute left-4 top-4 bg-white/90 text-[#10231a] backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-70 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-clay" />
                  </span>
                  Live sessions
                </span>
                <span className="sw-chip absolute bottom-4 right-4 bg-night/60 text-white backdrop-blur-md">
                  <BadgeCheck size={14} className="text-gold-light" aria-hidden="true" />
                  Certificates you can verify
                </span>
              </Photo>
            </div>
            <div
              data-reveal="scale"
              style={{ "--d": "1.05s" } as Vars}
              className="absolute -bottom-10 -left-4 w-[38%] md:-left-12"
            >
              <div className="sw-float -rotate-6 overflow-hidden rounded-[22px] border-[5px] border-forest shadow-[0_24px_50px_-18px_rgba(0,0,0,0.6)] md:rounded-[28px]">
                <Photo photo={photos.portraitJoy} parallax={false} sizes="200px" position="62% 40%" className="aspect-square w-full" />
              </div>
            </div>
            <div data-reveal="scale" style={{ "--d": "1.2s" } as Vars} className="absolute -right-3 -top-8 md:-right-8 md:-top-10">
              <SpinBadge />
            </div>
          </div>
        </div>

        <Marquee className="relative mt-24 text-white/90 md:mt-28" duration={52} gap="2.25rem">
          {MARQUEE.map((word, index) => (
            <span key={word} className="flex items-center gap-9">
              <span
                className={cx(
                  "whitespace-nowrap text-[clamp(1.9rem,4.4vw,3.6rem)] leading-none",
                  index % 3 === 1 ? "sw-em text-gold-light" : "sw-display",
                )}
              >
                {word}
              </span>
              <Spark className="h-4 w-4 text-clay-light" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* ── What this platform is for ── */}
      <section aria-labelledby="purpose-heading" className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-32">
        <div className="sw-wrap">
          <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[0.34fr_1fr]">
            <div data-reveal className="lg:pt-3">
              <Eyebrow className="text-accent">Why we are here</Eyebrow>
              <p className="m-0 mt-5 max-w-xs text-[0.98rem] leading-relaxed text-ink-2">
                Professional learning from Social Work Consultancy Ltd. Accessible, practice-focused learning for
                social work and allied practice in Nigeria and beyond.
              </p>
            </div>
            <Heading
              id="purpose-heading"
              scrub
              text="Social work happens in homes, clinics, classrooms, markets and courtrooms. *Our learning starts there,* with the realities of practice in Nigeria and the judgement it takes to do it well."
              className="sw-display m-0 text-[clamp(1.85rem,4.3vw,3.7rem)] leading-[1.05] text-ink"
            />
          </div>

          {/* Places where practice happens */}
          <div className="mt-20 grid grid-cols-2 gap-4 md:mt-28 md:grid-cols-12 md:gap-6">
            <CollagePhoto photo={photos.bodijaMarket} className="md:col-span-4" aspect="aspect-[4/5]" shift={-50} />
            <CollagePhoto photo={photos.durbarSmile} className="md:col-span-5 md:mt-28" aspect="aspect-[4/5] md:aspect-[3/2]" shift={-130} position="60% 50%" />
            <CollagePhoto photo={photos.marketSmile} className="max-md:col-span-2 md:col-span-3 md:mt-10" aspect="aspect-[3/2] md:aspect-[3/4]" shift={-80} position="50% 30%" />
            <div className="col-span-2 flex flex-col justify-end md:col-span-3 md:col-start-1 md:pb-10" data-reveal>
              <p className="sw-title m-0 text-2xl text-ink">
                From Lagos Island to the Zaria Durbar, practice looks different in every place.
              </p>
              <p className="m-0 mt-3 text-sm leading-relaxed text-ink-3">
                Photography from the Unsplash community, much of it by Nigerian photographers.{" "}
                <Link href="/about-us#photo-credits" className="text-accent underline underline-offset-4">
                  See the credits
                </Link>
                .
              </p>
            </div>
            <CollagePhoto photo={photos.herder} className="max-md:col-span-2 md:col-span-6 md:-mt-10" aspect="aspect-[3/2]" shift={-60} />
            <CollagePhoto photo={photos.lagosMarina} className="max-md:hidden md:col-span-3 md:-mt-24" aspect="aspect-[3/4]" shift={-150} />
          </div>
        </div>
      </section>

      {/* ── Three ways in ── */}
      <section aria-labelledby="pathways-heading" className="sw-sheet bg-paper-2 pb-28 pt-20 md:pb-40 md:pt-28">
        <div className="sw-wrap">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHead
              id="pathways-heading"
              eyebrow="Start here"
              title="Three ways to grow your *practice*"
            />
            <p data-reveal className="sw-lead m-0 max-w-sm text-ink-2">
              Choose a course, find a mentor, or pick up a resource you can use this week.
            </p>
          </div>

          <ul className="m-0 mt-12 grid list-none gap-5 p-0 md:mt-16 md:grid-cols-3 md:gap-6">
            {PATHWAYS.map((path, index) => (
              <li key={path.href} data-reveal style={{ "--d": `${index * 0.12}s` } as Vars} className={index === 1 ? "md:mt-14" : undefined}>
                <Link
                  href={path.href}
                  className="sw-card-hover group relative block overflow-hidden rounded-[32px] bg-forest text-white no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
                >
                  <Photo
                    photo={path.photo}
                    place={false}
                    sizes="(min-width: 768px) 33vw, 92vw"
                    position={path.position}
                    className="aspect-[4/5] w-full"
                    imgClassName="sw-zoom"
                    parallax={false}
                  >
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent" />
                  </Photo>
                  <span className="sw-chip absolute left-5 top-5 bg-white/90 text-[#10231a]">
                    <span className="tabular-nums text-clay-ink">0{index + 1}</span>
                    {path.chip}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-gold text-[#10231a] transition-transform duration-700 ease-sw group-hover:rotate-45 group-hover:scale-110"
                  >
                    <ArrowUpRight size={20} />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 block p-6 md:p-7">
                    <span className="sw-display block text-[clamp(1.7rem,2.6vw,2.3rem)]">{path.title}</span>
                    <span className="mt-3 block max-w-[30ch] text-[0.98rem] leading-relaxed text-white/80">{path.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The Nigerian context ── */}
      <section
        aria-labelledby="context-heading"
        data-progress="view"
        className="sw-sheet sw-on-dark sw-grain overflow-hidden bg-forest pb-28 pt-20 md:pb-40 md:pt-32"
      >
        <Contours className="text-leaf" />
        <div className="sw-wrap relative">
          <SectionHead
            id="context-heading"
            onDark
            eyebrow="The Nigerian context"
            title="Skilled practice matters *here*"
            lead="Behind every figure is a child, a family or a community, and someone whose job is to help. These are some of the realities practitioners in Nigeria work with."
          />

          <ul className="m-0 mt-14 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {contextStats.map((stat, index) => (
              <li
                key={stat.label}
                data-reveal
                style={{ "--d": `${index * 0.1}s` } as Vars}
                className="flex flex-col rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm md:p-7"
              >
                <p className="sw-display m-0 text-[clamp(2.6rem,4.6vw,3.9rem)] text-gold-light">
                  {stat.prefix}
                  <span data-count={stat.value}>{stat.value}</span>
                  <span className="text-[0.55em] tracking-normal">{stat.suffix}</span>
                </p>
                <p className="m-0 mt-4 flex-1 text-[0.98rem] leading-relaxed text-white/80">{stat.label}</p>
                <a
                  href={stat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sw-cap mt-6 inline-flex items-center gap-1.5 text-white/50 no-underline transition-colors hover:text-gold-light"
                >
                  {stat.source}
                  <ExternalLink size={11} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-24 grid gap-x-12 gap-y-10 md:mt-32 lg:grid-cols-[0.42fr_1fr]">
            <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow className="text-gold-light">Law and policy</Eyebrow>
              <h3 className="sw-display m-0 mt-5 text-[clamp(1.8rem,3vw,2.6rem)] text-[#fffdf4]">
                The frameworks practice sits <em className="sw-em text-gold-light">within</em>
              </h3>
              <p className="m-0 mt-4 max-w-sm text-[0.98rem] leading-relaxed text-white/65">
                Two decades of legislation have reshaped the duties and protections that social workers in Nigeria work
                with every day.
              </p>
            </div>
            <ol className="m-0 list-none border-t border-white/12 p-0">
              {frameworks.map((item, index) => (
                <li
                  key={item.name}
                  data-reveal
                  style={{ "--d": `${Math.min(index, 4) * 0.06}s` } as Vars}
                  className="group grid gap-x-8 gap-y-2 border-b border-white/12 py-7 md:grid-cols-[6.5rem_1fr]"
                >
                  <span className="sw-em text-[2.6rem] leading-none text-gold-light md:text-[3rem]">{item.year}</span>
                  <div>
                    <h4 className="sw-title m-0 text-xl text-[#fffdf4] md:text-[1.4rem]">{item.name}</h4>
                    <p className="m-0 mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-white/70">{item.text}</p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sw-cap mt-3 inline-flex items-center gap-1.5 text-white/45 no-underline transition-colors hover:text-gold-light"
                    >
                      Source: {item.source}
                      <ExternalLink size={11} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <p className="sw-cap m-0 mt-8 text-white/40">Figures and dates checked against the linked sources, {contextCheckedOn}.</p>
        </div>
      </section>

      {/* ── Featured course ── */}
      <section aria-labelledby="featured-heading" className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-32">
        <div className="sw-wrap grid items-center gap-x-14 gap-y-12 lg:grid-cols-2">
          <div className="relative" data-reveal="clip">
            <Photo
              photo={photos.manWorkspace}
              sizes="(min-width: 1024px) 46vw, 92vw"
              position="60% 40%"
              className="aspect-[5/4] w-full rounded-[36px] md:rounded-[44px]"
            />
            <span className="sw-chip absolute left-5 top-5 bg-gold text-[#10231a]">
              <BookOpenText size={14} aria-hidden="true" />
              Featured Course
            </span>
          </div>
          <div>
            <div data-reveal>
              <Eyebrow className="text-accent">Featured Course</Eyebrow>
            </div>
            <Heading
              id="featured-heading"
              text="Introduction to Social Work *Practice*"
              className="sw-display m-0 mt-5 text-[clamp(2.1rem,4.4vw,3.7rem)] text-ink"
            />
            <p data-reveal className="sw-lead m-0 mt-6 max-w-xl text-ink-2">
              A practical introduction to core concepts, values and everyday practice in the Nigerian context.
            </p>
            <ul data-reveal className="m-0 mt-7 flex list-none flex-wrap gap-2.5 p-0">
              {["Core concepts", "Professional values", "Everyday practice"].map((topic) => (
                <li key={topic} className="sw-chip border border-line bg-card text-ink-2">
                  {topic}
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Btn href="/courses">View Course Overview</Btn>
              <TextLink href="/courses" className="text-ink">All courses</TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Where social work happens ── */}
      <section aria-labelledby="fields-heading" className="sw-sheet bg-paper-2 pb-28 pt-20 md:pb-40 md:pt-28">
        <div className="sw-wrap">
          <SectionHead
            id="fields-heading"
            eyebrow="Fields of practice"
            title="Where social work *happens* in Nigeria"
            lead="The profession reaches into many settings. Whichever one you work in, the same foundations apply: sound knowledge, clear ethics and careful judgement."
          />
          <div className="mt-12 md:mt-16">
            <FieldsList fields={FIELDS} />
          </div>
        </div>
      </section>

      {/* ── Practice scenario ── */}
      <section
        aria-labelledby="practice-heading"
        data-progress="view"
        className="sw-sheet sw-grain relative overflow-hidden bg-[#b94a28] pb-28 pt-20 text-white md:pb-40 md:pt-28"
      >
        <Contours className="text-white" />
        <div className="sw-wrap relative grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1fr_0.62fr]">
          <div>
            <div data-reveal>
              <Eyebrow className="text-white [--dot:var(--sw-gold-light)]">Practice scenario</Eyebrow>
            </div>
            <Heading
              id="practice-heading"
              text="Apply what you *learn*"
              accent="text-gold-light"
              className="sw-display m-0 mt-5 text-[clamp(2.1rem,4.6vw,3.9rem)]"
            />
            <blockquote data-reveal className="m-0 mt-8 border-l-2 border-white/40 pl-6 md:pl-8">
              <p className="sw-title m-0 text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.35] text-white">
                A family faces concerns about a child’s welfare and financial stress, while local services are
                limited. How would you assess their needs, prioritise support and work with the family and community
                to identify realistic next steps?
              </p>
            </blockquote>
            <ul data-reveal className="m-0 mt-9 flex list-none flex-wrap gap-2.5 p-0" aria-label="What the scenario asks of you">
              {["Assess needs", "Prioritise support", "Work with family and community", "Agree realistic next steps"].map((step, index) => (
                <li key={step} className="sw-chip bg-white/15 text-white backdrop-blur-sm">
                  <span className="tabular-nums text-gold-light">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal="scale" className="relative mx-auto w-full max-w-[380px]">
            <Photo
              photo={photos.openHands}
              sizes="(min-width: 1024px) 30vw, 80vw"
              className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-[36px]"
            />
          </div>
        </div>
      </section>

      {/* ── How learning works ── */}
      <section aria-labelledby="how-heading" className="sw-sheet bg-paper pb-28 pt-20 md:pb-40 md:pt-32">
        <div className="sw-wrap grid gap-x-14 gap-y-12 lg:grid-cols-[0.8fr_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              id="how-heading"
              eyebrow="On the platform"
              title="How learning *works*"
              lead="Each course is built to fit around work, family and the pace of practice."
            />
            <div data-reveal className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Btn href="/register">Create a free account</Btn>
              <TextLink href="/faq" className="text-ink">Read the FAQ</TextLink>
            </div>
          </div>
          <ol className="m-0 flex list-none flex-col gap-5 p-0">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className={cx(
                  "sticky overflow-hidden rounded-[32px] border border-line p-7 shadow-[0_-18px_50px_-30px_rgba(4,18,11,0.35)] md:p-10",
                  step.surface,
                )}
                style={{ top: `calc(1.5rem + ${index * 1.1}rem)` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className={cx("grid h-14 w-14 place-items-center rounded-2xl bg-current/10", step.tint)}>
                    <step.icon size={26} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className={cx("sw-em text-[3.4rem] leading-none opacity-80 md:text-[4.4rem]", step.tint)} aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="sw-display m-0 mt-10 text-[clamp(1.6rem,2.6vw,2.3rem)] md:mt-16">{step.title}</h3>
                <p className="m-0 mt-3 max-w-md text-[1.02rem] leading-relaxed opacity-80">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Learning for teams ── */}
      <section aria-labelledby="team-heading" className="sw-sheet bg-mint pb-28 pt-20 md:pb-36 md:pt-28">
        <div className="sw-wrap grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <div data-reveal>
              <Eyebrow className="text-accent">For organisations</Eyebrow>
            </div>
            <Heading
              id="team-heading"
              text="Develop learning for your *team*"
              className="sw-display m-0 mt-5 text-[clamp(2.1rem,4.4vw,3.7rem)] text-ink"
            />
            <p data-reveal className="sw-lead m-0 mt-6 max-w-xl text-ink-2">
              Discuss professional learning that responds to your team’s roles, practice challenges and development
              goals.
            </p>
            <div data-reveal className="mt-9">
              <Btn href="/contact">Discuss Training or Partnership</Btn>
            </div>
          </div>
          <div className="relative" data-reveal="clip">
            <Photo
              photo={photos.teamMeeting}
              sizes="(min-width: 1024px) 50vw, 92vw"
              className="aspect-[3/2] w-full rounded-[36px] md:rounded-[44px]"
            />
            <span className="sw-chip absolute bottom-5 left-5 bg-white/90 text-[#10231a] backdrop-blur">
              <MessagesSquare size={14} className="text-clay-ink" aria-hidden="true" />
              Shaped around your team
            </span>
          </div>
        </div>
      </section>

      {/* ── Closing call ── */}
      <section aria-labelledby="closing-heading" className="sw-sheet bg-paper px-2.5 pb-10 pt-2.5 sm:px-5 sm:pt-5 md:pb-14">
        <div className="sw-on-dark relative overflow-hidden rounded-[32px] md:rounded-[48px]" data-nav-bg="#0c2a1e">
          <Photo
            photo={photos.portraitJoy}
            place={false}
            sizes="100vw"
            position="60% 35%"
            className="absolute inset-0 h-full w-full"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-night/95 via-forest/75 to-forest/10" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent md:hidden" />
          <div className="sw-wrap relative flex min-h-[560px] flex-col justify-end py-14 md:min-h-[640px] md:justify-center md:py-24">
            <div className="max-w-2xl">
              <div data-reveal>
                <Eyebrow className="text-gold-light">Begin today</Eyebrow>
              </div>
              <Heading
                id="closing-heading"
                text="Choose a course that fits your *goals*"
                accent="text-gold-light"
                className="sw-display m-0 mt-5 text-[clamp(2.4rem,5.6vw,4.9rem)] text-[#fffdf4]"
              />
              <p data-reveal className="sw-lead m-0 mt-6 max-w-lg text-white/80">
                Find practical, relevant learning to strengthen your social work knowledge and practice.
              </p>
              <div data-reveal className="mt-9 flex flex-wrap gap-3">
                <Btn href="/courses" variant="gold">Explore Courses</Btn>
                <Btn href="/contact" variant="ghost">Contact Us</Btn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CollagePhoto({
  photo,
  className,
  aspect,
  shift,
  position,
}: {
  photo: (typeof photos)[keyof typeof photos];
  className?: string;
  aspect: string;
  shift: number;
  position?: string;
}) {
  return (
    <div className={className} data-progress="view">
      <div className="sw-drift" style={{ "--shift": `${shift}px` } as Vars}>
        <p className="sw-cap m-0 mb-2.5 flex items-center justify-between gap-3 text-ink-3">
          <span>{photo.place ?? ""}</span>
          <span className="normal-case tracking-normal opacity-80 max-md:hidden">Photo: {photo.by}</span>
        </p>
        <div data-reveal="clip">
          <Photo
            photo={photo}
            place={false}
            sizes="(min-width: 768px) 40vw, 50vw"
            position={position}
            className={cx("w-full rounded-[24px] md:rounded-[30px]", aspect)}
          />
        </div>
      </div>
    </div>
  );
}
