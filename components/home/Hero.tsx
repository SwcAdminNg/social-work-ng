"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { heroSlides } from "./content";
import { calmSpring } from "./motion";

const COUNT = heroSlides.length;
// How long each banner stays before the next one.
const DURATION = 8000;

// Cross-fade shared by the banner copy: opacity and a short vertical
// travel, run by CSS so the browser composites it.
const fade =
  "transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:!translate-none";

// Display headline: light weight with the final word of each line in bold.
function Headline({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line) => {
        const words = line.split(" ");
        const last = words.pop();
        return (
          <span key={line} className="block">
            {words.length > 0 && (
              <span className="font-light">{words.join(" ")} </span>
            )}
            <span className="font-bold">{last}</span>
            <span className="text-[#EBA937]">.</span>
          </span>
        );
      })}
    </>
  );
}

/**
 * Full-screen hero that moves through the four banners (Home, E-Learning,
 * Research, Policy and Advocacy) on a timer, with a progress rail that
 * doubles as the control. It pauses while hovered, focused, off screen or
 * when the tab is hidden, and never auto-advances for readers who prefer
 * reduced motion.
 */
export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });

  const [active, setActive] = useState(0);
  // Bumped on every change so the fill animation restarts even when the
  // same banner is chosen again.
  const [cycle, setCycle] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hidden, setHidden] = useState(false);

  const paused = !!reduce || hover || focus || hidden || !inView;

  const go = (i: number) => {
    setActive(((i % COUNT) + COUNT) % COUNT);
    setCycle((c) => c + 1);
  };

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => go(active + 1), DURATION);
    return () => clearTimeout(id);
  }, [active, cycle, paused]);

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active + 1;
    if (e.key === "ArrowLeft") next = active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = COUNT - 1;
    if (next === null) return;
    e.preventDefault();
    go(next);
    const target = ((next % COUNT) + COUNT) % COUNT;
    document.getElementById(`hero-tab-${heroSlides[target].id}`)?.focus();
  };

  // Banners before the active one sit slightly above, later ones below.
  const offset = (i: number) =>
    i === active ? "translate-y-0" : i < active ? "-translate-y-4" : "translate-y-4";

  // First paint: the opening banner settles into place in beats.
  const enter = (order: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { ...calmSpring, delay: 0.2 + order * 0.12 },
        };

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      data-nav-bg="rgba(4, 18, 11, 0.3)"
      data-nav-theme="dark"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative -mt-[84px] min-h-[100svh] bg-[#04120b] text-white overflow-hidden ${
        paused ? "is-paused" : ""
      }`}
    >
      {/* Photographs */}
      <div className="absolute inset-0" aria-hidden="true">
        {heroSlides.map((s, i) => {
          const isActive = i === active;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out motion-reduce:duration-300 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={s.image}
                alt=""
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                style={{ "--focus": s.focus } as React.CSSProperties}
                className={`h-full w-full object-cover object-[var(--focus)] md:object-center will-change-transform ${
                  isActive ? "hero-zoom" : ""
                }`}
              />
            </div>
          );
        })}
        {/* Legibility: deep at the foot where the copy sits, a lift under
            the header, and a soft left-to-right fall on wide screens. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04120b] via-[#04120b]/55 via-40% to-[#04120b]/10" />
        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#04120b]/80 via-[#04120b]/30 via-55% to-transparent" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#04120b]/60 to-transparent" />
      </div>

      {/* Copy */}
      <div className="relative z-10 min-h-[100svh] flex flex-col">
        <div className="flex-1 flex items-end">
          <div className="hero-copy w-full max-w-6xl mx-auto px-6 md:px-10 pt-[calc(84px+2rem)] pb-8 md:pb-9">
            <motion.div
              {...enter(0)}
              className="hero-meta flex items-center justify-between gap-6 mb-7 md:mb-9"
            >
              <p className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#F3C56B]">
                <span className="h-px w-8 bg-current" aria-hidden="true" />
                Social Work Consultancy Ltd
              </p>
              <p className="hidden sm:block text-[0.72rem] font-medium uppercase tracking-[0.22em] text-white/55">
                Jos, Plateau State · Nigeria
              </p>
            </motion.div>

            {/* All banners share one grid cell and cross-fade in place */}
            <div
              id="hero-panel"
              role="tabpanel"
              aria-labelledby={`hero-tab-${heroSlides[active].id}`}
              className="grid"
            >
              {heroSlides.map((s, i) => {
                const isActive = i === active;
                const Heading = isActive ? "h1" : "p";
                const first = i === 0;
                return (
                  <div
                    key={s.id}
                    aria-hidden={!isActive}
                    inert={!isActive ? true : undefined}
                    className={`[grid-area:1/1] self-end ${fade} ${offset(i)} ${
                      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <motion.div {...(first ? enter(1) : {})}>
                      <Heading className="t-display max-w-[20ch] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]">
                        <Headline lines={s.headline} />
                      </Heading>
                    </motion.div>
                    <div className="mt-7 md:mt-9 grid md:grid-cols-[minmax(0,560px)_auto] md:items-end gap-6 md:gap-12">
                      <motion.div
                        {...(first ? enter(2) : {})}
                        className="space-y-3 text-[1rem] md:text-[1.0625rem] leading-relaxed text-white/85"
                      >
                        {s.paragraphs.map((p, j) => (
                          <p key={p} className={j > 0 ? "hero-extra hidden sm:block" : ""}>
                            {p}
                          </p>
                        ))}
                      </motion.div>
                      <motion.div
                        {...(first ? enter(3) : {})}
                        className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-start lg:items-center gap-3"
                      >
                        <Link
                          href={s.primary.href}
                          className="group inline-flex items-center justify-center gap-2 min-h-[54px] px-7 bg-[#EBA937] text-[#10291E] text-[1rem] font-bold rounded-full shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:bg-[#f3bb57] active:scale-[0.97] transition-[background-color,scale] duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
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
                            className="inline-flex items-center justify-center min-h-[54px] px-7 text-white text-[1rem] font-bold rounded-full bg-white/10 ring-1 ring-inset ring-white/30 backdrop-blur-md hover:bg-white hover:text-[#14402F] active:scale-[0.97] transition-[background-color,color,scale] duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                          >
                            {s.secondary.label}
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress rail: one segment per banner. The active segment fills
            over the slide's duration; earlier ones stay full. */}
        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.8, delay: 0.8 },
              })}
          className="hero-rail w-full max-w-6xl mx-auto px-6 md:px-10 pb-[4.25rem] md:pb-[4.5rem]"
        >
          <div className="flex items-end justify-between gap-6 mb-4">
            <p className="md:hidden text-[0.9rem] font-bold text-white">
              <span className="text-white/50 tabular-nums mr-2">
                {String(active + 1).padStart(2, "0")}
              </span>
              {heroSlides[active].tab}
            </p>
            <p className="hidden md:block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/50">
              Our focus areas
            </p>
            <a
              href="#about"
              className="group inline-flex items-center gap-2 text-[0.8rem] font-semibold text-white/70 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Scroll
              <span className="flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/30 group-hover:ring-white/70 transition-colors">
                <ArrowDown
                  className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
          <div
            role="tablist"
            aria-label="Our focus areas"
            className="grid grid-cols-4 gap-3 md:gap-6"
            onFocus={() => setFocus(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setFocus(false);
            }}
          >
            {heroSlides.map((s, i) => {
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
                  onClick={() => go(i)}
                  onKeyDown={onTabKeyDown}
                  className="group text-left pt-3 pb-1 cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <span className="block h-[2px] w-full rounded-full bg-white/20 overflow-hidden">
                    <span
                      key={selected ? `fill-${cycle}` : "idle"}
                      style={
                        { "--hero-duration": `${DURATION}ms` } as React.CSSProperties
                      }
                      className={`block h-full w-full origin-left rounded-full bg-[#EBA937] ${
                        selected
                          ? "hero-fill"
                          : i < active
                            ? "scale-x-100"
                            : "scale-x-0"
                      }`}
                    />
                  </span>
                  <span className="mt-3 hidden md:flex items-baseline gap-3">
                    <span className="text-[0.72rem] font-semibold tabular-nums text-white/45">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-[0.92rem] font-bold leading-tight transition-colors duration-300 ${
                        selected
                          ? "text-white"
                          : "text-white/55 group-hover:text-white/85"
                      }`}
                    >
                      {s.tab}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
