"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { calmSpring } from "@/components/home/motion";

/**
 * A page's opening photograph set into the page whole, at its own
 * proportions, so no face or gesture is ever cropped away. It arrives
 * with a soft rise and then creeps very slightly closer as it travels up
 * the screen: a few percent, so the edges never lose anyone in the scene.
 */
export default function OpeningPhoto({
  src,
  alt,
  width,
  height,
  note,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  // A short chip shown on the picture, e.g. "Illustrative image".
  note?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1.02, 1.08],
  );

  return (
    <motion.figure
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0.4 } : { ...calmSpring, delay: 0.2 }}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={`relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-[#14402F] shadow-[0_50px_100px_-50px_rgba(20,64,47,0.5)] dark:shadow-none ${className}`}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        style={{ scale }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      {note && (
        <figcaption className="absolute left-4 bottom-4 md:left-6 md:bottom-6 inline-flex items-center rounded-full bg-black/35 backdrop-blur-md px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/85">
          {note}
        </figcaption>
      )}
    </motion.figure>
  );
}
