"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, HeartHandshake, Laptop, Scale } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import SectionHeading from "./SectionHeading";
import {
  Reveal,
  calmSpring,
  trackKeyframes,
  useCardTrack,
  useMediaQuery,
} from "./motion";
import { learningCategories } from "./content";

const icons = [HeartHandshake, Laptop, Scale];
const items = learningCategories.items;
const COUNT = items.length;

// Smoothing for the horizontal travel: settles without wobble.
const spring = { stiffness: 220, damping: 32, mass: 0.6 };

type Category = (typeof items)[number];

// One learning area as a card: its focus, what it covers and its eight
// themes, which cascade in when the card comes to the front.
function AreaCard({
  cat,
  index,
  className = "",
  current,
}: {
  cat: Category;
  index: number;
  className?: string;
  // On the track: whether the card has reached the front. Off the track
  // (stacked), the themes cascade in when the card scrolls into view.
  current?: boolean;
}) {
  const onTrack = current !== undefined;
  const reduce = useReducedMotion();
  const Icon = icons[index];
  return (
    <article
      id={`area-${cat.id}`}
      aria-labelledby={`area-${cat.id}-title`}
      className={`rounded-[32px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 shadow-[0_30px_60px_-30px_rgba(20,64,47,0.3)] dark:shadow-none p-7 md:p-9 lg:p-10 scroll-mt-28 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#2D6A4F] text-white">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <span className="text-[0.75rem] font-bold tabular-nums text-gray-400">
          {String(index + 1).padStart(2, "0")} / {String(COUNT).padStart(2, "0")}
        </span>
      </div>
      <h3
        id={`area-${cat.id}-title`}
        className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-[#2D6A4F] dark:text-[#74c69d]"
      >
        {cat.title}
      </h3>
      <p className="mt-3 t-h3 font-bold text-gray-900 dark:text-[#ECF2EE] max-w-[28ch]">
        {cat.tagline}
      </p>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">
        {cat.text}
      </p>
      <p className="mt-6 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-[#A3B3A9]">
        {learningCategories.themesLabel}
      </p>
      <motion.ul
        className="mt-3 grid sm:grid-cols-2 gap-x-8 gap-y-2"
        initial="hidden"
        animate={onTrack ? (current ? "show" : "hidden") : undefined}
        whileInView={onTrack ? undefined : "show"}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.1 }}
      >
        {cat.themes.map((theme) => (
          <motion.li
            key={theme}
            variants={{
              hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            transition={calmSpring}
            className="flex gap-3 text-[0.92rem] leading-snug text-gray-700 dark:text-[#C3D1C8] py-1.5 border-b border-gray-100 dark:border-white/10"
          >
            <Check
              className="w-4 h-4 mt-0.5 shrink-0 text-[#2D6A4F] dark:text-[#74c69d]"
              aria-hidden="true"
            />
            {theme}
          </motion.li>
        ))}
      </motion.ul>
    </article>
  );
}

/**
 * "Explore Learning That Reflects Your Responsibilities". The three
 * learning areas as cards on a track: on laptops the row pins and vertical
 * scrolling brings each card to the front, holding on it long enough to
 * read before sliding to the next. Phones stack the cards, each settling
 * into view as it arrives.
 */
export default function LearningCategories() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 700px)");
  const horizontal = wide && !reduce;

  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { distance, extra, stops } = useCardTrack(horizontal, trackRef, COUNT);
  const { input, output } = trackKeyframes(stops);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, spring);
  const x = useTransform(progress, input, output);
  const barScale = useTransform(scrollYProgress, [0, 1], [0.08, 1]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)));
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <section
      id="learning-areas"
      aria-labelledby="categories-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 md:pt-32 pb-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          id="categories-heading"
          eyebrow={learningCategories.eyebrow}
          title={learningCategories.title}
          align="center"
        >
          {learningCategories.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </SectionHeading>
      </div>

      {horizontal ? (
        <div
          ref={ref}
          className="relative mt-10"
          style={{ height: `calc(100vh + ${distance + extra}px)` }}
        >
          <div className="sticky top-[84px] h-[calc(100vh-84px)] overflow-hidden flex flex-col justify-center">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex items-start gap-6 w-max pl-[max(1.5rem,calc((100vw-72rem)/2+2.5rem))] pr-[max(1.5rem,calc((100vw-72rem)/2+2.5rem))] will-change-transform"
            >
              {items.map((cat, i) => (
                <AreaCard
                  key={cat.id}
                  cat={cat}
                  index={i}
                  current={i <= active}
                  className="w-[min(68vw,920px)] shrink-0"
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
              <p className="tabular-nums text-[0.85rem] font-semibold text-gray-700 dark:text-[#D7E2DB]">
                {String(active + 1).padStart(2, "0")}
                <span className="text-gray-400"> / {String(COUNT).padStart(2, "0")}</span>
              </p>
              <p className="hidden xl:inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-[#A3B3A9]">
                Keep scrolling
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div ref={ref} className="mt-12 max-w-6xl mx-auto px-6 md:px-10 space-y-6">
          {items.map((cat, i) => (
            <Reveal key={cat.id} amount={0.15}>
              <AreaCard cat={cat} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
