"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Eyebrow, Reveal, WordReveal, calmSpring } from "@/components/home/motion";
import { opening } from "./content";

/**
 * The page's opening: the organisation named in large type, its tagline,
 * and the photograph of a facilitated discussion set into the page whole,
 * so no face or gesture is ever cropped away. The picture settles in as
 * the page opens and eases a touch closer while the reader scrolls.
 */
export default function AboutOpening() {
  const [first, second] = opening.paragraphs;

  return (
    <section
      aria-labelledby="about-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] pt-12 pb-28 md:pt-20 md:pb-32"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal from="none">
            <Eyebrow className="justify-center mb-6">{opening.eyebrow}</Eyebrow>
          </Reveal>
          <h1
            id="about-heading"
            className="t-display font-light text-gray-900 dark:text-[#ECF2EE]"
          >
            <WordReveal text={opening.titleLead} />{" "}
            <strong className="font-bold">
              <WordReveal text={opening.titleBold} delay={0.08} />
            </strong>
            <span className="text-[#EBA937]" aria-hidden="true">
              .
            </span>
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-6 t-lead text-gray-700 dark:text-[#C3D1C8]">
              {opening.tagline}
            </p>
          </Reveal>
        </div>

        <Photo />

        <div className="mt-12 md:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[56ch]">
                {first}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 t-body text-gray-600 dark:text-[#A3B3A9] max-w-[62ch]">
                {second}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="lg:col-span-5 lg:pt-2">
            <dl className="divide-y divide-gray-900/10 dark:divide-white/10 border-y border-gray-900/10 dark:border-white/10">
              {opening.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-4 py-4"
                >
                  <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9] pt-1">
                    {fact.label}
                  </dt>
                  <dd className="text-[0.98rem] font-medium text-gray-900 dark:text-[#ECF2EE]">
                    {fact.href ? (
                      <Link
                        href={fact.href}
                        className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                      >
                        {fact.value}
                      </Link>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// The photograph at its own proportions. It arrives with a soft rise and
// then creeps very slightly closer as it travels up the screen: a few
// percent, so the edges never lose anyone at the table.
function Photo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1.02, 1.08],
  );

  return (
    <motion.figure
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.4 } : { ...calmSpring, delay: 0.2 }}
      className="relative mt-12 md:mt-16 aspect-[16/9] overflow-hidden rounded-[28px] md:rounded-[40px] bg-[#14402F] shadow-[0_50px_100px_-50px_rgba(20,64,47,0.5)] dark:shadow-none"
    >
      <motion.img
        src={opening.image}
        alt={opening.imageAlt}
        width={1672}
        height={941}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{ scale }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      <figcaption className="absolute left-4 bottom-4 md:left-6 md:bottom-6 inline-flex items-center rounded-full bg-black/35 backdrop-blur-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/85">
        {opening.imageNote}
      </figcaption>
    </motion.figure>
  );
}
