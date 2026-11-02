"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { faqs } from "./content";

export default function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="scroll-mt-24 bg-white dark:bg-[#0a0a0a] py-20 md:py-24 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">
        <Reveal from="left" className="lg:sticky lg:top-28">
          <SectionHeading
            id="faqs-heading"
            eyebrow={faqs.eyebrow}
            title={faqs.title}
            align="left"
          />
          <p className="mt-4 text-[0.95rem] leading-relaxed text-gray-600 dark:text-gray-400">
            Can’t find what you’re looking for?{" "}
            <Link
              href="#contact"
              className="font-semibold text-[#2D6A4F] dark:text-[#52b788] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current"
            >
              Send us an enquiry
            </Link>
            .
          </p>
        </Reveal>

        <ul className="divide-y divide-gray-200 dark:divide-gray-800 border-y border-gray-200 dark:border-gray-800">
          {faqs.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `faq-btn-${i}`;
            const panelId = `faq-panel-${i}`;
            return (
              <li key={item.q}>
                <Reveal from="right" delay={Math.min(i, 5) * 0.04}>
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-6 py-5 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] rounded-md"
                    >
                      <span
                        className={`text-[1rem] font-semibold leading-snug transition-colors ${
                          isOpen
                            ? "text-[#2D6A4F] dark:text-[#52b788]"
                            : "text-gray-900 dark:text-gray-100 group-hover:text-[#2D6A4F] dark:group-hover:text-[#52b788]"
                        }`}
                      >
                        {item.q}
                      </span>
                      <span
                        className={`flex items-center justify-center w-8 h-8 shrink-0 rounded-full transition-all duration-300 ${
                          isOpen
                            ? "bg-[#2D6A4F] text-white rotate-45"
                            : "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#52b788]"
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
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                    inert={!isOpen ? true : undefined}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-6 pr-12 space-y-3 text-[0.93rem] leading-relaxed text-gray-600 dark:text-gray-400">
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
