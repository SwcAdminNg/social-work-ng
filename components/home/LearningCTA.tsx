import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, WordReveal } from "./motion";
import { learningCta } from "./content";

/**
 * "Invest in Your Development. Strengthen Your Contribution." A deep-green
 * tile set into the page, with the statement large on the left and the
 * invitation and button on the right.
 */
export default function LearningCTA() {
  return (
    <section
      aria-labelledby="learning-cta-heading"
      className="relative bg-white dark:bg-[#0a0a0a] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-6 md:pt-32 md:pb-8"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <div
            data-nav-bg="rgba(20, 64, 47, 0.85)"
            data-nav-theme="dark"
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#14402F] dark:bg-[#0f2a20] text-white px-7 py-12 md:px-14 md:py-20 lg:px-20 lg:py-24"
          >
            <div
              className="absolute -right-24 -top-32 w-[30rem] h-[30rem] rounded-full border-[48px] border-white/[0.05] pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -left-20 -bottom-28 w-80 h-80 rounded-full bg-[#EBA937]/15 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-end">
              <h2
                id="learning-cta-heading"
                className="t-h2 font-bold text-white max-w-[16ch]"
              >
                <WordReveal text={learningCta.title} />
              </h2>
              <div>
                <div className="space-y-4 t-body text-white/80">
                  {learningCta.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  <p className="text-[#F3C56B]/90">{learningCta.organisations}</p>
                </div>
                <Link
                  href={learningCta.button.href}
                  className="group mt-8 inline-flex items-center justify-center gap-2 min-h-[54px] px-8 bg-[#EBA937] text-[#10291E] text-[1rem] font-bold rounded-full shadow-lg shadow-black/20 hover:bg-[#f3bb57] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                >
                  {learningCta.button.label}
                  <ArrowRight
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
