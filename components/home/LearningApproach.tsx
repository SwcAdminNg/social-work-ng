import {
  Brain,
  Globe,
  Handshake,
  Lightbulb,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import { Eyebrow, ParallaxImage, Reveal } from "./motion";
import { learningApproach } from "./content";

const icons = [
  Lightbulb,
  Brain,
  MessageCircle,
  ShieldCheck,
  Globe,
  RefreshCw,
  Handshake,
];

/**
 * "Learning That Strengthens What You Do in Practice". A deep-green chapter:
 * the approach in two paragraphs, the e-learning platform as a photographic
 * feature, and the seven things the learning supports you to do as a grid
 * of tiles, closed by the section's final statement in gold.
 */
export default function LearningApproach() {
  const [lead, second] = learningApproach.paragraphs;
  const { platform } = learningApproach;

  return (
    <section
      id="learning"
      aria-labelledby="learning-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      {/* Soft light, purely decorative */}
      <div
        className="absolute -top-40 right-[-10%] w-[36rem] h-[36rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[32rem] h-[32rem] rounded-full bg-[#52b788]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="learning-heading"
              eyebrow={learningApproach.eyebrow}
              title={learningApproach.title}
              tone="dark"
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead text-white/95 max-w-[58ch]">{lead}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 t-body text-white/70 max-w-[64ch]">{second}</p>
            </Reveal>
          </div>
        </div>

        {/* The platform */}
        <Reveal className="mt-16 md:mt-24">
          <div className="grid lg:grid-cols-2 rounded-[32px] overflow-hidden bg-white/[0.05] ring-1 ring-white/10">
            <ParallaxImage
              src={platform.image}
              alt={platform.imageAlt}
              strength={6}
              className="aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[460px]"
              imgClassName="brightness-95"
            />
            <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center">
              <Eyebrow tone="gold">Our e-learning platform</Eyebrow>
              <p className="mt-5 t-h3 font-bold text-white">{platform.name}</p>
              <div className="mt-6 space-y-4 t-body text-white/75">
                {platform.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* What the learning supports you to do */}
        <div className="mt-20 md:mt-28">
          <Reveal>
            <h3 className="text-[1.35rem] md:text-[1.6rem] font-medium tracking-[-0.02em] text-white">
              {learningApproach.supports}
            </h3>
          </Reveal>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningApproach.outcomes.map((o, i) => {
              const Icon = icons[i];
              return (
                <li key={o.title} className="flex">
                  <Reveal delay={0.05 * (i % 4)} className="flex w-full">
                    <div className="group flex flex-col w-full rounded-[24px] bg-white/[0.05] ring-1 ring-white/10 p-6 hover:bg-white/[0.09] transition-colors duration-300">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#EBA937]/15 text-[#F3C56B]">
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <span className="text-[0.75rem] font-bold tabular-nums text-white/40">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-7 text-[1.05rem] font-bold leading-snug text-white">
                        {o.title}
                      </p>
                      <p className="mt-2 text-[0.93rem] leading-relaxed text-white/65">
                        {o.text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
            <li className="flex sm:col-span-2 lg:col-span-1">
              <Reveal delay={0.15} className="flex w-full">
                <div className="flex flex-col justify-between w-full rounded-[24px] bg-[#EBA937] text-[#10291E] p-6">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#10291E]/70">
                    For individuals and teams
                  </span>
                  <p className="mt-10 text-[1.05rem] font-medium leading-snug">
                    {learningApproach.closing}
                  </p>
                </div>
              </Reveal>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
