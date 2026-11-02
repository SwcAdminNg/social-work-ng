"use client";

import Link from "next/link";
import { Eyebrow, Reveal, WordReveal } from "@/components/home/motion";
import OpeningPhoto from "@/components/shared/OpeningPhoto";
import { opening } from "./content";

/**
 * The page's opening: the organisation named in large type, its tagline,
 * and the photograph of a facilitated discussion set into the page whole.
 */
export default function AboutOpening() {
  const [first, second] = opening.paragraphs;

  return (
    <section
      aria-labelledby="about-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] pt-12 pb-28 md:pt-20 md:pb-32"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal from="none">
            <Eyebrow className="justify-center mb-6">{opening.eyebrow}</Eyebrow>
          </Reveal>
          <h1
            id="about-heading"
            className="t-display font-light text-gray-900 dark:text-[#ECF2EE]"
          >
            <WordReveal text={opening.titleLead} />{" "}
            <strong className="font-bold">
              <WordReveal text={opening.titleBold} delay={0.08} />
            </strong>
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

        <OpeningPhoto
          src={opening.image}
          alt={opening.imageAlt}
          width={1672}
          height={941}
          note={opening.imageNote}
          className="mt-12 md:mt-16"
        />

        <div className="mt-12 md:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[56ch]">
                {first}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 t-body text-gray-600 dark:text-[#A3B3A9] max-w-[62ch]">
                {second}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="lg:col-span-5 lg:pt-2">
            <dl className="divide-y divide-gray-900/10 dark:divide-white/10 border-y border-gray-900/10 dark:border-white/10">
              {opening.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-4 py-4"
                >
                  <dt className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9] pt-1">
                    {fact.label}
                  </dt>
                  <dd className="text-[0.98rem] font-medium text-gray-900 dark:text-[#ECF2EE]">
                    {fact.href ? (
                      <Link
                        href={fact.href}
                        className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                      >
                        {fact.value}
                      </Link>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
