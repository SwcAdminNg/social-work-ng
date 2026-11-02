import { Compass, Telescope } from "lucide-react";
import { Eyebrow, Reveal } from "@/components/home/motion";
import { mission, vision } from "./content";

/**
 * Vision and mission side by side: the vision on deep green, the mission
 * on mint, each arriving from its own side of the page. They stack on
 * phones, vision first.
 */
export default function VisionMission() {
  return (
    <section
      aria-label="Our vision and mission"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-5 md:gap-6">
        <Reveal from="left" className="flex">
          <article
            aria-labelledby="vision-heading"
            className="flex flex-col w-full rounded-[32px] bg-[#14402F] text-white p-8 md:p-10 lg:p-12 shadow-[0_40px_80px_-40px_rgba(20,64,47,0.5)] dark:shadow-none"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#EBA937]/15 text-[#F3C56B]">
              <Telescope className="w-6 h-6" aria-hidden="true" />
            </span>
            <Eyebrow tone="gold" className="mt-10">
              <span id="vision-heading" role="heading" aria-level={2}>
                {vision.label}
              </span>
            </Eyebrow>
            <p className="mt-5 text-[1.3rem] md:text-[1.5rem] lg:text-[1.6rem] leading-[1.3] tracking-[-0.02em] font-medium text-white">
              {vision.statement}
            </p>
          </article>
        </Reveal>

        <Reveal from="right" delay={0.08} className="flex">
          <article
            aria-labelledby="mission-heading"
            className="flex flex-col w-full rounded-[32px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-8 md:p-10 lg:p-12"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#557F8F]/15 text-[#557F8F] dark:bg-[#557F8F]/25 dark:text-[#9CC4D2]">
              <Compass className="w-6 h-6" aria-hidden="true" />
            </span>
            <Eyebrow className="mt-10">
              <span id="mission-heading" role="heading" aria-level={2}>
                {mission.label}
              </span>
            </Eyebrow>
            <p className="mt-5 text-[1.3rem] md:text-[1.5rem] lg:text-[1.6rem] leading-[1.3] tracking-[-0.02em] font-medium text-gray-900 dark:text-[#ECF2EE]">
              {mission.statement}
            </p>
            <p className="mt-6 t-body text-gray-600 dark:text-[#A3B3A9]">
              {mission.paragraph}
            </p>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
