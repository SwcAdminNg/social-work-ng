"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * Shared pieces for sections that stay pinned while the reader scrolls
 * through a set of steps (the hero banners, the introduction chunks).
 */

// Cross-fade classes: opacity and translate/scale only, run by CSS so the
// browser animates them on the compositor — smooth even mid-scroll.
export const crossFade =
  "transition-[opacity,translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,translate] motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:!translate-none motion-reduce:!scale-100";

// Tracks which step is showing for a pinned section and lets controls jump
// to a step by scrolling the page there.
export function useStepScroll<T extends HTMLElement>(count: number) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(v * count)));
    if (next === activeRef.current) return;
    activeRef.current = next;
    setActive(next);
  });

  const goTo = (index: number) => {
    const section = ref.current;
    if (!section) return;
    const range = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + range * (index / count) + (index ? 4 : 0),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return { ref, progress: scrollYProgress, active, goTo, reduce };
}

// How far through step `index` the reader is, 0 → 1.
export function useSegment(
  progress: MotionValue<number>,
  index: number,
  count: number,
) {
  return useTransform(progress, [index / count, (index + 1) / count], [0, 1]);
}

// Colour sets for each surface: light = on dark photos, dark = on white,
// split = on a photo on phones and on white from the lg breakpoint up.
export type StepTone = "light" | "dark" | "split";

const tones = {
  light: {
    track: "bg-white/25",
    fill: "bg-[#EBA937]",
    text: "text-white",
    muted: "text-white/70",
    ringTrack: "stroke-white/25",
    ring: "stroke-[#EBA937]",
    label: "text-white",
    labelMuted: "text-white/60",
  },
  dark: {
    track: "bg-[#2D6A4F]/15 dark:bg-white/15",
    fill: "bg-[#2D6A4F] dark:bg-[#52b788]",
    text: "text-gray-900 dark:text-white",
    muted: "text-gray-500 dark:text-gray-400",
    ringTrack: "stroke-gray-900/10 dark:stroke-white/15",
    ring: "stroke-[#2D6A4F] dark:stroke-[#52b788]",
    label: "text-gray-900 dark:text-white",
    labelMuted: "text-gray-500 dark:text-gray-400",
  },
  split: {
    track: "bg-white/25 lg:bg-[#2D6A4F]/15 dark:lg:bg-white/15",
    fill: "bg-[#EBA937] lg:bg-[#2D6A4F] dark:lg:bg-[#52b788]",
    text: "text-white lg:text-gray-900 dark:lg:text-white",
    muted: "text-white/70 lg:text-gray-500 dark:lg:text-gray-400",
    ringTrack: "stroke-white/25 lg:stroke-gray-900/10 dark:lg:stroke-white/15",
    ring: "stroke-[#EBA937] lg:stroke-[#2D6A4F] dark:lg:stroke-[#52b788]",
    label: "text-white lg:text-gray-900 dark:lg:text-white",
    labelMuted: "text-white/60 lg:text-gray-500 dark:lg:text-gray-400",
  },
} satisfies Record<StepTone, Record<string, string>>;

// Story-style bar that fills continuously while scrolling, so every bit of
// scroll shows visible progress. Doubles as a button to jump to the step.
// Bars share the row equally (basis-0) and labels keep one weight, so
// nothing reflows when the step changes.
export function StepBar({
  progress,
  index,
  count,
  label,
  current,
  onSelect,
  tone = "light",
  showLabel = false,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  label: string;
  current: boolean;
  onSelect: () => void;
  tone?: StepTone;
  showLabel?: boolean;
}) {
  const scaleX = useSegment(progress, index, count);
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Show ${label}`}
      aria-current={current ? "true" : undefined}
      className="group flex-1 basis-0 min-w-0 flex flex-col justify-start gap-2 pt-3 min-h-11 text-left cursor-pointer"
    >
      <span
        className={`relative block w-full h-1.5 rounded-full overflow-hidden ${t.track}`}
      >
        <motion.span
          style={{ scaleX }}
          className={`absolute inset-0 origin-left rounded-full ${t.fill}`}
        />
      </span>
      {showLabel && (
        <span
          className={`hidden lg:block min-h-[2.6em] text-[0.85rem] font-bold leading-snug transition-colors duration-300 ${
            current ? t.label : `${t.labelMuted} group-hover:opacity-100`
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}

// A ring that fills as the reader scrolls towards the next step, with a
// label saying what comes next, so it is clear that scrolling is working.
// Give it a fixed width from the parent so changing labels never resize
// the progress bars beside it.
export function NextCue({
  progress,
  count,
  next,
  tone = "light",
  wrap = false,
}: {
  progress: MotionValue<number>;
  count: number;
  next: string;
  tone?: StepTone;
  // Let a long "Next: …" label break onto two lines on narrow screens.
  wrap?: boolean;
}) {
  const ring = useTransform(progress, (v) => {
    const x = Math.min(Math.max(v, 0) * count, count - 0.0001);
    return x - Math.floor(x);
  });
  const t = tones[tone];

  return (
    <div className={`flex items-center gap-2.5 ${t.text}`} aria-hidden="true">
      <span className="relative flex items-center justify-center w-10 h-10 shrink-0">
        <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            strokeWidth="3"
            className={t.ringTrack}
          />
          <motion.circle
            cx="20"
            cy="20"
            r="17"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={t.ring}
            style={{ pathLength: ring }}
          />
        </svg>
        <ChevronDown className="hero-nudge w-5 h-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className={`block text-[0.78rem] font-medium ${t.muted}`}>
          Keep scrolling
        </span>
        <span
          className={`block text-[0.95rem] font-bold ${
            wrap ? "lg:whitespace-nowrap" : "whitespace-nowrap"
          }`}
        >
          {next}
        </span>
      </span>
    </div>
  );
}
