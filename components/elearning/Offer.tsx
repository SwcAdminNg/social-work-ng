import Link from "next/link";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { approach, offer, platformHref, platformName } from "./content";

// Links the learning platform's name wherever the copy mentions it.
export function Copy({ text }: { text: string }) {
  const parts = text.split(platformName);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <Link
              href={platformHref}
              className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
            >
              {platformName}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

/**
 * "Learning That Strengthens Practice": the offer described in full,
 * with the platform's relationship to SWCL made clear, then the two
 * strands of the approach as numbered rows.
 */
export default function Offer() {
  const [lead, ...rest] = offer.paragraphs;

  return (
    <section
      id="offer"
      aria-labelledby="offer-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="offer-heading"
              eyebrow={offer.eyebrow}
              title={offer.title}
            />
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
                  <p className="t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">
                    <Copy text={p} />
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-16 md:mt-24 border-t border-gray-900/10 dark:border-white/10">
          {approach.strands.map((strand, i) => (
            <li
              key={strand.id}
              id={`approach-${strand.id}`}
              className="grid lg:grid-cols-12 gap-6 lg:gap-16 py-10 md:py-14 border-b border-gray-900/10 dark:border-white/10 scroll-mt-28"
            >
              <Reveal from="left" className="lg:col-span-5">
                <p
                  className="text-[0.78rem] font-bold tracking-[0.18em] text-[#B7791F] dark:text-[#F3C56B]"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 t-h3 font-bold text-gray-900 dark:text-[#ECF2EE]">
                  {strand.title}
                </h3>
                <p className="mt-4 text-[1.05rem] md:text-[1.1rem] leading-[1.5] font-medium text-[#14402F] dark:text-[#C3D1C8] max-w-[40ch]">
                  {strand.statement}
                </p>
              </Reveal>
              <Reveal
                from="right"
                delay={0.08}
                className="lg:col-span-7 lg:pt-10 space-y-5"
              >
                {strand.paragraphs.map((p) => (
                  <p
                    key={p}
                    className="t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]"
                  >
                    {p}
                  </p>
                ))}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
