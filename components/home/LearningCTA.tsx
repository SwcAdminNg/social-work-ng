import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ParallaxImage, Reveal, WordReveal } from "./motion";
import { learningCta } from "./content";

/**
 * "Invest in Your Development. Strengthen Your Contribution." A photographic
 * tile set into the page: learners at work fill the frame, a deep-green
 * wash keeps the words legible, and the photograph drifts gently as the
 * reader scrolls. The words sit on the left on wide screens and beneath the
 * picture on phones.
 */
export default function LearningCTA() {
  return (
    <section
      aria-labelledby="learning-cta-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-6 md:pt-32 md:pb-8"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <div
            data-nav-bg="rgba(20, 64, 47, 0.85)"
            data-nav-theme="dark"
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#14402F] text-white min-h-[560px] lg:min-h-[600px] flex flex-col justify-end"
          >
            <div className="absolute inset-0">
              <ParallaxImage
                src={learningCta.image}
                alt={learningCta.imageAlt}
                strength={6}
                position="62% 40%"
                className="h-full w-full"
              />
            </div>
            {/* Phones: picture clear at the top, wash where the words sit */}
            <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-[#14402F] from-30% via-[#14402F]/85 via-52% to-[#14402F]/0" />
            {/* Wide screens: wash from the left, picture open on the right */}
            <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#14402F] from-30% via-[#14402F]/80 via-52% to-[#14402F]/0" />
            <div className="absolute inset-x-0 bottom-0 h-40 hidden lg:block bg-gradient-to-t from-[#14402F]/70 to-transparent" />

            <div className="relative grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] px-7 pt-[58%] pb-10 md:px-12 md:pt-[40%] md:pb-12 lg:px-16 lg:py-20 lg:pt-20 lg:min-h-[600px] lg:items-end">
              <div>
                <h2
                  id="learning-cta-heading"
                  className="t-h2 font-bold text-white max-w-[18ch] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]"
                >
                  <WordReveal text={learningCta.title} />
                </h2>
                <div className="mt-6 space-y-3 text-[0.98rem] leading-relaxed text-white/85 max-w-[56ch]">
                  {learningCta.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  <p className="text-[#F3C56B]">{learningCta.organisations}</p>
                </div>
                <Link
                  href={learningCta.button.href}
                  className="group mt-8 inline-flex items-center justify-center gap-2 min-h-[54px] px-8 bg-[#EBA937] text-[#10291E] text-[1rem] font-bold rounded-full shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] hover:bg-[#f3bb57] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
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
