"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { faqs } from "./content";

/**
 * "Understanding SWCL and How We Can Support You". A numbered accordion;
 * one answer open at a time, the first by default.
 */
export default function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="relative bg-white dark:bg-[#0a0a0a] pt-20 pb-24 md:pt-28 md:pb-36 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-10 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            id="faqs-heading"
            eyebrow={faqs.eyebrow}
            title={faqs.title}
          />
          <Reveal delay={0.25}>
            <p className="mt-6 t-body text-gray-600 dark:text-gray-400">
              Can’t find what you’re looking for?{" "}
              <Link
                href="#contact"
                className="font-semibold text-[#2D6A4F] dark:text-[#52b788] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
              >
                Send us an enquiry
              </Link>
              .
            </p>
          </Reveal>
        </div>

        <ul className="border-t border-gray-200 dark:border-white/10">
          {faqs.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `faq-btn-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <li
                key={item.q}
                className="border-b border-gray-200 dark:border-white/10"
              >
                <Reveal delay={Math.min(i, 6) * 0.03} amount={0.1}>
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group w-full grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 py-6 text-left cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                    >
                      <span
                        className={`pt-1 text-[0.8rem] font-bold tabular-nums transition-colors ${
                          isOpen
                            ? "text-[#B7791F] dark:text-[#F3C56B]"
                            : "text-gray-400"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[1.05rem] md:text-[1.2rem] font-semibold leading-snug tracking-[-0.01em] transition-colors ${
                          isOpen
                            ? "text-[#14402F] dark:text-[#74c69d]"
                            : "text-gray-900 dark:text-gray-100 group-hover:text-[#2D6A4F] dark:group-hover:text-[#52b788]"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span
                        className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-full transition-[background-color,color,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen
                            ? "bg-[#2D6A4F] text-white rotate-45"
                            : "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-white/10 dark:text-[#52b788] group-hover:bg-[#2D6A4F]/20"
                        }`}
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={btnId}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-150 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                    inert={!isOpen ? true : undefined}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-[3.5rem] pr-14 pb-7 space-y-3 t-body text-gray-600 dark:text-gray-400 max-w-[62ch]">
                        {item.a.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
