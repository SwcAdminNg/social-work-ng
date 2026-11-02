"use client";

import { Eyebrow, Reveal, WordReveal } from "@/components/home/motion";
import OpeningPhoto from "@/components/shared/OpeningPhoto";
import { opening } from "./content";

/**
 * The two-column introduction: the invitation in large type on the
 * left, the introduction on the right, then the photograph of three
 * colleagues planning learning resources, shown whole beneath.
 */
export default function CareersOpening() {
  const [first, ...rest] = opening.paragraphs;

  return (
    <section
      aria-labelledby="careers-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] pt-12 pb-28 md:pt-20 md:pb-32"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <Reveal from="none">
              <Eyebrow className="mb-6">{opening.eyebrow}</Eyebrow>
            </Reveal>
            <h1
              id="careers-heading"
              className="t-display font-bold text-gray-900 dark:text-[#ECF2EE]"
            >
              {opening.titleLines.map((line, i) => (
                <span key={line} className="block">
                  <WordReveal text={line} delay={i * 0.14} />
                  <span className="text-[#EBA937]" aria-hidden="true">
                    .
                  </span>
                </span>
              ))}
            </h1>
          </div>
          <div className="lg:col-span-6 lg:pt-14">
            <Reveal delay={0.25}>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[52ch]">
                {first}
              </p>
            </Reveal>
            <div className="mt-6 space-y-5">
              {rest.map((p, i) => (
                <Reveal key={p} delay={0.32 + i * 0.07}>
                  <p className="t-body text-gray-600 dark:text-[#A3B3A9] max-w-[60ch]">
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <OpeningPhoto
          src={opening.image}
          alt={opening.imageAlt}
          width={opening.imageWidth}
          height={opening.imageHeight}
          note={opening.imageNote}
          className="mt-14 md:mt-20"
        />
      </div>
    </section>
  );
}
