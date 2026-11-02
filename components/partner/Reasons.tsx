import { Handshake, Link2, MapPin, ShieldCheck } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { reasons } from "./content";

const icons = [Link2, MapPin, Handshake, ShieldCheck];

/**
 * "Why Partner With SWCL". Four reasons as white tiles on the mint
 * sheet, two by two from tablets up and stacked on phones.
 */
export default function Reasons() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading
            id="why-heading"
            eyebrow={reasons.eyebrow}
            title={reasons.title}
          />
        </div>
        <ul className="lg:col-span-8 grid sm:grid-cols-2 gap-4 md:gap-5">
          {reasons.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <li key={item.title} className="flex">
                <Reveal delay={0.06 * i} className="flex w-full">
                  <article className="flex flex-col w-full rounded-[28px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-8">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2D6A4F] text-white dark:bg-[#0F1A14] dark:text-[#74c69d] dark:ring-1 dark:ring-white/10">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-7 text-[1.15rem] md:text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]">
                      {item.title}
                    </h3>
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
