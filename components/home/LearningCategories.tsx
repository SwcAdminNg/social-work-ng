"use client";

import { useRef } from "react";
import { Check, HeartHandshake, Network, Scale } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { learningCategories } from "./content";

const categoryIcons = [HeartHandshake, Network, Scale];
const accents = ["#2D6A4F", "#557F8F", "#B7791F"];

type Category = (typeof learningCategories.items)[number];

// Each card pins under the one before it; as the next slides over, the
// earlier cards ease back so the stack reads as physical layers.
function StackCard({
  cat,
  index,
  total,
  progress,
}: {
  cat: Category;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const Icon = categoryIcons[index];
  const targetScale = 1 - (total - 1 - index) * 0.05;
  const scale = useTransform(
    progress,
    [index / total, 1],
    [1, reduce ? 1 : targetScale],
  );

  return (
    <div
      className={`lg:sticky lg:flex lg:items-start ${
        index < total - 1 ? "lg:h-[calc(100vh-120px)]" : "lg:pb-8"
      }`}
      style={{ top: `${112 + index * 28}px` }}
    >
      <motion.article
        style={{ scale, transformOrigin: "top center" }}
        aria-labelledby={`category-${cat.id}-title`}
        className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 bg-white dark:bg-gray-900 rounded-3xl p-7 md:p-10 border border-black/5 dark:border-gray-800 shadow-[0_-20px_60px_-30px_rgba(20,64,47,0.35)] dark:shadow-none"
      >
        <div>
          <div className="flex items-center gap-4">
            <span
              className="flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl text-white"
              style={{ backgroundColor: accents[index] }}
            >
              <Icon className="w-7 h-7" aria-hidden="true" />
            </span>
            <span className="text-[0.8rem] font-bold tracking-[0.16em] text-gray-400">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <h3
            id={`category-${cat.id}-title`}
            className="mt-6 text-[1.6rem] md:text-[2rem] font-bold leading-[1.1] tracking-[-0.025em] text-gray-900 dark:text-gray-50"
          >
            {cat.title}
          </h3>
          <p className="mt-3 text-[1rem] font-medium text-[#2D6A4F] dark:text-[#52b788] leading-snug">
            {cat.tagline}
          </p>
          <p className="mt-4 text-[0.93rem] leading-relaxed text-gray-600 dark:text-gray-400">
            {cat.text}
          </p>
        </div>
        <div className="lg:border-l lg:border-gray-100 lg:dark:border-gray-800 lg:pl-12">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Learning themes include
          </p>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {cat.themes.map((t) => (
              <li
                key={t}
                className="flex gap-2.5 text-[0.9rem] leading-snug text-gray-700 dark:text-gray-300"
              >
                <Check
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: accents[index] }}
                  aria-hidden="true"
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </div>
  );
}

export default function LearningCategories() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });
  const items = learningCategories.items;

  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-[#EEF5F1] dark:bg-[#0f1713] pt-20 md:pt-28 pb-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <Reveal from="up">
          <SectionHeading
            id="categories-heading"
            eyebrow={learningCategories.eyebrow}
            title={learningCategories.title}
          >
            {learningCategories.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>
        </Reveal>

        <div ref={stackRef} className="mt-14 flex flex-col gap-6 lg:gap-0">
          {items.map((cat, i) => (
            <StackCard
              key={cat.id}
              cat={cat}
              index={i}
              total={items.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
