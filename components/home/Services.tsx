"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import SectionHeading from "./SectionHeading";
import { Reveal, useMediaQuery } from "./motion";
import { services, type ServiceCard } from "./content";

const COUNT = services.items.length;

// Cross-fade shared by the service copy: opacity and a short vertical
// travel, run by CSS so the browser composites it.
const fade =
  "transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:!translate-none";

// One segment of the progress rail; fills as its service is scrolled through.
function Segment({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const scaleX = useTransform(
    progress,
    [index / COUNT, (index + 1) / COUNT],
    [0, 1],
  );
  return (
    <span className="block h-[2px] w-full rounded-full bg-white/20 overflow-hidden">
      <motion.span
        style={{ scaleX }}
        className="block h-full w-full origin-left rounded-full bg-[#EBA937]"
      />
    </span>
  );
}

// The words for one service, set on a dark photograph.
function Copy({ item, index }: { item: ServiceCard; index: number }) {
  return (
    <>
      <p className="flex items-center gap-3 text-[0.8rem] font-bold tabular-nums text-[#F3C56B]">
        {String(index + 1).padStart(2, "0")}
        <span className="h-px w-8 bg-current" aria-hidden="true" />
      </p>
      <h3
        id={`${item.id}-title`}
        className="t-h2 font-bold mt-4 text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
      >
        {item.title}
      </h3>
      <p className="mt-4 text-[1.1rem] md:text-[1.2rem] font-medium leading-snug text-[#F3C56B] max-w-[40ch]">
        {item.tagline}
      </p>
      <div className="mt-5 space-y-3 text-[0.98rem] md:text-[1.02rem] leading-relaxed text-white/85 max-w-[58ch]">
        {item.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Link
        href={item.button.href}
        className="group mt-7 inline-flex items-center gap-2 min-h-[52px] px-7 rounded-full bg-white text-[#14402F] text-[0.95rem] font-bold shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:bg-[#EBA937] hover:text-[#10291E] active:scale-[0.97] transition-[background-color,color,scale] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
      >
        {item.button.label}
        <ArrowRight
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </>
  );
}

/**
 * The three core service areas as full-screen photographs. On laptops the
 * stage stays pinned while scrolling moves from one service to the next:
 * the photograph and the words cross-fade together, and a rail at the foot
 * shows how far through the three you are. Phones get the same posters
 * stacked, each scrolling past in turn.
 */
export default function Services() {
  const pinned = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const offset = (i: number) =>
    i === active ? "translate-y-0" : i < active ? "-translate-y-5" : "translate-y-5";

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#0f1713] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 md:pt-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-14 md:pb-20">
        <SectionHeading
          id="services-heading"
          eyebrow={services.eyebrow}
          title={services.title}
        >
          <p>{services.intro}</p>
        </SectionHeading>
      </div>

      {pinned ? (
        <div
          ref={ref}
          className="relative"
          style={{ height: `${(COUNT + 1) * 100}vh` }}
        >
          {/* Anchors for the service links: each lands on its own service */}
          {services.items.map((item, i) => (
            <div
              key={item.id}
              id={item.id}
              aria-hidden="true"
              className="absolute inset-x-0 h-px pointer-events-none"
              style={{ top: `calc(${i * 100}vh + 8px)` }}
            />
          ))}

          <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#04120b] text-white">
            {/* Photographs */}
            {services.items.map((item, i) => (
              <div
                key={item.id}
                aria-hidden="true"
                className={`absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 motion-reduce:!scale-100 ${
                  i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]"
                }`}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#04120b]/90 via-[#04120b]/55 via-45% to-[#04120b]/15" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#04120b]/85 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04120b]/60 to-transparent" />

            <div className="relative h-full max-w-6xl mx-auto px-6 md:px-10 flex flex-col justify-end pt-[calc(84px+2rem)] pb-9">
              <div className="grid">
                {services.items.map((item, i) => {
                  const isActive = i === active;
                  return (
                    <article
                      key={item.id}
                      aria-labelledby={`${item.id}-title`}
                      aria-hidden={!isActive}
                      inert={!isActive ? true : undefined}
                      className={`[grid-area:1/1] self-end max-w-[620px] ${fade} ${offset(i)} ${
                        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <Copy item={item} index={i} />
                    </article>
                  );
                })}
              </div>

              {/* Progress rail */}
              <div className="mt-10 flex items-end justify-between gap-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Our services
                </p>
                <p className="tabular-nums text-[0.85rem] font-semibold text-white/80">
                  {String(active + 1).padStart(2, "0")}
                  <span className="text-white/40"> / {String(COUNT).padStart(2, "0")}</span>
                </p>
              </div>
              <ol className="mt-3 grid grid-cols-3 gap-5" aria-hidden="true">
                {services.items.map((item, i) => (
                  <li key={item.id}>
                    <Segment progress={scrollYProgress} index={i} />
                    <p
                      className={`mt-3 text-[0.85rem] font-bold leading-tight transition-colors duration-500 ${
                        i === active ? "text-white" : "text-white/50"
                      }`}
                    >
                      {item.title}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <div ref={ref} className="space-y-3">
          {services.items.map((item, i) => (
            <article
              key={item.id}
              id={item.id}
              aria-labelledby={`${item.id}-title`}
              className="relative min-h-[92svh] overflow-hidden bg-[#04120b] text-white flex flex-col justify-end scroll-mt-20"
            >
              <img
                src={item.image}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04120b] via-[#04120b]/75 via-45% to-[#04120b]/10" />
              <div className="relative px-6 md:px-10 pt-[46svh] pb-12">
                <Reveal amount={0.2}>
                  <Copy item={item} index={i} />
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
