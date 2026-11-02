import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Globe,
  Handshake,
  Lightbulb,
  MessageCircle,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Users,
  Building2,
} from "lucide-react";
import ExpandableCopy from "./ExpandableCopy";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { learningApproach, learningOptions } from "./content";

const outcomeIcons = [
  Lightbulb,
  Brain,
  MessageCircle,
  ShieldCheck,
  Globe,
  RefreshCw,
  Handshake,
];

const optionIcons = [Monitor, Users, Building2];

export default function Learning() {
  return (
    <section
      id="learning"
      aria-labelledby="learning-heading"
      className="scroll-mt-24 bg-white dark:bg-[#0a0a0a] py-20 md:py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Learning approach */}
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-start">
          <Reveal from="left" className="lg:sticky lg:top-28">
            <SectionHeading
              id="learning-heading"
              eyebrow={learningApproach.eyebrow}
              title={learningApproach.title}
              align="left"
            >
              {learningApproach.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </SectionHeading>
          </Reveal>

          <Reveal from="up" scale={0.94}>
            <div className="rounded-3xl bg-[#14402F] dark:bg-[#0f2a20] p-7 sm:p-9 text-white shadow-2xl shadow-[#14402F]/20 dark:shadow-none">
              <h3 className="text-[1.5rem] font-bold tracking-[-0.02em]">
                {learningApproach.listTitle}
              </h3>
              <ul className="mt-6 grid gap-5">
                {learningApproach.outcomes.map((o, i) => {
                  const Icon = outcomeIcons[i];
                  return (
                    <li key={o.title}>
                      <Reveal
                        from="right"
                        delay={0.06 * i}
                        className="flex gap-4"
                      >
                        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-white/10 text-[#EBA937]">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-bold text-[0.98rem]">{o.title}</p>
                          <p className="mt-0.5 text-[0.9rem] leading-relaxed text-white/75">
                            {o.text}
                          </p>
                        </div>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-7 pt-6 border-t border-white/15 text-[0.92rem] leading-relaxed text-white/85">
                {learningApproach.closing}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Learning options */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningOptions.map((option, i) => {
            const Icon = optionIcons[i];
            return (
              <Reveal
                key={option.id}
                from="up"
                delay={0.12 * i}
                scale={0.96}
                className="flex"
              >
                <article
                  aria-labelledby={`option-${option.id}-title`}
                  className="group flex flex-col w-full bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-gray-200/70 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative">
                    <div className="aspect-[16/9] overflow-hidden rounded-t-3xl">
                      <img
                        src={option.image}
                        alt={option.imageAlt}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 dark:brightness-90"
                      />
                    </div>
                    <span className="absolute left-6 -bottom-7 flex items-center justify-center w-14 h-14 rounded-full bg-[#2D6A4F] text-white ring-4 ring-white dark:ring-gray-900 shadow-lg">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-6 pt-11">
                    <h3
                      id={`option-${option.id}-title`}
                      className="text-[1.3rem] font-bold leading-snug tracking-[-0.02em] text-gray-900 dark:text-gray-50"
                    >
                      {option.title}
                    </h3>
                    <p className="mt-2 text-[0.9rem] font-medium text-[#2D6A4F] dark:text-[#52b788] leading-snug">
                      {option.tagline}
                    </p>
                    <ExpandableCopy
                      paragraphs={option.paragraphs}
                      className="mt-4 text-[0.9rem] leading-relaxed text-gray-600 dark:text-gray-400"
                    />
                    <div className="mt-auto pt-6">
                      <Link
                        href={option.button.href}
                        className="group/btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#2D6A4F]/30 dark:border-[#52b788]/40 text-[0.85rem] font-bold text-[#2D6A4F] dark:text-[#52b788] hover:bg-[#2D6A4F] hover:text-white dark:hover:bg-[#52b788] dark:hover:text-gray-900 active:scale-[0.97] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
                      >
                        {option.button.label}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
