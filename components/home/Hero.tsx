"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChartColumnIncreasing,
  ChevronDown,
  House,
  Users,
} from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { heroSlides } from "./content";

const tabs = [
  {
    icon: House,
    short: "Home",
    tone: "bg-[#2D6A4F] text-white",
    badge: "bg-[#2D6A4F]",
  },
  {
    icon: BookOpen,
    short: "E-Learning",
    tone: "bg-[#557F8F] text-white",
    badge: "bg-[#557F8F]",
  },
  {
    icon: ChartColumnIncreasing,
    short: "Research",
    tone: "bg-[#EBA937] text-[#10291E]",
    badge: "bg-[#EBA937] !text-[#10291E]",
  },
  {
    icon: Users,
    short: "Policy",
    tone: "bg-[#14402F] text-white",
    badge: "bg-[#14402F]",
  },
];

const COUNT = heroSlides.length;

// Opacity and transform only, run by CSS so the browser animates them on
// the compositor — smooth even while the page is busy scrolling.
const fade =
  "transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,translate] motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:!translate-none motion-reduce:!scale-100";

// How far through banner `index` the reader is, 0 → 1.
function useSegment(progress: MotionValue<number>, index: number) {
  return useTransform(progress, [index / COUNT, (index + 1) / COUNT], [0, 1]);
}

// Fills as the reader scrolls through that tab's banner.
function TabProgress({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const scaleX = useSegment(progress, index);
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-black/15 overflow-hidden"
    >
      <motion.span
        style={{ scaleX }}
        className="block h-full origin-left rounded-full bg-white"
      />
    </span>
  );
}

// Phones: story-style bars that fill continuously while scrolling, so
// every bit of scroll shows visible progress. Each bar is also a button.
function SegmentBar({
  progress,
  index,
  label,
  current,
  onSelect,
}: {
  progress: MotionValue<number>;
  index: number;
  label: string;
  current: boolean;
  onSelect: () => void;
}) {
  const scaleX = useSegment(progress, index);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show ${label}`}
      aria-current={current ? "true" : undefined}
      className="flex-1 flex items-center h-11 cursor-pointer"
    >
      <span className="relative block w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
        <motion.span
          style={{ scaleX }}
          className="absolute inset-0 origin-left rounded-full bg-[#EBA937]"
        />
      </span>
    </button>
  );
}

// A ring that fills as the reader scrolls towards the next banner, with a
// label saying what comes next, so it is clear that scrolling is working.
function NextCue({
  progress,
  active,
  compact = false,
}: {
  progress: MotionValue<number>;
  active: number;
  compact?: boolean;
}) {
  const ring = useTransform(progress, (v) => {
    const x = Math.min(Math.max(v, 0) * COUNT, COUNT - 0.0001);
    return x - Math.floor(x);
  });
  const last = active === COUNT - 1;
  const next = last
    ? "Continue below"
    : `Next: ${compact ? tabs[active + 1].short : heroSlides[active + 1].tab}`;

  return (
    <div className="flex items-center gap-2.5 text-white" aria-hidden="true">
      <span className="relative flex items-center justify-center w-10 h-10 shrink-0">
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="3"
          />
          <motion.circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            stroke="#EBA937"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pathLength: ring }}
          />
        </svg>
        <ChevronDown className="hero-nudge w-5 h-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-[0.78rem] font-medium text-white/70">
          Keep scrolling
        </span>
        <span className="block text-[0.95rem] font-bold whitespace-nowrap">
          {next}
        </span>
      </span>
    </div>
  );
}

// Each photo eases in a little closer as its banner is scrolled through,
// so the screen visibly responds to every scroll.
function HeroPhoto({
  slide,
  index,
  active,
  progress,
  still,
}: {
  slide: (typeof heroSlides)[number];
  index: number;
  active: boolean;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const local = useSegment(progress, index);
  const scale = useTransform(local, [0, 1], still ? [1, 1] : [1, 1.08]);
  return (
    <motion.div
      style={{ scale }}
      className={`absolute inset-0 will-change-[opacity,transform] transition-opacity duration-700 ease-out motion-reduce:duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src={slide.image}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority={index === 0 ? "high" : "low"}
        style={{ "--focus": slide.focus } as React.CSSProperties}
        className="w-full h-full object-cover object-[var(--focus)] md:object-center"
      />
    </motion.div>
  );
}

