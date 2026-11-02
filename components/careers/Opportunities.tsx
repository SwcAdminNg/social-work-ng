"use client";

import { ArrowDown, Briefcase, GraduationCap, HandHeart } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { opportunities } from "./content";
import { announceInterest } from "./interestEvent";

const icons = [HandHeart, GraduationCap, Briefcase];

/**
 * The three opportunity cards (volunteering, internships, consultancy)
 * on the deep-green chapter. Each button scrolls to the same form and
 * preselects the matching opportunity type; the visitor can change it.
 */
export default function Opportunities() {
  return (
    <section
      id="opportunities"
      aria-labelledby="opportunities-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      <div
        className="absolute -top-40 right-[-12%] w-[38rem] h-[38rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#2D6A4F]/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          id="opportunities-heading"
          eyebrow={opportunities.eyebrow}
          title={opportunities.title}
          tone="dark"
          align="center"
        />

        <ul className="mt-14 md:mt-16 grid md:grid-cols-3 gap-4 md:gap-5">
          {opportunities.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <li key={item.id} id={item.id} className="flex scroll-mt-28">
                <Reveal delay={0.06 * i} className="flex w-full">
                  <article
                    aria-labelledby={`opportunity-${item.id}`}
                    className="flex flex-col w-full rounded-[28px] bg-white/[0.05] ring-1 ring-white/10 p-7 md:p-8"
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EBA937]/15 text-[#F3C56B]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3
                      id={`opportunity-${item.id}`}
                      className="mt-7 text-[1.2rem] md:text-[1.3rem] font-bold leading-snug tracking-[-0.01em] text-white"
                    >
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[1.02rem] font-medium leading-snug text-white/85">
                      {item.statement}
                    </p>
                    <div className="mt-3 space-y-3 flex-1">
                      {item.paragraphs.map((p) => (
                        <p
                          key={p}
                          className="text-[0.95rem] leading-relaxed text-white/60"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                    <a
                      href="#interest"
                      onClick={() => announceInterest(item.type)}
                      className="group mt-7 inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 rounded-full bg-[#EBA937] text-[#10291E] text-[0.92rem] font-bold hover:bg-[#F3C56B] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#EBA937]/40"
                    >
                      {item.button}
                      <ArrowDown
                        className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
