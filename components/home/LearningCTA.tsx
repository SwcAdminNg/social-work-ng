"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { scrollSpring } from "./motion";
import { learningCta } from "./content";

// The band starts as an inset rounded card and opens out to full width as
// it reaches the middle of the screen.
export default function LearningCTA() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const progress = useSpring(scrollYProgress, scrollSpring);
  const inset = useTransform(progress, [0, 1], reduce ? [0, 0] : [7, 0]);
  const radius = useTransform(progress, [0, 1], reduce ? [0, 0] : [40, 0]);
  const clipPath = useTransform(
    [inset, radius] as const,
    ([i, r]: number[]) => `inset(0% ${i}% round ${r}px)`,
  );
  const contentY = useTransform(progress, [0, 1], reduce ? [0, 0] : [60, 0]);
  const ringRotate = useTransform(progress, [0, 1], reduce ? [0, 0] : [-40, 0]);

  return (
    <section
      ref={ref}
      aria-labelledby="learning-cta-heading"
      className="bg-[#EEF5F1] dark:bg-[#0f1713]"
    >
      <motion.div
        style={{ clipPath }}
        data-nav-bg="rgba(20, 64, 47, 0.85)"
        data-nav-theme="dark"
        className="relative overflow-hidden bg-[#14402F] dark:bg-[#0f2a20] px-6 py-24 md:py-32"
      >
        <motion.div
          style={{ rotate: ringRotate }}
          className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full border-[40px] border-white/5"
          aria-hidden="true"
        />
        <div
          className="absolute -left-20 -bottom-28 w-80 h-80 rounded-full bg-[#EBA937]/10 blur-2xl"
          aria-hidden="true"
        />
        <motion.div
          style={{ y: contentY }}
          className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center"
        >
          <div className="max-w-2xl">
            <h2
              id="learning-cta-heading"
              className="text-[2.1rem] sm:text-[2.8rem] lg:text-[3.3rem] font-bold leading-[1.05] tracking-[-0.03em] text-white"
            >
              {learningCta.title}
            </h2>
            <div className="mt-6 space-y-3 text-[1rem] leading-relaxed text-white/80">
              {learningCta.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p className="text-white/65">{learningCta.organisations}</p>
            </div>
          </div>
          <Link
            href={learningCta.button.href}
            className="group inline-flex items-center justify-center gap-2 self-start lg:self-center px-8 py-4 bg-[#EBA937] text-[#10291E] text-[1rem] font-bold rounded-full shadow-lg shadow-black/20 hover:bg-[#f3bb57] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#14402F]"
          >
            {learningCta.button.label}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
