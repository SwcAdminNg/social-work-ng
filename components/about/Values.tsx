import { Eye, HeartHandshake, Scale, ShieldCheck, Users } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { values } from "./content";

const icons = [HeartHandshake, Scale, ShieldCheck, Users, Eye];

/**
 * "The Values That Guide Our Work". Five values in full, each a mint tile
 * with its icon, the principle in a line and the practice beneath it.
 * Three across the top row and two wider ones below on large screens; in
 * pairs on tablets with the last spanning the row; stacked on phones.
 */
export default function Values() {
  return (
    <section
      id="values"
      aria-labelledby="values-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="values-heading"
              eyebrow={values.eyebrow}
              title={values.title}
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead text-gray-900 dark:text-[#ECF2EE] max-w-[56ch]">
                {values.intro}
              </p>
            </Reveal>
          </div>
        </div>

        <ol className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
          {values.items.map((value, i) => {
            const Icon = icons[i];
            const span = i < 3 ? "lg:col-span-2" : "lg:col-span-3";
            const last = i === values.items.length - 1 ? "sm:col-span-2" : "";
            return (
              <li key={value.title} className={`flex ${last} ${span}`}>
                <Reveal delay={0.05 * (i % 3)} className="flex w-full">
                  <article
                    aria-labelledby={`value-${i}`}
                    className="flex flex-col w-full rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-8"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0F1A14] text-[#2D6A4F] dark:text-[#74c69d] ring-1 ring-black/5 dark:ring-white/10">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-[0.75rem] font-bold tabular-nums text-[#B7791F] dark:text-[#F3C56B]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      id={`value-${i}`}
                      className="mt-7 text-[1.15rem] md:text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]"
                    >
                      {value.title}
                    </h3>
                    <p className="mt-3 text-[1.02rem] font-medium leading-snug text-gray-800 dark:text-[#D7E2DB]">
                      {value.statement}
                    </p>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9]">
                      {value.text}
                    </p>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
