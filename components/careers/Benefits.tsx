import { HeartHandshake, Lightbulb, Users } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { benefits } from "./content";

const icons = [Lightbulb, Users, HeartHandshake];

/**
 * "Purposeful Work. Thoughtful Collaboration." Three benefit columns as
 * mint tiles on the white sheet, each with its one-line idea and the
 * fuller explanation; stacked on phones.
 */
export default function Benefits() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          id="benefits-heading"
          eyebrow={benefits.eyebrow}
          title={benefits.title}
          align="center"
        />
        <ul className="mt-14 md:mt-16 grid md:grid-cols-3 gap-4 md:gap-5">
          {benefits.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <li key={item.title} className="flex">
                <Reveal delay={0.06 * i} className="flex w-full">
                  <article className="flex flex-col w-full rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-8">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0F1A14] text-[#2D6A4F] dark:text-[#74c69d] ring-1 ring-black/5 dark:ring-white/10">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
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
        </ul>
      </div>
    </section>
  );
}
