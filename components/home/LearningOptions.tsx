"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { Eyebrow, Reveal, useMediaQuery } from "./motion";
import { learningOptions, type ServiceCard } from "./content";

// Smoothing for the horizontal travel: settles without wobble.
const spring = { stiffness: 220, damping: 32, mass: 0.6 };

// A learning option as a poster: the photograph fills the card and the
// words sit on a dark gradient at its foot.
function Poster({
  item,
  index,
  className = "",
  revealFrom,
}: {
  item: ServiceCard;
  index: number;
  className?: string;
  revealFrom?: "right";
}) {
  const copy = (
    <>
      <p className="flex items-center gap-3 text-[0.8rem] font-bold tabular-nums text-[#F3C56B]">
        {String(index + 1).padStart(2, "0")}
        <span className="h-px w-8 bg-current" aria-hidden="true" />
      </p>
      <h3
        id={`option-${item.id}-title`}
        className="t-h3 font-bold mt-4 text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.4)]"
      >
        {item.title}
      </h3>
      <p className="mt-3 text-[1.05rem] font-medium leading-snug text-[#F3C56B]">
        {item.tagline}
      </p>
      <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-white/85 max-w-[56ch]">
        {item.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Link
        href={item.button.href}
        className="group mt-6 inline-flex items-center gap-2 min-h-[50px] px-6 rounded-full bg-[#EBA937] text-[#10291E] text-[0.95rem] font-bold shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:bg-[#f3bb57] active:scale-[0.97] transition-[background-color,scale] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
      >
        {item.button.label}
        <ArrowRight
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </>
  );

  return (
    <article
      aria-labelledby={`option-${item.id}-title`}
      className={`relative overflow-hidden bg-[#04120b] text-white flex flex-col justify-end ${className}`}
    >
      <img
        src={item.image}
        alt={item.imageAlt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04120b] via-[#04120b]/75 via-40% to-[#04120b]/5" />
      <div className="relative p-7 md:p-10 lg:p-12">
        {revealFrom ? (
          <Reveal from={revealFrom} amount={0.2}>
            {copy}
          </Reveal>
        ) : (
          copy
        )}
      </div>
    </article>
  );
}

/**
 * The three learning options as full-photograph posters. On laptops the
 * row pins and vertical scrolling slides the posters in from the right;
 * on phones they stack, each poster's words arriving from the right as it
 * comes into view.
 */
export default function LearningOptions() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const horizontal = wide && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (!horizontal) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(
        Math.max(0, track.scrollWidth - document.documentElement.clientWidth),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [horizontal]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, spring);
  const x = useTransform(progress, [0, 1], [0, -distance]);
  const barScale = useTransform(progress, [0, 1], [0.1, 1]);

  return (
    <section
      id="learning-options"
      aria-label="Three learning options"
      className="relative bg-white dark:bg-[#0a0a0a] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 md:pt-32 pb-20 md:pb-28 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <Eyebrow>Three learning options</Eyebrow>
        </Reveal>
      </div>

      {horizontal ? (
        <div
          ref={ref}
          className="relative mt-6"
          style={{ height: `calc(100vh + ${distance}px)` }}
        >
          <div className="sticky top-[84px] h-[calc(100vh-84px)] overflow-hidden flex flex-col justify-center">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex items-stretch gap-6 w-max pl-[max(1.5rem,calc((100vw-72rem)/2+2.5rem))] pr-[10vw] will-change-transform"
            >
              {learningOptions.map((item, i) => (
                <Poster
                  key={item.id}
                  item={item}
                  index={i}
                  className="w-[min(70vw,960px)] h-[min(72vh,700px)] shrink-0 rounded-[32px]"
                />
              ))}
            </motion.div>
            <div className="max-w-6xl w-full mx-auto px-6 md:px-10 mt-8 flex items-center gap-5">
              <div className="flex-1 h-[2px] rounded-full bg-[#2D6A4F]/15 dark:bg-white/15 overflow-hidden">
                <motion.div
                  style={{ scaleX: barScale }}
                  className="h-full origin-left rounded-full bg-[#2D6A4F] dark:bg-[#52b788]"
                />
              </div>
              <p className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Keep scrolling
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div ref={ref} className="mt-8 px-4 md:px-6 space-y-4">
          {learningOptions.map((item, i) => (
            <Poster
              key={item.id}
              item={item}
              index={i}
              revealFrom="right"
              className="min-h-[88svh] rounded-[28px]"
            />
          ))}
        </div>
      )}
    </section>
  );
}
