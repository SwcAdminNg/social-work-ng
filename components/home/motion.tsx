"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Transition,
} from "motion/react";

// Critically damped (no overshoot) — the calm default for anything that
// isn't driven by a user's flick.
export const calmSpring: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.9,
};

// Short distances: content should settle into place, not travel.
const offsets = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
  none: { x: 0, y: 0 },
};

export type RevealFrom = keyof typeof offsets;

// Fades and settles content into place the first time it enters the viewport.
export function Reveal({
  children,
  from = "up",
  delay = 0,
  amount = 0.25,
  className,
}: {
  children: React.ReactNode;
  from?: RevealFrom;
  delay?: number;
  amount?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const offset = reduce ? offsets.none : offsets[from];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={reduce ? { duration: 0.3 } : { ...calmSpring, delay }}
    >
      {children}
    </motion.div>
  );
}

// Reveals a heading one word at a time, each rising out of its own line
// mask, so large type arrives with a sense of weight instead of popping in.
export function WordReveal({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: reduce ? 0 : 0.04, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom pt-[0.1em] -mt-[0.1em] pb-[0.18em] -mb-[0.18em]">
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hidden: reduce ? { opacity: 0 } : { y: "125%" },
                show: reduce ? { opacity: 1 } : { y: 0 },
              }}
              transition={reduce ? { duration: 0.4 } : calmSpring}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}

// A photograph that drifts gently against the scroll inside its frame.
// The image is oversized so the drift never shows an edge.
export function ParallaxImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  strength = 8,
  loading = "lazy",
  position,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  // Drift in percent of the frame height.
  strength?: number;
  loading?: "lazy" | "eager";
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : [`-${strength}%`, `${strength}%`],
  );
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        style={{ y, objectPosition: position }}
        className={`absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover will-change-transform ${imgClassName}`}
      />
    </div>
  );
}

// Small uppercase label that opens a section.
export function Eyebrow({
  children,
  tone = "green",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "green" | "gold" | "muted";
  className?: string;
}) {
  const tones = {
    green: "text-[#2D6A4F] dark:text-[#74c69d]",
    gold: "text-[#F3C56B]",
    muted: "text-gray-500 dark:text-[#A3B3A9]",
  };
  return (
    <p
      className={`flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.22em] ${tones[tone]} ${className}`}
    >
      <span className="h-px w-8 bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * Measures a pinned horizontal row of cards so vertical scrolling can slide
 * it sideways and pause on each card. `stops` are the track offsets that
 * bring each card to the front; `distance` is the full travel; `extra` is
 * the additional scroll length that gives every card its reading time
 * (`dwell` screens per card).
 */
export function useCardTrack(
  enabled: boolean,
  trackRef: React.RefObject<HTMLDivElement | null>,
  count: number,
  dwell = 0.6,
) {
  const [track, setTrack] = useState({
    distance: 0,
    extra: 0,
    stops: [] as number[],
  });

  useLayoutEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      const viewport = document.documentElement.clientWidth;
      const distance = Math.max(0, el.scrollWidth - viewport);
      const cards = Array.from(el.children) as HTMLElement[];
      const first = cards[0]?.offsetLeft ?? 0;
      const stops = cards.map((c) => -Math.min(distance, c.offsetLeft - first));
      setTrack({
        distance,
        extra: Math.round(window.innerHeight * dwell * count),
        stops,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled, trackRef, count, dwell]);

  return track;
}

// Keyframes for a card track: the row holds on each card, then slides to
// the next, holds again, and so on — equal time for every card.
export function trackKeyframes(stops: number[]) {
  const n = stops.length;
  if (n === 0) return { input: [0, 1], output: [0, 0] };
  const segments = 2 * n - 1;
  const input: number[] = [];
  const output: number[] = [];
  stops.forEach((x, k) => {
    input.push((2 * k) / segments, (2 * k + 1) / segments);
    output.push(x, x);
  });
  return { input, output };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}
