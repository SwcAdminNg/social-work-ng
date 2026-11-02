import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Globe,
  Lightbulb,
  Presentation,
} from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { expect } from "./content";

const icons = [Presentation, Globe, Lightbulb, ClipboardCheck, Building2];

/**
 * "What You Can Expect". The five features as tiles on the deep-green
 * chapter: three across the top row and two wider ones below on large
 * screens, pairs on tablets with the last spanning the row, stacked on
 * phones. The chapter closes with the invitation to the learning
 * platform, the organisational-training link, and the qualification
 * clarification kept in readable text beside the button.
 */
export default function Expect() {
  const { next } = expect;

  return (
    <section
      id="expect"
      aria-labelledby="expect-heading"
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
          id="expect-heading"
          eyebrow={expect.eyebrow}
          title={expect.title}
          tone="dark"
          align="center"
        />

        <ol className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
          {expect.items.map((item, i) => {
            const Icon = icons[i];
            const wide = i >= 3;
            const last = i === expect.items.length - 1;
            return (
              <li
                key={item.id}
                id={item.id}
                className={`flex scroll-mt-28 ${wide ? "lg:col-span-3" : "lg:col-span-2"} ${last ? "sm:col-span-2 lg:col-span-3" : ""}`}
              >
                <Reveal delay={0.05 * (i % 3)} className="flex w-full">
                  <article
                    aria-labelledby={`expect-${item.id}`}
                    className="flex flex-col w-full rounded-[28px] bg-white/[0.05] ring-1 ring-white/10 p-7 md:p-8"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EBA937]/15 text-[#F3C56B]">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span
                        className="text-[0.75rem] font-bold tabular-nums text-[#F3C56B]"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      id={`expect-${item.id}`}
                      className="mt-7 text-[1.15rem] md:text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-white"
                    >
                      {item.title}
                    </h3>
                    <div className="mt-3 space-y-3">
                      {item.paragraphs.map((p) => (
                        <p key={p} className="text-[0.95rem] leading-relaxed text-white/65">
                          {p}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal className="mt-14 md:mt-20">
          <div
            id="next-step"
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#EBA937] text-[#10291E] p-8 md:p-12 lg:p-14 scroll-mt-28"
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              <div className="lg:col-span-7">
                <h3 className="t-h2 font-bold">{next.title}</h3>
                <div className="mt-5 space-y-4">
                  {next.paragraphs.map((p) => (
                    <p key={p} className="t-body text-[#10291E]/80 max-w-[60ch]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col gap-4 lg:pt-2">
                <Link
                  href={next.primary.href}
                  className="group inline-flex items-center justify-center gap-2.5 w-full min-h-[54px] px-7 rounded-full bg-[#14402F] text-white text-[0.95rem] font-bold hover:bg-[#0c2a1e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14402F]/40"
                >
                  {next.primary.label}
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href={next.secondary.href}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] text-[0.95rem] font-bold text-[#10291E] underline underline-offset-4 decoration-[#10291E]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10291E]"
                >
                  {next.secondary.label}
                </Link>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-[#10291E]/75">
                  {next.clarification}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
