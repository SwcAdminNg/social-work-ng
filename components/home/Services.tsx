"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { services } from "./content";

const COUNT = services.items.length;

/**
 * The three core service areas. On large screens a photograph stays pinned
 * on the left and changes as the reader scrolls through each service on the
 * right; on smaller screens each service carries its own photograph.
 */
export default function Services() {
  const [active, setActive] = useState(0);
  const blocks = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = blocks.current.indexOf(entry.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      // A block becomes current when it crosses the middle of the screen.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    blocks.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#0f1713] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          id="services-heading"
          eyebrow={services.eyebrow}
          title={services.title}
        >
          <p>{services.intro}</p>
        </SectionHeading>

        <div className="mt-16 md:mt-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-10 lg:gap-16 items-start">
          {/* Pinned photograph (large screens) */}
          <div className="hidden lg:block lg:sticky lg:top-28">
            <div className="relative h-[calc(100vh-9rem)] min-h-[520px] rounded-[32px] overflow-hidden bg-[#0c2a1e] shadow-[0_40px_80px_-40px_rgba(20,64,47,0.5)] dark:shadow-none">
              {services.items.map((item, i) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-300 motion-reduce:!scale-100 dark:brightness-90 ${
                    i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
                  }`}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04120b]/70 to-transparent" />
              <div className="absolute left-6 bottom-6 right-6 flex items-end justify-between gap-4 text-white">
                <p className="text-[1rem] font-bold leading-snug max-w-[22ch] [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
                  {services.items[active].title}
                </p>
                <p className="shrink-0 tabular-nums text-[0.85rem] font-semibold text-white/80">
                  {String(active + 1).padStart(2, "0")}
                  <span className="text-white/40"> / {String(COUNT).padStart(2, "0")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* The services */}
          <div>
            {services.items.map((item, i) => (
              <article
                key={item.id}
                id={item.id}
                ref={(el) => {
                  blocks.current[i] = el;
                }}
                aria-labelledby={`${item.id}-title`}
                className={`scroll-mt-28 lg:min-h-[82vh] lg:flex lg:flex-col lg:justify-center lg:py-10 ${
                  i > 0 ? "mt-20 lg:mt-0" : ""
                }`}
              >
                <Reveal className="lg:hidden mb-7">
                  <div className="aspect-[16/10] rounded-[24px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover dark:brightness-90"
                    />
                  </div>
                </Reveal>
                <Reveal>
                  <p className="flex items-center gap-3 text-[0.8rem] font-bold tabular-nums text-[#B7791F] dark:text-[#F3C56B]">
                    {String(i + 1).padStart(2, "0")}
                    <span className="h-px w-8 bg-current" aria-hidden="true" />
                  </p>
                  <h3
                    id={`${item.id}-title`}
                    className="t-h3 font-bold mt-4 text-gray-900 dark:text-gray-50"
                  >
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[1.15rem] md:text-[1.25rem] font-medium leading-snug text-[#2D6A4F] dark:text-[#52b788] max-w-[40ch]">
                    {item.tagline}
                  </p>
                  <div className="mt-6 space-y-4 t-body text-gray-600 dark:text-gray-400 max-w-[60ch]">
                    {item.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <Link
                    href={item.button.href}
                    className="group mt-8 inline-flex items-center gap-2 min-h-[50px] px-6 rounded-full border border-[#2D6A4F]/35 dark:border-[#52b788]/40 text-[0.95rem] font-bold text-[#14402F] dark:text-[#52b788] hover:bg-[#2D6A4F] hover:border-[#2D6A4F] hover:text-white dark:hover:bg-[#52b788] dark:hover:text-gray-950 active:scale-[0.97] transition-[background-color,color,border-color,scale] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/30"
                  >
                    {item.button.label}
                    <ArrowRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
