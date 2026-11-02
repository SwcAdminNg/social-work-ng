import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { faqs } from "./content";

/**
 * "Understanding SWCL and How We Can Support You". Every question is shown
 * with its answer — nothing to click open — each settling into view as the
 * reader scrolls, with the heading pinned alongside on large screens.
 */
export default function HomeFAQ() {
  return (
    <section
      id="faqs"
      aria-labelledby="faqs-heading"
      className="relative bg-white dark:bg-[#0a0a0a] pt-20 pb-24 md:pt-28 md:pb-36 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-10 lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            id="faqs-heading"
            eyebrow={faqs.eyebrow}
            title={faqs.title}
          />
          <Reveal delay={0.25}>
            <p className="mt-6 t-body text-gray-600 dark:text-gray-400">
              Can’t find what you’re looking for?{" "}
              <Link
                href="#contact"
                className="font-semibold text-[#2D6A4F] dark:text-[#52b788] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
              >
                Send us an enquiry
              </Link>
              .
            </p>
          </Reveal>
        </div>

        <ol className="border-t border-gray-200 dark:border-white/10">
          {faqs.items.map((item, i) => (
            <li
              key={item.q}
              className="border-b border-gray-200 dark:border-white/10"
            >
              <Reveal amount={0.15}>
                <div className="grid grid-cols-[2.5rem_1fr] gap-4 py-7 md:py-8">
                  <span className="pt-1 text-[0.8rem] font-bold tabular-nums text-[#B7791F] dark:text-[#F3C56B]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[1.05rem] md:text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-gray-900 dark:text-gray-50">
                      {item.q}
                    </h3>
                    <div className="mt-3 space-y-3 text-[0.98rem] leading-relaxed text-gray-600 dark:text-gray-400 max-w-[62ch]">
                      {item.a.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
