import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { ParallaxImage, Reveal } from "./motion";
import { intro } from "./content";

/**
 * "Building the Knowledge and Capacity Behind Better Services". An
 * editorial spread: heading, call to action and a portrait on the left;
 * the five paragraphs as a comfortable reading column on the right, with
 * the lead set large and the organisation's commitments as a closing strip.
 */
export default function Intro() {
  const [lead, ...rest] = intro.paragraphs;
  const portrait = (className: string) => (
    <ParallaxImage
      src={intro.image}
      alt={intro.imageAlt}
      strength={6}
      position="60% 35%"
      className={`${className} rounded-[28px] shadow-[0_40px_80px_-40px_rgba(20,64,47,0.45)] dark:shadow-none`}
    />
  );

  return (
    <section
      id="about"
      aria-labelledby="intro-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-36 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="intro-heading"
            eyebrow={intro.eyebrow}
            title={intro.title}
          />
          <Reveal delay={0.25} className="mt-8">
            <Link
              href={intro.button.href}
              className="group inline-flex items-center gap-2 min-h-[52px] px-7 bg-[#2D6A4F] text-white text-[1rem] font-bold rounded-full shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#1e4d38] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/40"
            >
              {intro.button.label}
              <ArrowRight
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="mt-14 hidden lg:block">
            {portrait("aspect-[4/5]")}
          </Reveal>
        </div>

        <div className="lg:col-span-7 lg:pt-3">
          <Reveal>
            <p className="t-lead text-gray-900 dark:text-[#ECF2EE] max-w-[58ch]">
              {lead}
            </p>
          </Reveal>
          <div className="mt-9 space-y-6 t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">
            {rest.slice(0, 2).map((p) => (
              <Reveal key={p}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="my-10 lg:hidden">
            {portrait("aspect-[16/11]")}
          </Reveal>
          <div className="mt-6 space-y-6 t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">
            {rest.slice(2).map((p) => (
              <Reveal key={p}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-[#A3B3A9]">
              What we stand for
            </p>
            <ol className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-px bg-gray-200 dark:bg-white/10 rounded-[20px] overflow-hidden ring-1 ring-gray-200 dark:ring-white/10">
              {intro.values.map((value, i) => (
                <li
                  key={value}
                  className="bg-white dark:bg-[#0F1A14] p-5 md:p-4 lg:p-5 min-h-[7.5rem] flex flex-col justify-between last:col-span-2 md:last:col-span-1"
                >
                  <span className="text-[0.75rem] font-bold tabular-nums text-[#B7791F] dark:text-[#F3C56B]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[0.95rem] font-bold leading-snug text-gray-900 dark:text-[#ECF2EE]">
                    {value}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
