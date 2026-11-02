"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Transition,
} from "motion/react";

// Critically damped (no overshoot) — the calm default for anything that
// isn't driven by a user's flick.
export const calmSpring: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.9,
};

// Smoothing for scroll-linked values: critically damped so it settles
// without wobble, just enough lag to read as physical.
export const scrollSpring = { stiffness: 220, damping: 32, mass: 0.6 };

const offsets = {
  up: { x: 0, y: 48 },
  down: { x: 0, y: -48 },
  left: { x: -72, y: 0 },
  right: { x: 72, y: 0 },
  none: { x: 0, y: 0 },
};

export type RevealFrom = keyof typeof offsets;

// Fades and slides content into place the first time it enters the viewport.
export function Reveal({
  children,
  from = "up",
  delay = 0,
  scale = 1,
  className,
}: {
  children: React.ReactNode;
  from?: RevealFrom;
  delay?: number;
  scale?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const offset = reduce ? offsets.none : offsets[from];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset, scale: reduce ? 1 : scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0.3 } : { ...calmSpring, delay }}
    >
      {children}
    </motion.div>
  );
}

// Thin brand-coloured bar showing how far down the page the reader is.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, scrollSpring);
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-[#2D6A4F] via-[#52b788] to-[#EBA937]"
    />
  );
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
