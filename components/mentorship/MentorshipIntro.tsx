import { Briefcase, Globe, GraduationCap, UserRound, Users } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { intro, offerings } from "./content";

const icons = [UserRound, GraduationCap, Globe, Users, Briefcase];

/**
 * Why mentorship matters to us, then what we offer: five kinds of
 * support as mint tiles, three across and two wider below on large
 * screens, pairs on tablets with the last spanning the row, stacked on
 * phones.
 */
export default function MentorshipIntro() {
  const [lead, ...rest] = intro.paragraphs;

  return (
    <section
      id="about-mentorship"
      aria-labelledby="intro-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading id="intro-heading" eyebrow={intro.eyebrow} title={intro.title} />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[56ch]">
                {lead}
              </p>
            </Reveal>
            <div className="mt-6 space-y-5">
              {rest.map((p, i) => (
                <Reveal key={p} delay={0.06 * (i + 1)}>
                  <p className="t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div id="offer" className="mt-20 md:mt-28 scroll-mt-28">
          <SectionHeading
            id="offer-heading"
            eyebrow={offerings.eyebrow}
            title={offerings.title}
            align="center"
          />
          <ol className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
            {offerings.items.map((item, i) => {
              const Icon = icons[i];
              const wide = i >= 3;
              const last = i === offerings.items.length - 1;
              return (
                <li
                  key={item.title}
                  className={`flex ${wide ? "lg:col-span-3" : "lg:col-span-2"} ${last ? "sm:col-span-2 lg:col-span-3" : ""}`}
                >
                  <Reveal delay={0.05 * (i % 3)} className="flex w-full">
                    <article className="flex flex-col w-full rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#0F1A14] text-[#2D6A4F] dark:text-[#74c69d] ring-1 ring-black/5 dark:ring-white/10">
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
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9]">
                        {item.text}
                      </p>
                    </article>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
