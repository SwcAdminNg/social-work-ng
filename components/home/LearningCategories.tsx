"use client";

import { useState } from "react";
import { Check, HeartHandshake, Laptop, Scale } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { Reveal, calmSpring } from "./motion";
import { learningCategories } from "./content";

const icons = [HeartHandshake, Laptop, Scale];
const items = learningCategories.items;

/**
 * "Explore Learning That Reflects Your Responsibilities". The three
 * learning areas as a tabbed panel: pick an area on the left (a scrolling
 * row on phones) and read its focus and eight learning themes on the right.
 */
export default function LearningCategories() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const cat = items[active];

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (active + 1) % items.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (active - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`area-tab-${items[next].id}`)?.focus();
  };

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

        <Reveal className="mt-14 md:mt-16">
          <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] gap-5 lg:gap-8 items-start">
            {/* Area list */}
            <div
              role="tablist"
              aria-label="Learning areas"
              aria-orientation="vertical"
              className="flex lg:flex-col gap-3 overflow-x-auto scrollbar-none -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory lg:snap-none"
            >
              {items.map((item, i) => {
                const Icon = icons[i];
                const selected = i === active;
                return (
                  <button
                    key={item.id}
                    id={`area-tab-${item.id}`}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    aria-controls="area-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={onKeyDown}
                    className={`snap-start shrink-0 w-[78vw] max-w-[320px] lg:w-full lg:max-w-none text-left rounded-[24px] p-5 lg:p-6 ring-1 cursor-pointer transition-[background-color,box-shadow,color] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/30 ${
                      selected
                        ? "bg-white dark:bg-gray-900 ring-black/5 dark:ring-white/10 shadow-[0_30px_60px_-30px_rgba(20,64,47,0.35)] dark:shadow-none"
                        : "bg-white/50 dark:bg-white/[0.04] ring-transparent hover:bg-white/80 dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={`flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-300 ${
                          selected
                            ? "bg-[#2D6A4F] text-white"
                            : "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-white/10 dark:text-[#52b788]"
                        }`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-[0.75rem] font-bold tabular-nums text-gray-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="block mt-5 text-[1.1rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-gray-50">
                      {item.title}
                    </span>
                    <span className="hidden lg:block mt-2 text-[0.9rem] leading-snug text-gray-600 dark:text-gray-400">
                      {item.tagline}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Area detail */}
            <div
              id="area-panel"
              role="tabpanel"
              aria-labelledby={`area-tab-${cat.id}`}
              className="rounded-[32px] bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-10 lg:p-12 min-h-[520px]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={cat.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: reduce ? 0 : -6,
                    transition: { duration: 0.16, ease: "easeIn" },
                  }}
                  transition={
                    reduce ? { duration: 0.2 } : { ...calmSpring, duration: 0.55 }
                  }
                >
                  <p className="t-h3 font-bold text-gray-900 dark:text-gray-50 max-w-[26ch]">
                    {cat.tagline}
                  </p>
                  <p className="mt-5 t-body text-gray-600 dark:text-gray-400 max-w-[62ch]">
                    {cat.text}
                  </p>
                  <p className="mt-9 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#2D6A4F] dark:text-[#52b788]">
                    {learningCategories.themesLabel}
                  </p>
                  <motion.ul
                    className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3"
                    initial="hidden"
                    animate="show"
                    transition={{ staggerChildren: reduce ? 0 : 0.04, delayChildren: 0.1 }}
                  >
                    {cat.themes.map((theme) => (
                      <motion.li
                        key={theme}
                        variants={{
                          hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 8 },
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
