"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { scrollSpring } from "./motion";

const rows = [
  [
    "Training and Professional Development",
    "Research and Evaluation",
    "Policy and Advocacy",
    "Organisational Support",
  ],
  [
    "Human Dignity",
    "Social Justice",
    "Safeguarding",
    "Professional Accountability",
    "Meaningful Participation",
  ],
];

// One row drifts continuously; scrolling speeds it up and scrolling back
// up reverses it, so the band responds to the reader's own motion.
function MarqueeRow({
  items,
  baseVelocity,
  tone,
}: {
  items: string[];
  baseVelocity: number;
  tone: "solid" | "outline";
}) {
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { margin: "200px 0px" });
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, scrollSpring);
  const velocityFactor = useTransform(
    smoothVelocity,
    [-1000, 0, 1000],
    [-4, 0, 4],
    {
      clamp: false,
    },
  );
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    const move =
      direction.current *
      baseVelocity *
      (delta / 1000) *
      (1 + Math.abs(factor));
    baseX.set(baseX.get() + move);
  });

  // Content is duplicated so the -50% wrap point is seamless.
  const sequence = [...items, ...items];

  return (
    <div ref={rowRef} className="overflow-hidden whitespace-nowrap">
      <motion.div className="flex w-max" style={{ x }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {sequence.map((item, i) => (
              <span key={`${item}-${i}`} className="flex items-center">
                <span
                  className={`px-6 md:px-8 text-[2rem] md:text-[3.4rem] font-black tracking-[-0.03em] leading-none ${
                    tone === "solid"
                      ? "text-[#14402F] dark:text-[#d8f3dc]"
                      : "text-transparent [-webkit-text-stroke:1.5px_#2D6A4F] dark:[-webkit-text-stroke:1.5px_#52b788]"
                  }`}
                >
                  {item}
                </span>
                <span
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#EBA937] shrink-0"
                  aria-hidden="true"
                />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollMarquee() {
  return (
    <section
      aria-label="What we do and the values behind it"
      className="relative bg-white dark:bg-[#0a0a0a] py-14 md:py-20 overflow-hidden"
    >
      <div
        className="-rotate-2 scale-[1.04] space-y-4 md:space-y-6"
        aria-hidden="true"
      >
        <MarqueeRow items={rows[0]} baseVelocity={-2.5} tone="solid" />
        <MarqueeRow items={rows[1]} baseVelocity={2.5} tone="outline" />
      </div>
      {/* Screen readers get the list once, without the motion */}
      <p className="sr-only">
        {rows[0].join(", ")}. Our values: {rows[1].join(", ")}.
      </p>
    </section>
  );
}
