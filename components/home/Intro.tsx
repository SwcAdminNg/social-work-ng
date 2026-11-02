"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { intro } from "./content";

export default function Intro() {
  const reduce = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  // The photo moves inside its frame, so the frame feels like a window.
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : ["-8%", "8%"],
  );
  const accentY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [60, -60],
  );

  return (
    <section
      aria-labelledby="intro-heading"
      className="bg-white dark:bg-[#0a0a0a] pt-24 md:pt-28 pb-16 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-start">
        {/* Image */}
        <Reveal from="left" className="relative lg:sticky lg:top-28">
          <motion.div
            style={{ y: accentY }}
            className="absolute -top-6 -left-6 w-32 h-32 rounded-3xl bg-[#EBA937]/25 dark:bg-[#EBA937]/15"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-5 -right-5 w-2/3 h-2/3 rounded-3xl border-2 border-[#2D6A4F]/25 dark:border-[#52b788]/25"
            aria-hidden="true"
          />
          <div
            ref={imageRef}
            className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-gray-300/50 dark:shadow-none"
          >
            <motion.img
              src={intro.image}
              alt={intro.imageAlt}
              loading="lazy"
              style={{ y: imageY, scale: 1.18 }}
              className="absolute inset-0 w-full h-full object-cover dark:brightness-90"
            />
          </div>
        </Reveal>

        {/* Copy */}
        <div>
          <Reveal from="right">
            <SectionHeading
              id="intro-heading"
              eyebrow={intro.eyebrow}
              title={intro.title}
              align="left"
            />
            <p className="mt-6 text-[1.12rem] leading-relaxed text-gray-800 dark:text-gray-200">
              {intro.lead}
            </p>
          </Reveal>
          <div className="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-gray-600 dark:text-gray-400 max-w-[62ch]">
            {intro.paragraphs.map((p, i) => (
              <Reveal key={p} from="right" delay={0.05 * i}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal from="up">
            <Link
              href={intro.button.href}
              className="group mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-[#2D6A4F] text-white text-[0.95rem] font-bold rounded-full shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#1e4d38] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
            >
              {intro.button.label}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
