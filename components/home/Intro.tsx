"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useTransform } from "motion/react";
import { NextCue, StepBar, crossFade, useStepScroll } from "./ScrollSteps";
import { intro } from "./content";

const COUNT = intro.chunks.length;

/**
 * "Building the Knowledge…" introduction. The section fills the screen and
 * stays in place while the reader scrolls through its five paragraphs one
 * at a time, so no screen ever shows more than a short, readable chunk.
 *
 * Phones and tablets: the photo fills the screen behind the content, clear
 * at the top and fading to dark where the text sits at the bottom.
 * Laptops and up: heading and framed photo on the left, text on the right.
 */
export default function Intro() {
  const { ref, progress, active, goTo, reduce } =
    useStepScroll<HTMLElement>(COUNT);

  // The photo drifts slowly closer across the whole section.
  const imageScale = useTransform(
    progress,
    [0, 1],
    reduce ? [1, 1] : [1.04, 1.16],
  );

  const last = active === COUNT - 1;
  const next = last
    ? "Continue below"
    : `Next: ${intro.chunks[active + 1].label}`;

  // Earlier chunks sit slightly above, later ones below, so motion follows
  // the scroll direction.
  const offset = (i: number) =>
    i === active
      ? "translate-y-0"
      : i < active
        ? "-translate-y-5"
        : "translate-y-5";

  return (
    <section
      ref={ref}
      aria-labelledby="intro-heading"
      className="relative h-[300svh] bg-[#04120b] lg:bg-white dark:lg:bg-[#0a0a0a]"
    >
      <div className="sticky top-[84px] h-[calc(100svh-84px)] min-h-[480px] overflow-hidden">
        {/* Phones and tablets: full-screen photo behind the content */}
        <div className="absolute inset-0 lg:hidden" aria-hidden="true">
          <motion.img
            src={intro.image}
            alt=""
            decoding="async"
            fetchPriority="low"
            style={{ scale: imageScale }}
            className="absolute inset-0 w-full h-full object-cover object-[68%_25%] will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#04120b]/45 from-0% via-transparent via-[18%] to-transparent to-[30%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04120b] from-[38%] via-[#04120b]/80 via-[55%] to-transparent to-[78%]" />
        </div>

        <div className="relative h-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-6 py-5 sm:py-8 lg:py-[clamp(1.5rem,5svh,3.5rem)] flex flex-col justify-end lg:grid lg:grid-rows-1 lg:grid-cols-[5fr_6fr] gap-4 sm:gap-6 lg:gap-14">
          {/* Heading, and the framed photo on laptops */}
          <div className="lg:flex lg:flex-col lg:min-h-0 lg:gap-6">
            <div className="intro-heading max-w-2xl">
              <p className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#F3C56B] lg:text-[#2D6A4F] dark:lg:text-[#52b788] mb-3">
                <span className="h-px w-6 bg-current" aria-hidden="true" />
                {intro.eyebrow}
              </p>
              <h2
                id="intro-heading"
                className="text-[1.75rem] sm:text-[2.3rem] lg:text-[2.9rem] font-bold leading-[1.1] tracking-[-0.03em] text-white lg:text-gray-900 dark:lg:text-gray-50"
              >
                {intro.title}
              </h2>
            </div>

            <div className="relative hidden lg:block flex-1 min-h-0">
              <div
                className="absolute -top-3 -left-3 w-24 h-24 rounded-3xl bg-[#EBA937]/25 dark:bg-[#EBA937]/15"
                aria-hidden="true"
              />
              <div className="relative h-full overflow-hidden rounded-3xl shadow-2xl shadow-gray-300/40 dark:shadow-none">
                <motion.img
                  src={intro.image}
                  alt={intro.imageAlt}
                  fetchPriority="low"
                  decoding="async"
                  style={{ scale: imageScale }}
                  className="absolute inset-0 w-full h-full object-cover object-[60%_35%] will-change-transform dark:brightness-90"
                />
                {/* Which part of the story is showing */}
                <span className="absolute left-4 bottom-4 inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-white/90 dark:bg-gray-900/85 text-[0.9rem] font-bold text-[#14402F] dark:text-white shadow-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2D6A4F] text-white text-[0.75rem] tabular-nums">
                    {active + 1}/{COUNT}
                  </span>
                  {intro.chunks[active].label}
                </span>
              </div>
            </div>
          </div>

          {/* The paragraphs, one at a time */}
          <div className="flex flex-col min-h-0 lg:justify-center lg:gap-10">
            <div className="intro-stack grid content-center">
              {intro.chunks.map((chunk, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={chunk.label}
                    aria-hidden={!isActive}
                    inert={!isActive ? true : undefined}
                    className={`[grid-area:1/1] self-end lg:self-center ${crossFade} ${offset(i)} ${
                      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <p className="flex items-center gap-3 text-[0.95rem] font-bold text-[#F3C56B] lg:text-[#B7791F] dark:lg:text-[#F3C56B] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                      <span
                        className="h-px w-8 bg-current"
                        aria-hidden="true"
                      />
                    </p>
                    <h3 className="mt-2 text-[1.4rem] sm:text-[1.75rem] lg:text-[2rem] font-bold leading-tight tracking-[-0.02em] text-white lg:text-[#14402F] dark:lg:text-white">
                      {chunk.label}
                    </h3>
                    <p className="intro-chunk mt-2.5 lg:mt-4 text-white/90 lg:text-gray-700 dark:lg:text-gray-300 max-w-[60ch]">
                      {chunk.text}
                    </p>
                    {i === COUNT - 1 && (
                      <Link
                        href={intro.button.href}
                        className="group mt-5 lg:mt-6 inline-flex items-center gap-2 min-h-[52px] px-7 bg-[#EBA937] text-[#10291E] lg:bg-[#2D6A4F] lg:text-white text-[1.0625rem] font-bold rounded-full shadow-lg shadow-black/20 lg:shadow-[#2D6A4F]/20 hover:bg-[#f3bb57] lg:hover:bg-[#1e4d38] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/40"
                      >
                        {intro.button.label}
                        <ArrowRight
                          className="w-5 h-5 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress and what comes next. On phones the cue has a fixed
                width so a changing label never resizes the bars, and right
                padding leaves room for the floating light/dark button. On
                laptops the cue sits on its own line under the bars. */}
            <div className="mt-3 lg:mt-0 pr-14 lg:pr-0 flex lg:flex-col items-center lg:items-stretch gap-3 lg:gap-4">
              <div
                className="flex-1 min-w-0 flex items-start gap-1.5 lg:gap-3"
                aria-label="Choose a part"
              >
                {intro.chunks.map((chunk, i) => (
                  <StepBar
                    key={chunk.label}
                    progress={progress}
                    index={i}
                    count={COUNT}
                    label={chunk.label}
                    current={i === active}
                    onSelect={() => goTo(i)}
                    tone="split"
                    showLabel
                  />
                ))}
              </div>
              <div className="w-[9.5rem] lg:w-auto lg:self-end shrink-0">
                <NextCue
                  progress={progress}
                  count={COUNT}
                  next={next}
                  tone="split"
                  wrap
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
