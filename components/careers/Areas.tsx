import { ArrowDown, FlaskConical, Megaphone, PenTool, Presentation } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { areas } from "./content";

const icons = [Presentation, FlaskConical, PenTool, Megaphone];

/**
 * "Ways to Contribute". The four areas of interest as numbered rows on
 * the mint sheet, each labelled as an area of interest rather than a
 * vacancy, with the link to the expression-of-interest form beneath.
 */
export default function Areas() {
  return (
    <section
      id="areas"
      aria-labelledby="areas-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="areas-heading"
              eyebrow={areas.eyebrow}
              title={areas.title}
            />
            <Reveal delay={0.1}>
              <p className="mt-5 inline-flex items-center rounded-full bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-wide text-[#14402F] dark:text-[#C3D1C8]">
                {areas.note}
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pt-3 space-y-5">
            {areas.paragraphs.map((p, i) => (
              <Reveal key={p} delay={0.06 * i}>
                <p
                  className={
                    i === 0
                      ? "t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[56ch]"
                      : "t-body text-gray-600 dark:text-[#A3B3A9] max-w-[62ch]"
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <ol className="mt-14 md:mt-20 grid sm:grid-cols-2 gap-4 md:gap-5">
          {areas.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <li key={item.id} id={`area-${item.id}`} className="flex scroll-mt-28">
                <Reveal delay={0.05 * (i % 2)} className="flex w-full">
                  <article className="flex flex-col w-full rounded-[28px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#EBA937]/15 text-[#B7791F] dark:text-[#F3C56B]">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span
                        className="text-[0.75rem] font-bold tabular-nums text-[#B7791F] dark:text-[#F3C56B]"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-7 text-[1.15rem] md:text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[1.02rem] font-medium leading-snug text-gray-800 dark:text-[#D7E2DB]">
                      {item.statement}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9]">
                      {item.text}
                    </p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal delay={0.1} className="mt-10 md:mt-12">
          <a
            href={areas.link.href}
            className="group inline-flex items-center gap-2.5 min-h-[54px] px-7 rounded-full bg-[#14402F] text-white text-[0.95rem] font-bold hover:bg-[#0c2a1e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14402F]/40"
          >
            {areas.link.label}
            <ArrowDown
              className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
