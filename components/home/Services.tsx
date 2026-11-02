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
import ExpandableCopy from "./ExpandableCopy";
import SectionHeading from "./SectionHeading";
import { Reveal, scrollSpring, useMediaQuery } from "./motion";
import { services, type ServiceCard } from "./content";

function Card({ item, index }: { item: ServiceCard; index: number }) {
  return (
    <article
      id={item.id}
      aria-labelledby={`${item.id}-title`}
      className="scroll-mt-28 group grid grid-cols-1 lg:grid-cols-[0.95fr_1fr] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-black/5 dark:border-gray-800 shadow-[0_30px_60px_-30px_rgba(20,64,47,0.35)] dark:shadow-none lg:w-[min(64vw,860px)] lg:min-h-[min(60vh,540px)] lg:shrink-0"
    >
      <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
        <img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 dark:brightness-90"
        />
        <span className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md text-[0.75rem] font-bold tracking-wide text-[#14402F] dark:text-white">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(services.items.length).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col p-7 md:p-9">
        <h3
          id={`${item.id}-title`}
          className="text-[1.5rem] md:text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] text-gray-900 dark:text-gray-50"
        >
          {item.title}
        </h3>
        <p className="mt-3 text-[0.98rem] font-medium text-[#2D6A4F] dark:text-[#52b788] leading-snug">
          {item.tagline}
        </p>
        <ExpandableCopy
          paragraphs={item.paragraphs}
          className="mt-4 text-[0.93rem] leading-relaxed text-gray-600 dark:text-gray-400"
        />
        <Link
          href={item.button.href}
          className="group/link mt-auto pt-7 inline-flex items-center gap-2 self-start text-[0.95rem] font-bold text-[#2D6A4F] dark:text-[#52b788] hover:text-[#1e4d38] dark:hover:text-[#74c69d] rounded focus-visible:outline-none focus-visible:underline"
        >
          {item.button.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

// On large screens the section pins and vertical scrolling slides the
// cards sideways; everywhere else it is a normal stacked list.
export default function Services() {
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px) and (min-height: 680px)");
  const horizontal = wide && !reduce;

  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (!horizontal) return;
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      setDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
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
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, scrollSpring);
  const x = useTransform(progress, [0, 1], [0, -distance]);
  const barScale = useTransform(progress, [0, 1], [0.08, 1]);

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className="relative scroll-mt-24 bg-[#EEF5F1] dark:bg-[#0f1713]"
      style={horizontal ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div
        ref={viewportRef}
        className={
          horizontal
            ? "sticky top-[84px] h-[calc(100vh-84px)] overflow-hidden flex flex-col justify-center"
            : "py-20 md:py-24 px-6"
        }
      >
        <motion.div
          ref={trackRef}
          style={horizontal ? { x } : undefined}
          className={
            horizontal
              ? "flex items-stretch gap-8 w-max pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] pr-[8vw] will-change-transform"
              : "max-w-6xl mx-auto flex flex-col gap-8"
          }
        >
          <div className={horizontal ? "w-[380px] shrink-0 self-center" : ""}>
            <Reveal from={horizontal ? "left" : "up"}>
              <SectionHeading
                id="services-heading"
                eyebrow={services.eyebrow}
                title={services.title}
                align="left"
              >
                <p>{services.intro}</p>
              </SectionHeading>
              {horizontal && (
                <p className="mt-8 inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  Keep scrolling
                  <ArrowRight
                    className="w-4 h-4 animate-pulse"
                    aria-hidden="true"
                  />
                </p>
              )}
            </Reveal>
          </div>

          {services.items.map((item, i) =>
            horizontal ? (
              <Card key={item.id} item={item} index={i} />
            ) : (
              <Reveal key={item.id} from="up" delay={0.05 * i}>
                <Card item={item} index={i} />
              </Reveal>
            ),
          )}
        </motion.div>

        {horizontal && (
          <div className="max-w-6xl w-full mx-auto px-6 mt-10">
            <div className="h-1 rounded-full bg-[#2D6A4F]/15 overflow-hidden">
              <motion.div
                style={{ scaleX: barScale }}
                className="h-full origin-left rounded-full bg-[#2D6A4F] dark:bg-[#52b788]"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