/**
 * Full-screen hero that stays in place while the reader scrolls through
 * the four banners (Home, E-Learning, Research, Policy and Advocacy), then
 * releases into the rest of the page. All four banners stay mounted and
 * cross-fade, so a change starts instantly and can reverse mid-way.
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)));
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActive(next);
  });

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const range = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + range * (index / COUNT) + (index ? 4 : 0),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = COUNT - 1;
    let next = -1;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next < 0) return;
    e.preventDefault();
    goTo(next);
    document.getElementById(`hero-tab-${heroSlides[next].id}`)?.focus();
  };

  // Banners before the active one sit slightly above, later ones below,
  // so the motion always follows the scroll direction.
  const offset = (i: number) =>
    i === active
      ? "translate-y-0"
      : i < active
        ? "-translate-y-6"
        : "translate-y-6";

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      data-nav-bg="rgba(4, 18, 11, 0.35)"
      data-nav-theme="dark"
      className="relative -mt-[84px] h-[280svh] bg-[#04120b]"
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden flex flex-col bg-[#04120b]">
        {/* Photos. Phones show the photo in the top part of the screen so
            more of it is visible; larger screens fill the background. */}
        <div className="absolute inset-x-0 top-0 h-[66%] md:h-full overflow-hidden">
          {heroSlides.map((s, i) => (
            <HeroPhoto
              key={s.id}
              slide={s}
              index={i}
              active={i === active}
              progress={scrollYProgress}
              still={!!reduce}
            />
          ))}
        </div>

        {/* Keeps the header legible over bright photos */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04120b]/70 to-transparent" />
        {/* Phones: photo fades into the dark panel that holds the text */}
        <div className="absolute inset-x-0 top-0 h-[calc(66%+2px)] md:hidden bg-gradient-to-b from-transparent from-[45%] to-[#04120b] to-[98%]" />
        {/* Tablets and desktops: fade from the left behind the text */}
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#04120b]/90 via-[#04120b]/55 to-[#04120b]/5" />
        <div className="absolute inset-x-0 bottom-0 h-56 hidden md:block bg-gradient-to-t from-[#04120b]/80 to-transparent" />

        {/* Copy */}
        <div className="relative z-10 flex-1 flex items-end md:items-center">
          <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-6 pt-[calc(84px+1.5rem)] pb-6 md:pb-[clamp(1rem,4svh,2.5rem)]">
            {/* All banners share one grid cell and cross-fade in place */}
            <div
              id="hero-panel"
              role="tabpanel"
              aria-labelledby={`hero-tab-${heroSlides[active].id}`}
              className="grid max-w-[680px]"
            >
              {heroSlides.map((s, i) => {
                const isActive = i === active;
                const Heading = isActive ? "h1" : "p";
                const Icon = tabs[i].icon;
                return (
                  <div
                    key={s.id}
                    aria-hidden={!isActive}
                    inert={!isActive ? true : undefined}
                    className={`[grid-area:1/1] self-end md:self-center ${fade} ${offset(i)} ${
                      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {/* Phones: a badge naming this banner */}
                    <span
                      className={`md:hidden inline-flex items-center gap-2 mb-4 pl-1.5 pr-4 py-1.5 rounded-full text-[0.95rem] font-bold text-white ring-1 ring-white/25 shadow-lg shadow-black/30 ${tabs[i].badge}`}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      {s.tab}
                    </span>
                    <p className="hidden md:flex items-center gap-3 mb-4 text-base font-bold text-[#F3C56B]">
                      <span
                        className="h-px w-8 bg-current"
                        aria-hidden="true"
                      />
                      Social Work Consultancy Ltd
                    </p>
                    <Heading className="hero-title font-bold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.3)]">
                      {s.headline.map((line) => (
                        <span key={line} className="block">
                          {line}
                          {s.headline.length > 1 && (
                            <span className="text-[#EBA937]">.</span>
                          )}
                        </span>
                      ))}
                    </Heading>
                    <div className="hero-body mt-4 space-y-3 max-w-[580px] text-white/90">
                      {s.paragraphs.map((p, j) => (
                        <p key={p} className={j > 0 ? "hero-extra" : undefined}>
                          {p}
                        </p>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                      <Link
                        href={s.primary.href}
                        className="group inline-flex items-center justify-center gap-2 min-h-[54px] px-7 bg-[#EBA937] text-[#10291E] text-[1.0625rem] font-bold rounded-full shadow-lg shadow-black/25 hover:bg-[#f3bb57] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                      >
                        {s.primary.label}
                        <ArrowRight
                          className="w-5 h-5 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                      {s.secondary && (
                        <Link
                          href={s.secondary.href}
                          className="hero-extra inline-flex items-center justify-center min-h-[52px] px-7 text-white text-[1.0625rem] font-bold rounded-full border-2 border-white/70 hover:bg-white hover:text-[#14402F] active:scale-[0.97] transition-[background-color,color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                        >
                          {s.secondary.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phones: progress bars and what comes next */}
            {/* Right padding leaves room for the floating light/dark button */}
            <div className="md:hidden mt-5 pr-14 flex items-center gap-3">
              <div
                className="flex-1 flex items-center gap-1.5"
                aria-label="Choose an area"
              >
                {heroSlides.map((s, i) => (
                  <SegmentBar
                    key={s.id}
                    progress={scrollYProgress}
                    index={i}
                    label={s.tab}
                    current={i === active}
                    onSelect={() => goTo(i)}
                  />
                ))}
              </div>
              <NextCue progress={scrollYProgress} active={active} compact />
            </div>
          </div>
        </div>

        {/* Tabs — tablets and desktops */}
        <div className="relative z-10 hidden md:block w-full max-w-6xl mx-auto px-8 lg:px-6 pb-6">
          <div className="flex justify-end mb-3">
            <NextCue progress={scrollYProgress} active={active} />
          </div>
          <div
            role="tablist"
            aria-label="Our focus areas"
            className="grid grid-cols-4 gap-3 lg:gap-4"
          >
            {heroSlides.map((s, i) => {
              const tab = tabs[i];
              const Icon = tab.icon;
              const selected = i === active;
              return (
                <button
                  key={s.id}
                  id={`hero-tab-${s.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls="hero-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={onTabKeyDown}
                  className={`relative overflow-hidden flex items-center gap-3 min-h-[68px] px-4 lg:px-5 pb-1 rounded-2xl text-left shadow-lg shadow-black/25 cursor-pointer transition-[opacity,translate] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${tab.tone} ${
                    selected
                      ? "ring-2 ring-white/90 lg:-translate-y-1.5"
                      : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <Icon className="w-6 h-6 shrink-0" aria-hidden="true" />
                  <span className="text-[0.95rem] lg:text-[1.05rem] font-bold leading-tight">
                    {s.tab}
                  </span>
                  <TabProgress progress={scrollYProgress} index={i} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
