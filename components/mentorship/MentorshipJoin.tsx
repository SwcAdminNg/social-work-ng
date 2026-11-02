import { ArrowDown, Check } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { join } from "./content";

/**
 * Who can join, as a ticked list, and how it works, as three numbered
 * steps, side by side on the mint sheet with the link to the form.
 */
export default function MentorshipJoin() {
  return (
    <section
      id="join"
      aria-labelledby="join-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading id="join-heading" eyebrow={join.eyebrow} title={join.title} align="center" />

        <div className="mt-14 md:mt-16 grid lg:grid-cols-2 gap-5 md:gap-6">
          <Reveal from="left">
            <div className="h-full rounded-[32px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-10">
              <h3 className="t-h3 font-bold text-gray-900 dark:text-[#ECF2EE]">Who Can Join?</h3>
              <p className="mt-3 t-body text-gray-600 dark:text-[#A3B3A9]">{join.whoLead}</p>
              <ul className="mt-6 space-y-4">
                {join.who.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="flex items-center justify-center w-7 h-7 shrink-0 rounded-full bg-[#2D6A4F] text-white mt-0.5">
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="text-[1.02rem] leading-snug font-medium text-gray-800 dark:text-[#D7E2DB]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal from="right" delay={0.08}>
            <div className="h-full rounded-[32px] bg-[#14402F] text-white p-8 md:p-10">
              <h3 className="t-h3 font-bold">How It Works</h3>
              <ol className="mt-6 space-y-6">
                {join.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className="text-[0.78rem] font-bold tracking-[0.18em] text-[#F3C56B] pt-1.5"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="text-[1.1rem] font-bold leading-snug">{step.title}</h4>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-white/70">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href={join.button.href}
                className="group mt-8 inline-flex items-center gap-2.5 min-h-[50px] px-6 rounded-full bg-[#EBA937] text-[#10291E] text-[0.92rem] font-bold hover:bg-[#F3C56B] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#EBA937]/40"
              >
                {join.button.label}
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
