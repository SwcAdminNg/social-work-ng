"use client";

import { Eyebrow, Reveal, WordReveal } from "@/components/home/motion";

/**
 * A plain page opening on the mint sheet: label, the page named in
 * large type with the gold full stop, and the line beneath it. Used by
 * the pages that open onto a list or a document rather than a photo.
 */
export default function PageOpening({
  id,
  eyebrow,
  title,
  tagline,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  // Anything to show beneath the tagline, e.g. a "last updated" chip.
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] pt-12 pb-24 md:pt-20 md:pb-28"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal from="none">
            <Eyebrow className="justify-center mb-6">{eyebrow}</Eyebrow>
          </Reveal>
          <h1 id={id} className="t-display font-bold text-gray-900 dark:text-[#ECF2EE]">
            <WordReveal text={title} />
            <span className="text-[#EBA937]" aria-hidden="true">
              .
            </span>
          </h1>
          {tagline && (
            <Reveal delay={0.3}>
              <p className="mt-6 t-lead text-gray-700 dark:text-[#C3D1C8]">{tagline}</p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.4}>
              <div className="mt-6">{children}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
