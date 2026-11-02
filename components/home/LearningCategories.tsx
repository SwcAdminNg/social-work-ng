"use client";

import { useEffect, useRef, useState } from "react";
import { Check, HeartHandshake, Laptop, Scale } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { Reveal, calmSpring } from "./motion";
import { learningCategories } from "./content";

const icons = [HeartHandshake, Laptop, Scale];
const items = learningCategories.items;

/**
 * "Explore Learning That Reflects Your Responsibilities". The three
 * learning areas open one after another as the reader scrolls: each
 * panel settles into place and its eight themes cascade in. On large
 * screens a pinned list on the left shows which area is in view.
 */
export default function LearningCategories() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = panels.current.indexOf(entry.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    panels.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="learning-areas"
      aria-labelledby="categories-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#0f1713] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
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

        <div className="mt-14 md:mt-16 grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.5fr)] gap-8 lg:gap-12 items-start">
          {/* Pinned list of the areas (large screens) */}
          <ol
            aria-label="Learning areas"
            className="hidden lg:block lg:sticky lg:top-28 space-y-2"
          >
            {items.map((item, i) => {
              const Icon = icons[i];
              const current = i === active;
              return (
                <li key={item.id}>
                  <a
                    href={`#area-${item.id}`}
                    aria-current={current ? "true" : undefined}
                    className={`group flex items-start gap-4 rounded-[22px] p-5 ring-1 transition-[background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/30 ${
                      current
                        ? "bg-white dark:bg-gray-900 ring-black/5 dark:ring-white/10 shadow-[0_30px_60px_-30px_rgba(20,64,47,0.35)] dark:shadow-none"
                        : "ring-transparent hover:bg-white/60 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full transition-colors duration-500 ${
                        current
                          ? "bg-[#2D6A4F] text-white"
                          : "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-white/10 dark:text-[#52b788]"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.72rem] font-bold tabular-nums text-gray-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`block mt-1 text-[1rem] font-bold leading-snug transition-colors duration-500 ${
                          current
                            ? "text-gray-900 dark:text-gray-50"
                            : "text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                        }`}
                      >
                        {item.title}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>

          {/* The areas, one after another */}
          <div className="space-y-6 lg:space-y-8">
            {items.map((cat, i) => {
              const Icon = icons[i];
              return (
                <article
                  key={cat.id}
                  id={`area-${cat.id}`}
                  ref={(el) => {
                    panels.current[i] = el;
                  }}
                  aria-labelledby={`area-${cat.id}-title`}
                  className="scroll-mt-28"
                >
                  <Reveal amount={0.2}>
                    <div className="rounded-[32px] bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-10 lg:p-12">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#2D6A4F] text-white">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <span className="text-[0.75rem] font-bold tabular-nums text-gray-400">
                          {String(i + 1).padStart(2, "0")} /{" "}
                          {String(items.length).padStart(2, "0")}
                        </span>
                      </div>
                      <h3
                        id={`area-${cat.id}-title`}
                        className="mt-6 text-[0.78rem] font-bold uppercase tracking-[0.2em] text-[#2D6A4F] dark:text-[#52b788]"
                      >
                        {cat.title}
                      </h3>
                      <p className="mt-3 t-h3 font-bold text-gray-900 dark:text-gray-50 max-w-[28ch]">
                        {cat.tagline}
                      </p>
                      <p className="mt-5 t-body text-gray-600 dark:text-gray-400 max-w-[62ch]">
                        {cat.text}
                      </p>
                      <p className="mt-9 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                        {learningCategories.themesLabel}
                      </p>
                      <motion.ul
                        className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3"
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          staggerChildren: reduce ? 0 : 0.05,
                          delayChildren: 0.1,
                        }}
                      >
                        {cat.themes.map((theme) => (
                          <motion.li
                            key={theme}
                            variants={{
                              hidden: reduce
                                ? { opacity: 0 }
                                : { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 },
                            }}
                            transition={calmSpring}
                            className="flex gap-3 text-[0.95rem] leading-snug text-gray-700 dark:text-gray-300 py-2 border-b border-gray-100 dark:border-white/10"
                          >
                            <Check
                              className="w-4 h-4 mt-0.5 shrink-0 text-[#2D6A4F] dark:text-[#52b788]"
                              aria-hidden="true"
                            />
                            {theme}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </Reveal>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
