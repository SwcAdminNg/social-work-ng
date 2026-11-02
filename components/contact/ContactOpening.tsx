"use client";

import { Eyebrow, Reveal, WordReveal } from "@/components/home/motion";
import { opening } from "./content";

// The page's opening on the mint sheet: the invitation in large type
// and the line that explains what you can write to us about.
export default function ContactOpening() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] pt-12 pb-24 md:pt-20 md:pb-28"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal from="none">
            <Eyebrow className="justify-center mb-6">{opening.eyebrow}</Eyebrow>
          </Reveal>
          <h1
            id="contact-heading"
            className="t-display font-bold text-gray-900 dark:text-[#ECF2EE]"
          >
            <WordReveal text={opening.title} />
            <span className="text-[#EBA937]" aria-hidden="true">
              .
            </span>
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-6 t-lead text-gray-700 dark:text-[#C3D1C8]">
              {opening.tagline}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
