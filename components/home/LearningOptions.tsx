import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Eyebrow, Reveal } from "./motion";
import { learningOptions } from "./content";

/**
 * The three learning options — foundation learning, continuing professional
 * development and facilitated organisational learning — as three tall cards
 * that carry their full copy.
 */
export default function LearningOptions() {
  return (
    <section
      id="learning-options"
      aria-label="Three learning options"
      className="relative bg-white dark:bg-[#0a0a0a] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <Reveal>
          <Eyebrow>Three learning options</Eyebrow>
        </Reveal>
        <div className="mt-8 grid md:grid-cols-3 gap-5 lg:gap-6">
          {learningOptions.map((option, i) => (
            <Reveal key={option.id} delay={0.08 * i} className="flex">
              <article
                aria-labelledby={`option-${option.id}-title`}
                className="group flex flex-col w-full rounded-[28px] overflow-hidden bg-[#F6F8F7] dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 hover:-translate-y-1.5 hover:shadow-[0_40px_80px_-40px_rgba(20,64,47,0.4)] dark:hover:shadow-none transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={option.image}
                    alt={option.imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] dark:brightness-90"
                  />
                  <span className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md text-[0.75rem] font-bold tabular-nums text-[#14402F] dark:text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-7 md:p-8">
                  <h3
                    id={`option-${option.id}-title`}
                    className="text-[1.35rem] md:text-[1.45rem] font-bold leading-[1.15] tracking-[-0.02em] text-gray-900 dark:text-gray-50"
                  >
                    {option.title}
                  </h3>
                  <p className="mt-3 text-[1rem] font-medium leading-snug text-[#2D6A4F] dark:text-[#52b788]">
                    {option.tagline}
                  </p>
                  <div className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-gray-600 dark:text-gray-400">
                    {option.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <div className="mt-auto pt-8">
                    <Link
                      href={option.button.href}
                      className="group/btn inline-flex items-center gap-2 min-h-[46px] px-5 rounded-full bg-white dark:bg-gray-950 ring-1 ring-[#2D6A4F]/25 dark:ring-[#52b788]/35 text-[0.9rem] font-bold text-[#14402F] dark:text-[#52b788] hover:bg-[#2D6A4F] hover:text-white hover:ring-[#2D6A4F] dark:hover:bg-[#52b788] dark:hover:text-gray-950 active:scale-[0.97] transition-[background-color,color,box-shadow,scale] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/30"
                    >
                      {option.button.label}
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
