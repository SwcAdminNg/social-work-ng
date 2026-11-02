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

// Cross-fade shared by the service copy and photographs: opacity and a
// short travel, run by CSS so the browser composites it.
const fade =
  "transition-[opacity,translate,scale] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-opacity motion-reduce:duration-300 motion-reduce:!translate-none motion-reduce:!scale-100";

// One step of the vertical rail: its bar fills top to bottom as the service
// is scrolled through.
function RailStep({
  progress,
  index,
  item,
  current,
}: {
  progress: MotionValue<number>;
  index: number;
  item: ServiceCard;
  current: boolean;
}) {
  const scaleY = useTransform(
    progress,
    [index / COUNT, (index + 1) / COUNT],
    [0, 1],
  );
  return (
    <li className="flex items-stretch justify-end gap-4">
      <span className="py-1 text-right">
        <span
          className={`block text-[0.72rem] font-bold tabular-nums transition-colors duration-500 ${
            current ? "text-[#F3C56B]" : "text-white/40"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`block mt-0.5 max-w-[14ch] text-[0.85rem] font-bold leading-snug transition-colors duration-500 ${
            current ? "text-white" : "text-white/45"
          }`}
        >
          {item.title}
        </span>
      </span>
      <span className="relative w-[2px] min-h-[4.5rem] rounded-full bg-white/20 overflow-hidden">
        <motion.span
          style={{ scaleY }}
          className="absolute inset-0 origin-top rounded-full bg-[#EBA937]"
        />
      </span>
    </li>
  );
}

// The words for one service.
function Copy({ item, index }: { item: ServiceCard; index: number }) {
  return (
    <>
      <p className="flex items-center gap-3 text-[0.8rem] font-bold tabular-nums text-[#F3C56B]">
        {String(index + 1).padStart(2, "0")}
        <span className="h-px w-8 bg-current" aria-hidden="true" />
      </p>
      <h3 id={`${item.id}-title`} className="t-h3 font-bold mt-4 text-white">
        {item.title}
      </h3>
      <p className="mt-3 text-[1.02rem] md:text-[1.06rem] font-medium leading-snug text-[#F3C56B] max-w-[40ch]">
        {item.tagline}
      </p>
      <div className="mt-4 space-y-2.5 text-[0.93rem] leading-[1.6] text-white/85 max-w-[58ch]">
        {item.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Link
        href={item.button.href}
        className="group mt-5 inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full bg-white text-[#14402F] text-[0.95rem] font-bold shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:bg-[#EBA937] hover:text-[#10291E] active:scale-[0.97] transition-[background-color,color,scale] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
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
 * The three core service areas, one dark chapter. The heading opens it;
 * then, on laptops, the stage beneath stays pinned while scrolling moves
 * from one service to the next — each photograph fills the screen and
 * cross-fades into the next while the words change in a glass panel at the
 * foot, with a vertical rail on the right marking progress. Phones stack
 * the services, each with its photograph above its words.
 */
export default function Services() {
  // Pin only where a whole service fits on one screen.
  const pinned = useMediaQuery("(min-width: 1024px) and (min-height: 700px)");
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
      className="relative bg-[#04120b] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 md:pt-32 scroll-mt-20"
    >
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 pb-12 md:pb-10">
        <SectionHeading
          id="services-heading"
          eyebrow={services.eyebrow}
          title={services.title}
          tone="dark"
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

          <div className="sticky top-0 h-[100vh] overflow-hidden bg-[#04120b]">
            {/* Photographs, filling the screen */}
            {services.items.map((item, i) => (
              <div
                key={item.id}
                aria-hidden="true"
                className={`absolute inset-0 ${fade} ${
                  i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.05]"
                }`}
              >
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: item.focus }}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {/* Light wash only: deeper at the foot, a lift under the header */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#04120b]/80 via-[#04120b]/20 via-45% to-[#04120b]/5" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04120b]/70 to-transparent" />

            <div className="relative h-full max-w-6xl mx-auto px-6 md:px-10 pt-[calc(84px+1rem)] pb-[4.5rem] flex items-end justify-between gap-10">
              {/* Words, in a glass panel */}
              <div className="grid w-full max-w-[600px]">
                {services.items.map((item, i) => {
                  const isActive = i === active;
                  return (
                    <article
                      key={item.id}
                      aria-labelledby={`${item.id}-title`}
                      aria-hidden={!isActive}
                      inert={!isActive ? true : undefined}
                      className={`[grid-area:1/1] self-end rounded-[28px] bg-[#04120b]/55 backdrop-blur-xl ring-1 ring-white/10 p-7 lg:p-8 ${fade} ${offset(i)} ${
                        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <Copy item={item} index={i} />
                    </article>
                  );
                })}
              </div>

              {/* Vertical progress rail */}
              <div className="shrink-0 self-end pb-2" aria-hidden="true">
                <p className="mb-4 text-right tabular-nums text-[0.85rem] font-semibold text-white/80">
                  {String(active + 1).padStart(2, "0")}
                  <span className="text-white/40"> / {String(COUNT).padStart(2, "0")}</span>
                </p>
                <ol className="space-y-4">
                  {services.items.map((item, i) => (
                    <RailStep
                      key={item.id}
                      progress={scrollYProgress}
                      index={i}
                      item={item}
                      current={i === active}
                    />
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div ref={ref} className="relative max-w-6xl mx-auto px-6 md:px-10 space-y-16 md:space-y-20 pb-28 md:pb-32">
          {services.items.map((item, i) => (
            <article
              key={item.id}
              id={item.id}
              aria-labelledby={`${item.id}-title`}
              className="scroll-mt-28"
            >
              <Reveal amount={0.15}>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[24px] bg-[#0c2a1e] ring-1 ring-white/10 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)]">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </Reveal>
              <Reveal amount={0.2} className="mt-7">
                <Copy item={item} index={i} />
              </Reveal>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
